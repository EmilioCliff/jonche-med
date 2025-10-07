package postgres

import (
	"context"
	"database/sql"
	"errors"
	"strings"

	"github.com/EmilioCliff/jonche-med/internal/postgres/generated"
	"github.com/EmilioCliff/jonche-med/internal/repository"
	"github.com/EmilioCliff/jonche-med/pkg"
	"github.com/jackc/pgx/v5/pgtype"
)

var _ repository.UserRepository = (*UserRepository)(nil)

type UserRepository struct {
	queries *generated.Queries
	db      *Store
}

func NewUserRepository(db *Store) *UserRepository {
	return &UserRepository{
		db:      db,
		queries: generated.New(db.pool),
	}
}

func (ur *UserRepository) Create(ctx context.Context, user *repository.User, defaultPassword string) (*repository.User, error) {
	err := ur.db.ExecTx(ctx, func(q *generated.Queries) error {
		pgUser, err := q.CreateUser(ctx, generated.CreateUserParams{
			Name:        user.Name,
			Email:       user.Email,
			PhoneNumber: user.PhoneNumber,
			Role:        user.Role,
			Password:    defaultPassword,
		})
		if err != nil {
			if pkg.PgxErrorCode(err) == pkg.UNIQUE_VIOLATION {
				return pkg.Errorf(pkg.ALREADY_EXISTS_ERROR, "unique violation: %s", err.Error())
			}
			return pkg.Errorf(pkg.INTERNAL_ERROR, "failed to create user: %s", err.Error())
		}
		user.ID = uint32(pgUser.ID)
		user.Deleted = pgUser.Deleted
		user.CreatedAt = pgUser.CreatedAt

		stats, err := q.GetStats(ctx)
		if err != nil {
			return pkg.Errorf(pkg.INTERNAL_ERROR, "failed to get stats: %s", err.Error())
		}

		_, err = q.UpdateStats(ctx, generated.UpdateStatsParams{
			TotalUsers: pgtype.Int8{Valid: true, Int64: stats.TotalUsers + 1},
		})
		if err != nil {
			return pkg.Errorf(pkg.INTERNAL_ERROR, "failed to update stats: %s", err.Error())
		}

		return nil
	})

	return user, err
}

func (ur *UserRepository) GetByID(ctx context.Context, id int64) (*repository.User, error) {
	pgUser, err := ur.queries.GetUserByID(ctx, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, pkg.Errorf(pkg.NOT_FOUND_ERROR, "user with id %d not found", id)
		}
		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to get user by id: %s", err.Error())
	}

	return pgUserToRepoUser(pgUser), nil
}

func (ur *UserRepository) GetByEmail(ctx context.Context, email string) (*repository.User, error) {
	pgUser, err := ur.queries.GetUserByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, pkg.Errorf(pkg.NOT_FOUND_ERROR, "user with email %s not found", email)
		}
		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to get user by email: %s", err.Error())
	}

	return pgUserToRepoUser(pgUser), nil
}

func (ur *UserRepository) GetUserInternalByEmail(ctx context.Context, email string) (*repository.User, string, string, error) {
	pgUser, err := ur.queries.GetUserByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, "", "", pkg.Errorf(pkg.NOT_FOUND_ERROR, "user with email %s not found", email)
		}
		return nil, "", "", pkg.Errorf(pkg.INTERNAL_ERROR, "failed to get user by email: %s", err.Error())
	}

	return pgUserToRepoUser(pgUser), pgUser.Password, pgUser.RefreshToken.String, nil
}

func (ur *UserRepository) Update(ctx context.Context, id int64, userUpdate *repository.UserUpdate) (*repository.User, error) {
	params := generated.UpdateUserParams{
		ID:           id,
		Name:         pgtype.Text{Valid: false},
		Email:        pgtype.Text{Valid: false},
		PhoneNumber:  pgtype.Text{Valid: false},
		Role:         pgtype.Text{Valid: false},
		Password:     pgtype.Text{Valid: false},
		RefreshToken: pgtype.Text{Valid: false},
	}

	if userUpdate.Name != nil {
		params.Name = pgtype.Text{String: *userUpdate.Name, Valid: true}
	}
	if userUpdate.Email != nil {
		params.Email = pgtype.Text{String: *userUpdate.Email, Valid: true}
	}
	if userUpdate.PhoneNumber != nil {
		params.PhoneNumber = pgtype.Text{String: *userUpdate.PhoneNumber, Valid: true}
	}
	if userUpdate.Role != nil {
		params.Role = pgtype.Text{String: *userUpdate.Role, Valid: true}
	}
	if userUpdate.Password != nil {
		params.Password = pgtype.Text{String: *userUpdate.Password, Valid: true}
	}
	if userUpdate.RefreshToken != nil {
		params.RefreshToken = pgtype.Text{String: *userUpdate.RefreshToken, Valid: true}
	}

	pgUser, err := ur.queries.UpdateUser(ctx, params)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, pkg.Errorf(pkg.NOT_FOUND_ERROR, "user with id %d not found", id)
		}
		if pkg.PgxErrorCode(err) == pkg.UNIQUE_VIOLATION {
			return nil, pkg.Errorf(pkg.ALREADY_EXISTS_ERROR, "unique violation: %s", err.Error())
		}
		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to update user: %s", err.Error())
	}

	return pgUserToRepoUser(pgUser), nil
}

func (ur *UserRepository) Delete(ctx context.Context, id int64) error {
	err := ur.db.ExecTx(ctx, func(q *generated.Queries) error {
		err := q.DeleteUser(ctx, id)
		if err != nil {
			return pkg.Errorf(pkg.INTERNAL_ERROR, "failed to delete user: %s", err.Error())
		}

		stats, err := q.GetStats(ctx)
		if err != nil {
			return pkg.Errorf(pkg.INTERNAL_ERROR, "failed to get stats: %s", err.Error())
		}

		_, err = q.UpdateStats(ctx, generated.UpdateStatsParams{
			TotalUsers: pgtype.Int8{Valid: true, Int64: stats.TotalUsers - 1},
		})
		if err != nil {
			return pkg.Errorf(pkg.INTERNAL_ERROR, "failed to update stats: %s", err.Error())
		}

		return nil
	})

	return err
}

func (ur *UserRepository) List(ctx context.Context, filter *repository.UserFilter) ([]*repository.User, *pkg.Pagination, error) {
	listParams := generated.ListUsersParams{
		Limit:  int32(filter.Pagination.PageSize),
		Offset: pkg.Offset(filter.Pagination.Page, filter.Pagination.PageSize),
		Search: pgtype.Text{Valid: false},
		Role:   pgtype.Text{Valid: false},
	}

	countParams := generated.ListUsersCountParams{
		Search: pgtype.Text{Valid: false},
		Role:   pgtype.Text{Valid: false},
	}

	if filter.Search != nil {
		s := strings.ToLower(*filter.Search)
		listParams.Search = pgtype.Text{String: "%" + s + "%", Valid: true}
		countParams.Search = pgtype.Text{String: "%" + s + "%", Valid: true}
	}

	if filter.Role != nil {
		listParams.Role = pgtype.Text{String: *filter.Role, Valid: true}
		countParams.Role = pgtype.Text{String: *filter.Role, Valid: true}
	}

	pgUsers, err := ur.queries.ListUsers(ctx, listParams)
	if err != nil {
		return nil, nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to list users: %s", err.Error())
	}

	totalCount, err := ur.queries.ListUsersCount(ctx, countParams)
	if err != nil {
		return nil, nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to count users: %s", err.Error())
	}

	users := make([]*repository.User, 0, len(pgUsers))
	for _, pgUser := range pgUsers {
		users = append(users, pgUserToRepoUser(pgUser))
	}

	return users, pkg.CalculatePagination(uint32(totalCount), filter.Pagination.PageSize, filter.Pagination.Page), nil
}

func pgUserToRepoUser(pgUser generated.User) *repository.User {
	return &repository.User{
		ID:          uint32(pgUser.ID),
		Name:        pgUser.Name,
		Email:       pgUser.Email,
		PhoneNumber: pgUser.PhoneNumber,
		Role:        pgUser.Role,
		Deleted:     pgUser.Deleted,
		CreatedAt:   pgUser.CreatedAt,
	}
}
