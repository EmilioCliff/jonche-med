import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import StockIn from './pages/StockIn';
import StockOut from './pages/StockOut';
import Reports from './pages/Reports';
import Users from './pages/Users';
import NotFound from './pages/NotFound';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ToastContainer } from 'react-toastify';
import Spinner from './components/Spinner';
import Transactions from './pages/Movements';
import { ADMIN_ROLE } from './lib/types';
import UserProfile from './pages/UserProfile';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const { isAuthenticated, isChecking } = useAuth();
	if (isChecking) {
		return (
			<div className="flex justify-center items-center border w-full h-[100vh]">
				<Spinner />
			</div>
		);
	}
	if (!isAuthenticated) return <Navigate to="/login" replace />;
	return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
	const { isAuthenticated, isChecking, decoded } = useAuth();
	if (isChecking) {
		return (
			<div className="flex justify-center items-center border w-full h-[100vh]">
				<Spinner />
			</div>
		);
	}
	if (!isAuthenticated) return <Navigate to="/login" replace />;
	if (decoded?.role !== ADMIN_ROLE) return <Navigate to="/" replace />;
	return <>{children}</>;
}

const App = () => (
	<QueryClientProvider client={queryClient}>
		<TooltipProvider>
			<AuthProvider>
				<BrowserRouter>
					<Routes>
						<Route path="/login" element={<Login />} />
						<Route
							path="/"
							element={
								<ProtectedRoute>
									<DashboardLayout>
										<Dashboard />
									</DashboardLayout>
								</ProtectedRoute>
							}
						/>
						<Route
							path="/products"
							element={
								<ProtectedRoute>
									<DashboardLayout>
										<Products />
									</DashboardLayout>
								</ProtectedRoute>
							}
						/>
						<Route
							path="/stock-in"
							element={
								<ProtectedRoute>
									<DashboardLayout>
										<StockIn />
									</DashboardLayout>
								</ProtectedRoute>
							}
						/>
						<Route
							path="/stock-out"
							element={
								<ProtectedRoute>
									<DashboardLayout>
										<StockOut />
									</DashboardLayout>
								</ProtectedRoute>
							}
						/>
						<Route
							path="/movements"
							element={
								<ProtectedRoute>
									<DashboardLayout>
										<Transactions />
									</DashboardLayout>
								</ProtectedRoute>
							}
						/>
						<Route
							path="/reports"
							element={
								<ProtectedRoute>
									<DashboardLayout>
										<Reports />
									</DashboardLayout>
								</ProtectedRoute>
							}
						/>
						<Route
							path="/users"
							element={
								<AdminRoute>
									<DashboardLayout>
										<Users />
									</DashboardLayout>
								</AdminRoute>
							}
						/>
						<Route
							path="/users/:id"
							element={
								<ProtectedRoute>
									<DashboardLayout>
										<UserProfile />
									</DashboardLayout>
								</ProtectedRoute>
							}
						/>
						<Route path="*" element={<NotFound />} />
					</Routes>
					<ToastContainer />
				</BrowserRouter>
			</AuthProvider>
		</TooltipProvider>
	</QueryClientProvider>
);

export default App;
