import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from '@/components/ui/form';
import { ArrowUpFromLine, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Product, StockUpdateForm } from '@/lib/types';
import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StockUpdateFormSchema } from '@/lib/schemas';
import GetFormHelpers from '@/services/getFormHelpers';
import Spinner from '@/components/Spinner';
import ErrorCard from '@/components/ErrorCard';
import GetProduct from '@/services/getProduct';
import RemoveProductStock from '@/services/removeProductStock';
import { toast } from 'react-toastify';

export default function StockOut() {
	const [product, setProduct] = useState<Product | null>(null);
	const [selectedProductId, setSelectedProductId] = useState(0);
	const queryClient = useQueryClient();

	useEffect(() => {
		if (selectedProductId) {
			getMutation.mutate(selectedProductId);
		} else {
			setProduct(null);
		}
	}, [selectedProductId]);

	const form = useForm<StockUpdateForm>({
		resolver: zodResolver(StockUpdateFormSchema),
		defaultValues: {
			quantity: 0,
			note: '',
			batch_number: '',
		},
	});

	const { isLoading, error, data } = useQuery({
		queryKey: ['products', 'form'],
		queryFn: GetFormHelpers,
		staleTime: 5 * 1000,
		placeholderData: keepPreviousData,
	});

	const getMutation = useMutation({
		mutationFn: GetProduct,
		onSuccess: async (data) => {
			await queryClient.invalidateQueries({
				queryKey: ['products', 'stats'],
			});
			setProduct(data.data);
		},
		onError: (error: any) => {
			toast.error(error.message);
		},
	});

	const updateMutation = useMutation({
		mutationFn: RemoveProductStock,
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ['products', 'stats'],
			});
			form.reset({});
			getMutation.mutate(selectedProductId);
			toast.success('Stock removed successfully');
		},
		onError: (error: any) => {
			toast.error(error.message);
		},
	});

	const onSubmit = (data: StockUpdateForm) => {
		if (product) {
			updateMutation.mutate({ data: data, id: product.id });
		} else {
			toast.error('Please select a product');
		}
	};

	const onError = (error: any) => {
		console.log(error);
	};

	if (isLoading) {
		return <Spinner />;
	}

	if (error) {
		return <ErrorCard message={error.message} />;
	}

	const quantity = form.watch('quantity');
	const insufficientStock = product && quantity > product.stock;
	const willBeLowStock =
		product &&
		quantity > 0 &&
		product.stock - quantity <= product.low_stock_threshold;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
					Stock Out
				</h1>
				<p className="text-muted-foreground">
					Record outgoing inventory
				</p>
			</div>

			<div className="grid gap-6 md:grid-cols-3">
				<Card className="md:col-span-2 shadow-card">
					<CardHeader>
						<CardTitle>Remove Stock</CardTitle>
					</CardHeader>
					<CardContent>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit, onError)}
								className="space-y-8"
							>
								<div className="space-y-2">
									<Label className="text-gray-700 font-semibold">
										Product
									</Label>
									<Select
										value={
											selectedProductId
												? selectedProductId.toString()
												: undefined
										}
										onValueChange={(val: string) => {
											form.reset();
											setSelectedProductId(Number(val));
										}}
										required
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select a product" />
										</SelectTrigger>
										<SelectContent>
											{data?.data.map((product) => (
												<SelectItem
													key={product.id}
													value={String(product.id)}
												>
													{product.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<FormField
										control={form.control}
										name="quantity"
										render={({ field }) => (
											<FormItem>
												<Label className="text-gray-700 font-semibold">
													Quantity
												</Label>
												<FormControl>
													<Input
														placeholder="Enter quantity"
														type="number"
														min={0}
														className="placeholder:text-sm placeholder:text-gray-500"
														{...field}
														onChange={(e) =>
															field.onChange(
																e.target
																	.valueAsNumber,
															)
														}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								{insufficientStock && (
									<Alert variant="destructive">
										<AlertTriangle className="h-4 w-4" />
										<AlertDescription>
											Insufficient stock. Only{' '}
											{product.stock} {product.unit}{' '}
											available.
										</AlertDescription>
									</Alert>
								)}
								{!insufficientStock && willBeLowStock && (
									<Alert>
										<AlertTriangle className="h-4 w-4" />
										<AlertDescription>
											Warning: This will bring stock below
											minimum level (
											{product.low_stock_threshold}{' '}
											{product.unit}).
										</AlertDescription>
									</Alert>
								)}

								<div className="space-y-2">
									<FormField
										control={form.control}
										name="note"
										render={({ field }) => (
											<FormItem className="md:col-span-2">
												<Label className="text-gray-700 font-semibold">
													Notes (Optional)
												</Label>
												<FormControl>
													<Textarea
														placeholder="Reason for stock removal, prescription details, etc."
														className="placeholder:text-sm placeholder:text-gray-500"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<Button
									type="submit"
									className="w-full gradient-success cursor-pointer"
									disabled={
										!selectedProductId ||
										!!insufficientStock ||
										quantity === 0
									}
								>
									<ArrowUpFromLine className="w-4 h-4 mr-2" />
									Remove Stock
								</Button>
							</form>
						</Form>
					</CardContent>
				</Card>

				<Card className="shadow-card">
					<CardHeader>
						<CardTitle>Product Details</CardTitle>
					</CardHeader>
					<CardContent>
						{product ? (
							<div className="space-y-4">
								<div>
									<p className="text-sm text-muted-foreground">
										Product Name
									</p>
									<p className="font-medium">
										{product?.name}
									</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">
										Category
									</p>
									<p className="font-medium">
										{product?.category}
									</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">
										Price per unit
									</p>
									<p className="font-medium">
										{product?.price.toLocaleString()}
									</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">
										Available Stock
									</p>
									<p className="font-medium text-2xl">
										{product?.stock} {product.unit}
									</p>
								</div>
								{quantity > 0 && !insufficientStock && (
									<div className="pt-4 border-t">
										<p className="text-sm text-muted-foreground">
											After Removal
										</p>
										<p className="font-medium text-xl">
											{product.stock - quantity}{' '}
											{product.unit}
										</p>
									</div>
								)}
								<div className="pt-4 border-t">
									<p className="text-sm text-muted-foreground">
										Stock Levels
									</p>
									<div className="mt-2 space-y-2">
										<div className="flex justify-between text-sm">
											<span>Minimum:</span>
											<span className="font-medium">
												{product.low_stock_threshold}
											</span>
										</div>
									</div>
								</div>
							</div>
						) : (
							<p className="text-sm text-muted-foreground text-center py-8">
								Select a product to view details
							</p>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
