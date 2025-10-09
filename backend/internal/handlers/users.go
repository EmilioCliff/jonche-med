package handlers

import (
	"net/http"

	"github.com/EmilioCliff/jonche-med/internal/repository"
	"github.com/EmilioCliff/jonche-med/pkg"
	"github.com/gin-gonic/gin"
)

type createUserRequest struct {
	Name        string `json:"name" binding:"required"`
	Email       string `json:"email" binding:"required,email"`
	PhoneNumber string `json:"phone_number" binding:"required"`
	Role        string `json:"role" binding:"required,oneof=admin staff"`
}

func (s *Server) createUserHandler(ctx *gin.Context) {
	var req createUserRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))
		return
	}

	user := &repository.User{
		Name:        req.Name,
		Email:       req.Email,
		PhoneNumber: req.PhoneNumber,
		Role:        req.Role,
	}

	// get user from context
	authPayload, ok := ctx.Get(authorizationPayloadKey)
	if !ok {
		ctx.JSON(http.StatusInternalServerError, errorResponse(pkg.Errorf(pkg.INTERNAL_ERROR, "failed to get auth payload")))
		return
	}
	payload := authPayload.(*pkg.Payload)

	if payload.Role != "admin" {
		ctx.JSON(http.StatusForbidden, errorResponse(pkg.Errorf(pkg.FORBIDDEN_ERROR, "only admin users can create other users")))
		return
	}

	hashPassword, err := pkg.GenerateHashPassword(s.config.DEFAULT_USER_PASSWORD, s.config.PASSWORD_COST)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(pkg.Errorf(pkg.INTERNAL_ERROR, "failed to hash password: %s", err.Error())))
		return
	}

	createdUser, err := s.repo.UserRepository.Create(ctx, user, hashPassword)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	// Invalidate users cache

	ctx.JSON(http.StatusOK, gin.H{"data": createdUser})
}

func (s *Server) getUserHandler(ctx *gin.Context) {
	id, err := pkg.StringToInt64(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, "invalid user ID: %s", err.Error())))
		return
	}

	user, err := s.repo.UserRepository.GetByID(ctx, id)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": user})
}

func (s *Server) updateUserHandler(ctx *gin.Context) {
	id, err := pkg.StringToInt64(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, "invalid user ID: %s", err.Error())))
		return
	}

	var req repository.UserUpdate
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))
		return
	}

	req.RefreshToken = nil // prevent updating refresh token
	req.Password = nil     // prevent updating password here

	// get user from context
	authPayload, ok := ctx.Get(authorizationPayloadKey)
	if !ok {
		ctx.JSON(http.StatusInternalServerError, errorResponse(pkg.Errorf(pkg.INTERNAL_ERROR, "failed to get auth payload")))
		return
	}
	payload := authPayload.(*pkg.Payload)

	if payload.UserID != uint32(id) && payload.Role != repository.ADMIN_ROLE {
		ctx.JSON(http.StatusForbidden, errorResponse(pkg.Errorf(pkg.FORBIDDEN_ERROR, "users can only update their own profile")))
		return
	}

	if req.Role != nil && payload.Role != repository.ADMIN_ROLE && *req.Role != payload.Role {
		ctx.JSON(http.StatusForbidden, errorResponse(pkg.Errorf(pkg.FORBIDDEN_ERROR, "only admin users can update other users roles")))
		return
	}

	updatedUser, err := s.repo.UserRepository.Update(ctx, id, &req)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	// Invalidate users cache

	ctx.JSON(http.StatusOK, gin.H{"data": updatedUser})
}

func (s *Server) changePasswordHandler(ctx *gin.Context) {
	id, err := pkg.StringToInt64(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, "invalid user ID: %s", err.Error())))
		return
	}

	var req struct {
		OldPassword string `json:"old_password" binding:"required"`
		Password    string `json:"password" binding:"required"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))
		return
	}

	// get user from context
	authPayload, ok := ctx.Get(authorizationPayloadKey)
	if !ok {
		ctx.JSON(http.StatusInternalServerError, errorResponse(pkg.Errorf(pkg.INTERNAL_ERROR, "failed to get auth payload")))
		return
	}
	payload := authPayload.(*pkg.Payload)

	if payload.UserID != uint32(id) {
		ctx.JSON(http.StatusForbidden, errorResponse(pkg.Errorf(pkg.FORBIDDEN_ERROR, "users can only update their own password")))
		return
	}

	_, oldHashPass, _, err := s.repo.UserRepository.GetUserInternalByEmail(ctx, payload.Email)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	if err := pkg.ComparePasswordAndHash(oldHashPass, req.OldPassword); err != nil {
		ctx.JSON(http.StatusUnauthorized, errorResponse(pkg.Errorf(pkg.AUTHENTICATION_ERROR, "old password is incorrect")))
		return
	}

	hashPassword, err := pkg.GenerateHashPassword(req.Password, s.config.PASSWORD_COST)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(pkg.Errorf(pkg.INTERNAL_ERROR, "failed to hash password: %s", err.Error())))
		return
	}

	updatedUser, err := s.repo.UserRepository.Update(ctx, id, &repository.UserUpdate{
		Password: &hashPassword,
	})
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	// Invalidate users cache

	ctx.JSON(http.StatusOK, gin.H{"data": updatedUser})
}

func (s *Server) deleteUserHandler(ctx *gin.Context) {
	id, err := pkg.StringToInt64(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, "invalid user ID: %s", err.Error())))
		return
	}

	// get user from context
	authPayload, ok := ctx.Get(authorizationPayloadKey)
	if !ok {
		ctx.JSON(http.StatusInternalServerError, errorResponse(pkg.Errorf(pkg.INTERNAL_ERROR, "failed to get auth payload")))
		return
	}
	payload := authPayload.(*pkg.Payload)

	if payload.Role != "admin" {
		ctx.JSON(http.StatusForbidden, errorResponse(pkg.Errorf(pkg.FORBIDDEN_ERROR, "only admin users can delete other users")))
		return
	}

	err = s.repo.UserRepository.Delete(ctx, id)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	// Invalidate users cache

	ctx.JSON(http.StatusOK, gin.H{"data": "user deleted successfully"})
}

func (s *Server) listUsersHandler(ctx *gin.Context) {
	pageNoStr := ctx.DefaultQuery("page", "1")
	pageNo, err := pkg.StringToInt64(pageNoStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))

		return
	}

	pageSizeStr := ctx.DefaultQuery("limit", "10")
	pageSize, err := pkg.StringToInt64(pageSizeStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))

		return
	}

	filter := &repository.UserFilter{
		Pagination: &pkg.Pagination{
			Page:     uint32(pageNo),
			PageSize: uint32(pageSize),
		},
		Search: nil,
		Role:   nil,
	}

	if search := ctx.Query("search"); search != "" {
		filter.Search = &search
	}

	if role := ctx.Query("role"); role != "" {
		filter.Role = &role
	}

	users, pagination, err := s.repo.UserRepository.List(ctx, filter)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data":       users,
		"pagination": pagination,
	})
}

type loginReq struct {
	Email    string `binding:"required" json:"email"`
	Password string `binding:"required" json:"password"`
}

func (s *Server) loginUserHandler(ctx *gin.Context) {
	var req loginReq
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))
		return
	}

	user, hashPass, _, err := s.repo.UserRepository.GetUserInternalByEmail(ctx, req.Email)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, errorResponse(pkg.Errorf(pkg.AUTHENTICATION_ERROR, "invalid email or password")))
		return
	}

	err = pkg.ComparePasswordAndHash(hashPass, req.Password)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, errorResponse(pkg.Errorf(pkg.AUTHENTICATION_ERROR, "invalid email or password")))
		return
	}

	accessToken, err := s.tokenMaker.CreateToken(uint32(user.ID), user.Name, user.Email, user.PhoneNumber, user.Role, s.config.TOKEN_DURATION)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(pkg.Errorf(pkg.INTERNAL_ERROR, "failed to create access token: %s", err.Error())))
		return
	}

	refreshToken, err := s.tokenMaker.CreateToken(uint32(user.ID), user.Name, user.Email, user.PhoneNumber, user.Role, s.config.REFRESH_TOKEN_DURATION)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(pkg.Errorf(pkg.INTERNAL_ERROR, "failed to create refresh token: %s", err.Error())))
		return
	}

	ctx.SetCookie("refreshToken", refreshToken, int(s.config.REFRESH_TOKEN_DURATION), "/", "", true, true)

	_, err = s.repo.UserRepository.Update(ctx, int64(user.ID), &repository.UserUpdate{
		RefreshToken: &refreshToken,
	})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(pkg.Errorf(pkg.INTERNAL_ERROR, "failed to update user refresh token: %s", err.Error())))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"access_token": accessToken,
			"user":         user,
		},
	})
}

func (s *Server) logoutUserHandler(ctx *gin.Context) {
	ctx.SetCookie("refreshToken", "", -1, "/", "", true, true)
	ctx.JSON(http.StatusOK, gin.H{"data": "successfully logged out"})
}

func (s *Server) refreshTokenHandler(ctx *gin.Context) {
	refreshToken, err := ctx.Cookie("refreshToken")
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, "missing refresh token cookie")))
		return
	}

	payload, err := s.tokenMaker.VerifyToken(refreshToken)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, errorResponse(err))
		return
	}

	user, _, storedRefreshToken, err := s.repo.UserRepository.GetUserInternalByEmail(ctx, payload.Email)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, errorResponse(pkg.Errorf(pkg.AUTHENTICATION_ERROR, "Invalid or Expired Refresh Token")))
		return
	}

	if storedRefreshToken == "" || storedRefreshToken != refreshToken {
		ctx.JSON(http.StatusUnauthorized, errorResponse(pkg.Errorf(pkg.AUTHENTICATION_ERROR, "Invalid or Expired Refresh Token")))
		return
	}

	accessToken, err := s.tokenMaker.CreateToken(uint32(user.ID), user.Name, user.Email, user.PhoneNumber, user.Role, s.config.TOKEN_DURATION)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(pkg.Errorf(pkg.INTERNAL_ERROR, "failed to create access token: %s", err.Error())))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"access_token": accessToken,
			"user":         user,
		},
	})
}
