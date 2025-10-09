import { type ReactNode } from 'react';
import { matchPath, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
	LayoutDashboard,
	Package,
	ArrowDownToLine,
	ArrowUpFromLine,
	Users,
	FileBarChart,
	LogOut,
	Menu,
	ArrowLeftRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarTrigger,
	useSidebar,
} from '@/components/ui/sidebar';
import ThemeToggle from './ThemeToogle';
import { ADMIN_ROLE } from '@/lib/types';

interface DashboardLayoutProps {
	children: ReactNode;
}

function AppSidebar() {
	const { decoded, logout } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const { open } = useSidebar();

	const handleLogout = () => {
		logout();
		navigate('/login');
	};

	const menuItems = [
		{ title: 'Dashboard', url: '/', icon: LayoutDashboard },
		{ title: 'Products', url: '/products', icon: Package },
		{ title: 'Stock In', url: '/stock-in', icon: ArrowDownToLine },
		{ title: 'Stock Out', url: '/stock-out', icon: ArrowUpFromLine },
		...(decoded?.role === ADMIN_ROLE
			? [{ title: 'Users', url: '/users', icon: Users }]
			: []),
		{ title: 'Movements', url: '/movements', icon: ArrowLeftRight },
		{ title: 'Reports', url: '/reports', icon: FileBarChart },
	];

	return (
		<Sidebar className="border-r border-sidebar-border">
			<SidebarContent className="bg-sidebar">
				<div className="px-6 py-8 flex items-center border-b border-sidebar-border">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-xl bg-secondary-foreground flex items-center justify-center shadow-elevated">
							<Package className="w-5 h-5 text-secondary" />
						</div>
						{open && (
							<div>
								<h2 className="text-foreground font-semibold text-lg">
									ChemStock
								</h2>
								<p className="text-foreground/60 text-xs">
									Inventory System
								</p>
							</div>
						)}
					</div>
				</div>
				<SidebarGroup className="mt-4">
					<SidebarGroupLabel className="uppercase text-xs font-semibold">
						Navigation
					</SidebarGroupLabel>
					<SidebarGroupContent className="mt-2">
						<SidebarMenu>
							{menuItems.map((item) => {
								const isActive = matchPath(
									item.url,
									location.pathname,
								);
								return (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton
											asChild
											className={`${
												isActive && 'bg-primary'
											} text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear`}
										>
											<NavLink to={item.url}>
												<item.icon className="w-5 h-5" />
												{open && (
													<span>{item.title}</span>
												)}
											</NavLink>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<div className="mt-auto border-t border-sidebar-border py-4 px-2">
					<div
						onClick={() => navigate(`/users/${decoded?.user_id}`)}
						className="flex items-center gap-3 mb-3 cursor-pointer"
					>
						<div className="w-8 h-8 rounded-full bg-sidebar-foreground flex items-center justify-center text-sidebar-primary font-semibold">
							{decoded?.name.charAt(0)}
						</div>
						{open && (
							<div className="flex-1 min-w-0">
								<p className="text-foreground text-sm font-medium truncate">
									{decoded?.name}
								</p>
								<p className="text-foreground/60 text-xs truncate">
									{decoded?.role}
								</p>
							</div>
						)}
					</div>
					<Button
						variant="ghost"
						onClick={handleLogout}
						className="w-full justify-start text-foreground hover:bg-red-600 hover:text-white cursor-pointer"
					>
						<LogOut className="w-4 h-4 mr-2" />
						{open && 'Logout'}
					</Button>
				</div>
			</SidebarContent>
		</Sidebar>
	);
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
	return (
		<SidebarProvider defaultOpen>
			<div className="min-h-screen flex w-full">
				<AppSidebar />
				<div className="flex-1 flex flex-col">
					<header className="h-16 border-b border-border bg-card flex items-center px-6 shadow-card">
						<SidebarTrigger>
							<Button variant="ghost" size="icon">
								<Menu className="w-5 h-5" />
							</Button>
						</SidebarTrigger>
						<ThemeToggle />
					</header>
					<main className="flex-1 overflow-auto">
						<div className="container mx-auto p-6 max-w-7xl">
							{children}
						</div>
					</main>
				</div>
			</div>
		</SidebarProvider>
	);
}
