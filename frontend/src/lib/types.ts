import type z from 'zod';

export const ADMIN_ROLE = 'admin';
export const STOCK_IN = 'ADD';
export const STOCK_OUT = 'REMOVE';

import type {
	LoginFormSchema,
	MovementSchema,
	ProductFormSchema,
	ProductSchema,
	StatsSchema,
	StockUpdateFormSchema,
	UserFormSchema,
	UserSchema,
} from './schemas';

// Pagination info
export interface Pagination {
	page: number;
	page_size: number;
	total: number;
	total_pages: number;
	has_next: boolean;
	has_previous: boolean;
	next_page: number;
	previous_page: number;
}

// Common response type
export interface CommonResponse {
	statusCode?: string;
	message?: string;
	pagination?: Pagination;
	data: any;
}

export interface CommonFormHelpers {
	id: number;
	name: string;
}

// Common props for listing
export interface ListCommonProps {
	pageNumber: number;
	pageSize: number;
	Role?: string;
	Search?: string;
	Status?: string;
	ProductID?: number;
	Type?: string;
	BatchNumber?: string;
	FromDate?: string;
	ToDate?: string;
}

// Decoded token type
export interface JWTDecoded {
	id: number;
	user_id: number;
	email: string;
	name: string;
	phone_number: string;
	role: string;
	exp: number;
	iat: number;
}

// Dashboard data type
export interface DashboardData {
	total_products: number;
	total_low_stock: number;
	total_out_of_stock: number;
	stock_value: number;
	low_stock: {
		id: number;
		name: string;
		stock: number;
		low_stock_threshold: number;
	}[];
	recent_stock_in: {
		id: number;
		product_name: string;
		quantity: number;
		price: number;
		created_at: string;
	}[];
	recent_stock_out: {
		id: number;
		product_name: string;
		quantity: number;
		price: number;
		created_at: string;
	}[];
	weekly_aggr: {
		day: string;
		sales: number;
		total_transacted: number;
		total_amount: number;
	}[];
}

// Helper data type
export interface CommonDataResponse {
	id: number;
	name: string;
	description?: string;
}

// Types from schema
// users
export type User = z.infer<typeof UserSchema>;
export type UserForm = z.infer<typeof UserFormSchema>;

// products
export type Product = z.infer<typeof ProductSchema>;
export type ProductForm = z.infer<typeof ProductFormSchema>;
export type StockUpdateForm = z.infer<typeof StockUpdateFormSchema>;

// others
export type Transaction = z.infer<typeof MovementSchema>;
export type Stats = z.infer<typeof StatsSchema>;
export type LoginForm = z.infer<typeof LoginFormSchema>;

// Types responses
// users
export interface AuthResponse extends Omit<CommonResponse, 'data'> {
	data: {
		access_token: string;
		user: User;
	};
}
export interface GetUsersResponse extends Omit<CommonResponse, 'data'> {
	data: User[];
}
export interface UserResponse extends Omit<CommonResponse, 'data'> {
	data: User;
}

// products
export interface GetProductsResponse extends Omit<CommonResponse, 'data'> {
	data: Product[];
}
export interface ProductResponse extends Omit<CommonResponse, 'data'> {
	data: Product;
}

// others
export interface GetDashboardDataResponse extends Omit<CommonResponse, 'data'> {
	data: DashboardData;
}
export interface GetTransactionsResponse extends Omit<CommonResponse, 'data'> {
	data: Transaction[];
}
export interface GetStatsResponse extends Omit<CommonResponse, 'data'> {
	data: Stats;
}
export interface CommonHelpersResponse extends Omit<CommonResponse, 'data'> {
	data: CommonDataResponse[];
}
