import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
	Package,
	TrendingUp,
	TrendingDown,
	AlertTriangle,
	ArrowRight,
	CircleAlert,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	CartesianGrid,
	type TooltipProps,
} from 'recharts';
import GetDashboardData from '@/services/getDashboard';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import Spinner from '@/components/Spinner';
import ErrorCard from '@/components/ErrorCard';
import { format } from 'date-fns';
import type {
	NameType,
	ValueType,
} from 'recharts/types/component/DefaultTooltipContent';

export default function Dashboard() {
	const { isLoading, error, data } = useQuery({
		queryKey: ['products', 'stats'],
		queryFn: GetDashboardData,
		staleTime: 5 * 1000,
		placeholderData: keepPreviousData,
	});

	if (isLoading) {
		return <Spinner />;
	}

	if (error) {
		return <ErrorCard message={error.message} />;
	}

	const dashboard = data?.data;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold mb-2">Dashboard</h1>
				<p className="text-muted-foreground">
					Overview of your pharmacy inventory
				</p>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				<Card className="shadow-card hover:shadow-elevated transition-shadow">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Total Products
						</CardTitle>
						<Package className="w-5 h-5 text-primary" />
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">
							{dashboard?.total_products}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							Active items in inventory
						</p>
					</CardContent>
				</Card>

				<Card className="shadow-card hover:shadow-elevated transition-shadow">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Stock Alerts
						</CardTitle>
						<CircleAlert className="w-5 h-5 text-orange-500" />
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">
							{dashboard?.total_low_stock}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							Products below minimum
						</p>
					</CardContent>
				</Card>

				<Card className="shadow-card hover:shadow-elevated transition-shadow">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Out of Stock (Today)
						</CardTitle>
						<AlertTriangle className="w-5 h-5 text-destructive" />
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">
							{dashboard?.total_out_of_stock}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							Products with 0 stock
						</p>
					</CardContent>
				</Card>

				<Card className="shadow-card hover:shadow-elevated transition-shadow">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Inventory Value
						</CardTitle>
						<Package className="w-5 h-5 text-primary" />
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">
							KES {dashboard?.stock_value.toLocaleString()}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							Total stock value
						</p>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				{/* Bar chart */}
				<Card className="shadow-card">
					<CardHeader>
						<CardTitle>Sales (Last 7 Days)</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={250}>
							<BarChart data={dashboard?.weekly_aggr}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="day" />
								<YAxis />
								<Tooltip content={<CustomTooltip />} />
								<Bar
									dataKey="sales"
									fill="#008236"
									radius={[4, 4, 0, 0]}
								/>
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
				{/* #6366f1 */}
				{/* Stock Alerts */}
				<Card className="shadow-card border-l-4 border-l-destructive bg-green-">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<AlertTriangle className="w-5 h-5 text-destructive" />
							Low Stock Alerts
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{dashboard?.low_stock &&
							dashboard.low_stock.length > 0 ? (
								dashboard.low_stock.map((alert) => (
									<div
										key={alert.id}
										className="flex items-center justify-between p-3 bg-muted rounded-lg"
									>
										<div>
											<p className="font-medium">
												{alert.name}
											</p>
											<p className="text-sm text-muted-foreground">
												Current: {alert.stock} |
												Minimum:{' '}
												{alert.low_stock_threshold}
											</p>
										</div>
										<Badge
											variant={
												alert.stock === 0
													? 'destructive'
													: 'secondary'
											}
										>
											{alert.stock === 0
												? 'Critical'
												: 'Warning'}
										</Badge>
									</div>
								))
							) : (
								<p className="text-sm text-muted-foreground text-center py-4">
									No stock alerts
								</p>
							)}
						</div>
						<Link to="/products">
							<Button
								variant="outline"
								className="w-full mt-4 cursor-pointer"
							>
								View All Products{' '}
								<ArrowRight className="w-4 h-4 ml-2" />
							</Button>
						</Link>
					</CardContent>
				</Card>
			</div>

			{/* Quick Actions */}
			<Card className="shadow-card">
				<CardHeader>
					<CardTitle>Quick Actions</CardTitle>
				</CardHeader>
				<CardContent className="grid gap-4 md:grid-cols-2">
					<Link to="/stock-in" className="block">
						<Button className="w-full gradient-success justify-start h-auto py-4 cursor-pointer">
							<TrendingUp className="w-5 h-5 mr-3" />
							<div className="text-left">
								<div className="font-semibold">
									Record Stock In
								</div>
								<div className="text-xs opacity-90">
									Add new inventory
								</div>
							</div>
						</Button>
					</Link>
					<Link to="/stock-out" className="block">
						<Button
							variant="outline"
							className="w-full justify-start h-auto py-4 border-2 cursor-pointer"
						>
							<TrendingDown className="w-5 h-5 mr-3" />
							<div className="text-left">
								<div className="font-semibold">
									Record Stock Out
								</div>
								<div className="text-xs text-muted-foreground">
									Remove inventory
								</div>
							</div>
						</Button>
					</Link>
				</CardContent>
			</Card>

			{/* Recent Transactions */}
			<div className="grid gap-6 md:grid-cols-2">
				<Card className="shadow-card">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TrendingUp className="w-5 h-5 text-primary" />
							Recent Stock In
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{dashboard?.recent_stock_in &&
							dashboard?.recent_stock_in.length > 0 ? (
								dashboard?.recent_stock_in.map(
									(transaction) => (
										<div
											key={transaction.id}
											className="flex justify-between items-center p-3 bg-muted rounded-lg"
										>
											<div>
												<p className="font-medium text-sm">
													{transaction.product_name}
												</p>
												<p className="text-xs text-muted-foreground">
													{format(
														transaction.created_at,
														'10/02/2025',
													)}
												</p>
											</div>
											<Badge variant="secondary">
												+{transaction.quantity}
											</Badge>
										</div>
									),
								)
							) : (
								<p className="text-sm text-muted-foreground text-center py-4">
									No recent transactions
								</p>
							)}
						</div>
					</CardContent>
				</Card>

				<Card className="shadow-card">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TrendingDown className="w-5 h-5 text-blue-600" />
							Recent Stock Out
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{dashboard?.recent_stock_out &&
							dashboard?.recent_stock_out.length > 0 ? (
								dashboard?.recent_stock_out.map(
									(transaction) => (
										<div
											key={transaction.id}
											className="flex justify-between items-center p-3 bg-muted rounded-lg"
										>
											<div>
												<p className="font-medium text-sm">
													{transaction.product_name}
												</p>
												<p className="text-xs text-muted-foreground">
													{format(
														transaction.created_at,
														'10/02/2025',
													)}
												</p>
											</div>
											<Badge variant="secondary">
												-{transaction.quantity}
											</Badge>
										</div>
									),
								)
							) : (
								<p className="text-sm text-muted-foreground text-center py-4">
									No recent transactions
								</p>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

const CustomTooltip = ({
	active,
	// @ts-ignore
	payload,
	// @ts-ignore
	label,
}: TooltipProps<ValueType, NameType>) => {
	if (active && payload && payload.length) {
		const data = payload[0].payload;
		return (
			<div className="bg-white p-3 rounded-xl shadow-md border text-sm">
				<p className="font-semibold text-gray-700">{label}</p>
				<p className="text-indigo-600">Sales: {data.sales}</p>
				<p className="text-green-600">
					Total Amount: KES {data.total_amount.toLocaleString()}
				</p>
				<p className="text-gray-500 text-xs">
					Transactions: {data.total_transacted}
				</p>
			</div>
		);
	}
	return null;
};
