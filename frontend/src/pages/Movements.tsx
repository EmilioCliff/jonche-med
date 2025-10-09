import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { ArrowUpFromLine, ArrowDownToLine, X } from 'lucide-react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import GetTransactions from '@/services/getTransactions';
import { useDebounce } from '@/hooks/useDebounce';
import GetStats from '@/services/getStats';
import Pagination from '@/components/Pagination';
import Spinner from '@/components/Spinner';
import ErrorCard from '@/components/ErrorCard';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/DateRangePicker';
import { STOCK_IN } from '@/lib/types';
import GetFormHelpers from '@/services/getFormHelpers';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';

export default function Transactions() {
	const [searchTerm, setSearchTerm] = useState('');
	const [filterProductId, setFilterProductId] = useState(0);
	const [filterType, setFilterType] = useState('ALL');
	const [dateRange, setDateRange] = useState({ from: '', to: '' });
	const [pageIndex, setPageIndex] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const debouncedInput = useDebounce({ value: searchTerm, delay: 500 });

	const { data: statsData } = useQuery({
		queryKey: ['stats'],
		queryFn: GetStats,
		staleTime: 5 * 1000,
		placeholderData: keepPreviousData,
	});

	const { data: productsForm } = useQuery({
		queryKey: ['products', 'form'],
		queryFn: GetFormHelpers,
		staleTime: 5 * 1000,
		placeholderData: keepPreviousData,
	});

	const { isLoading, error, data } = useQuery({
		queryKey: [
			'transactions',
			pageIndex,
			pageSize,
			debouncedInput,
			filterType,
			filterProductId,
			dateRange.from,
			dateRange.to,
		],
		queryFn: () =>
			GetTransactions({
				pageNumber: pageIndex,
				pageSize: pageSize,
				BatchNumber: debouncedInput,
				ProductID: filterProductId,
				Type: filterType,
				FromDate: dateRange.from,
				ToDate: dateRange.to,
			}),

		staleTime: 5 * 1000,
		placeholderData: keepPreviousData,
	});

	useEffect(() => {
		setPageIndex(1);
	}, [pageSize, debouncedInput, filterType, filterProductId, dateRange]);

	if (isLoading) {
		return <Spinner />;
	}

	if (error) {
		return <ErrorCard message={error.message} />;
	}

	const transactions = data?.data || [];
	// const stats = statsData?.data || {};
	const pagination = data?.pagination;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
					Transactions
				</h1>
				<p className="text-muted-foreground">
					Transaction history and analytics
				</p>
			</div>

			<div className="grid gap-6 md:grid-cols-3">
				<Card className="shadow-card">
					<CardHeader>
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Total Transactions
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">
							{(statsData?.data?.total_stocks_added ?? 0) +
								(statsData?.data?.total_stocks_removed ?? 0)}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							All time
						</p>
					</CardContent>
				</Card>

				<Card className="shadow-card border-l-4 border-l-primary">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Stock In
						</CardTitle>
						<ArrowDownToLine className="w-5 h-5 text-primary" />
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-primary">
							{statsData?.data?.total_stocks_added ?? 0}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							Total units received
						</p>
					</CardContent>
				</Card>

				<Card className="shadow-card border-l-4 border-l-blue-500">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Stock Out
						</CardTitle>
						<ArrowUpFromLine className="w-5 h-5 text-blue-500" />
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-blue-500">
							{statsData?.data?.total_stocks_removed ?? 0}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							Total units dispensed
						</p>
					</CardContent>
				</Card>
			</div>

			<Card className="shadow-card">
				<CardHeader>
					<CardTitle className="flex justify-between items-center mb-4">
						<div>Transaction History</div>
						<DateRangePicker setTimeRange={setDateRange} />
					</CardTitle>
					<div className="flex flex-col gap-4 mt-4 md:flex-row md:items-center md:justify-between">
						<div className="space-y-2">
							<Label>Filter by Batch Number</Label>
							<Input
								placeholder="Search by batch number..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label>Filter by Product</Label>
							<Select
								value={filterProductId.toString()}
								onValueChange={(v: any) =>
									setFilterProductId(Number(v))
								}
							>
								<SelectTrigger className="w-full md:w-[200px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{productsForm?.data?.map((product) => (
										<SelectItem
											key={product.id}
											value={product.id.toString()}
										>
											{product.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>Filter by Type</Label>
							<Select
								value={filterType}
								onValueChange={(v: any) => setFilterType(v)}
							>
								<SelectTrigger className="w-full md:w-[200px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="ALL">
										All Transactions
									</SelectItem>
									<SelectItem value="ADD">
										Stock In
									</SelectItem>
									<SelectItem value="REMOVE">
										Stock Out
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>Reset Filters</Label>
							<Button
								variant="outline"
								onClick={() => {
									setFilterType('ALL');
									setFilterProductId(0);
									setSearchTerm('');
								}}
								className="h-8 px-2 lg:px-3 cursor-pointer flex items-center gap-1"
							>
								Reset
								<X />
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="rounded-lg border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Date</TableHead>
									<TableHead>Product</TableHead>
									<TableHead>Type</TableHead>
									<TableHead>Quantity</TableHead>
									<TableHead>User</TableHead>
									<TableHead>Notes</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{transactions.length !== 0 ? (
									transactions.map((transaction) => (
										<TableRow key={transaction.id}>
											<TableCell>
												{new Date(
													transaction.created_at,
												).toLocaleDateString()}{' '}
												{new Date(
													transaction.created_at,
												).toLocaleTimeString()}
											</TableCell>
											<TableCell className="font-medium">
												{transaction.product_name}
											</TableCell>
											<TableCell>
												{transaction.type ===
												STOCK_IN ? (
													<Badge className="bg-primary">
														Stock In
													</Badge>
												) : (
													<Badge variant="outline">
														Stock Out
													</Badge>
												)}
											</TableCell>
											<TableCell>
												<span>
													{transaction.type ===
													STOCK_IN
														? '+'
														: '-'}
													{transaction.quantity}
												</span>
											</TableCell>
											<TableCell>
												{transaction.user_name}
											</TableCell>
											<TableCell className="max-w-[100px] truncate">
												<Tooltip>
													<TooltipTrigger asChild>
														<span>
															{transaction.batch_number ||
																transaction.note ||
																'-'}
														</span>
													</TooltipTrigger>
													<TooltipContent>
														{transaction.batch_number ||
															transaction.note ||
															'-'}
													</TooltipContent>
												</Tooltip>
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell
											colSpan={6}
											className="h-24 text-center"
										>
											No results.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
						{pagination && (
							<Pagination
								page={pagination.page}
								pageSize={pagination.page_size}
								total={pagination.total}
								totalPages={pagination.total_pages}
								hasNext={pagination.has_next}
								hasPrevious={pagination.has_previous}
								nextPage={pagination.next_page}
								previousPage={pagination.previous_page}
								onPageChange={(newPage) =>
									setPageIndex(newPage)
								}
								onPageSizeChange={(size) => setPageSize(size)}
							/>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
