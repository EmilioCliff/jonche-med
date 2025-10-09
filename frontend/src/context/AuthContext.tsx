import { authApi, setupAxiosInterceptors } from '@/api/api';
import {
	type AuthResponse,
	type JWTDecoded,
	type LoginForm,
} from '@/lib/types';
import { isAxiosError } from 'axios';
import {
	createContext,
	useContext,
	useState,
	useEffect,
	type ReactNode,
	useRef,
} from 'react';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
	login: (data: LoginForm) => Promise<AuthResponse>;
	logout: () => Promise<void>;
	isChecking: boolean;
	decoded: JWTDecoded | null;
	isAuthenticated: boolean;
	refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	// const [user, setUser] = useState<User | null>(null);
	const [accessToken, setAccessToken] = useState<string | null>(null);
	const [isChecking, setIsChecking] = useState(true);
	const [decoded, setDecoded] = useState<JWTDecoded | null>(null);
	const tokenRef = useRef<string | null>(null);
	const isAuthenticated = !!accessToken;

	useEffect(() => {
		tokenRef.current = accessToken;
	}, [accessToken]);

	useEffect(() => {
		const checkSession = async () => {
			await refreshSession();
			setIsChecking(false);
		};

		checkSession();
	}, []);

	const getAccessToken = () => tokenRef.current;

	const refreshSession = async () => {
		try {
			const response = await authApi
				.get<AuthResponse>('/users/refresh-token')
				.then((resp) => resp.data);

			if (response.message) {
				throw new Error(response.message);
			}

			tokenRef.current = response.data.access_token;

			setAccessToken(response.data.access_token);
		} catch (error) {
			console.error('Session refresh failed', error);
			setAccessToken(null);
			setIsChecking(false);

			if (isAxiosError(error)) {
				if (error.response) {
					throw new Error(error.response.data['message']);
				} else {
					throw new Error(error.message);
				}
			} else {
				throw new Error(
					'Error while processing request try again later',
				);
			}
		}
	};

	const login = async (data: LoginForm) => {
		try {
			const response = await authApi
				.post<AuthResponse>('/users/login', {
					email: data.email,
					password: data.password,
				})
				.then((resp) => resp.data);

			if (response.message) {
				throw new Error(response.message);
			}

			setAccessToken(response.data.access_token);
			return response;
		} catch (error: any) {
			if (isAxiosError(error)) {
				if (error.response) {
					throw new Error(error.response.data['message']);
				} else {
					throw new Error(error.message);
				}
			} else {
				throw new Error(
					'Error while processing request try again later',
				);
			}
		}
	};

	const logout = async () => {
		try {
			const response = await authApi
				.get('/users/logout')
				.then((resp) => resp.data);

			if (response.message) {
				throw new Error(response.message);
			}

			setAccessToken(null);

			return response;
		} catch (error: any) {
			if (isAxiosError(error)) {
				if (error.response) {
					throw new Error(error.response.data['message']);
				} else {
					throw new Error(error.message);
				}
			} else {
				throw new Error(
					'Error while processing request try again later',
				);
			}
		}
	};

	useEffect(() => {
		setupAxiosInterceptors(getAccessToken, refreshSession);
		if (accessToken) {
			const decoded = jwtDecode<JWTDecoded>(accessToken);
			setDecoded(decoded);
		}
	}, [accessToken]);

	return (
		<AuthContext.Provider
			value={{
				login,
				logout,
				isChecking,
				decoded,
				isAuthenticated,
				refreshSession,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}
