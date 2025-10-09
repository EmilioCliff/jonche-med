import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from '@/components/ui/tooltip';
import { ADMIN_ROLE, type Product, type ProductForm } from '@/lib/types';
import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query';
import GetProducts from '@/services/getProducts';
import ErrorCard from '@/components/ErrorCard';
import Pagination from '@/components/Pagination';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProductFormSchema } from '@/lib/schemas';
import UpdateProduct from '@/services/updateProduct';
import { toast } from 'react-toastify';
import CreateProduct from '@/services/createProduct';
import { Textarea } from '@/components/ui/textarea';
import Spinner from '@/components/Spinner';
import DeleteProduct from '@/services/deleteProduct';
import DeleteConfirm from '@/components/DeleteConfirm';

export default function Products() {
	const { decoded } = useAuth();
	const [searchTerm, setSearchTerm] = useState('');
	const [status, setStatus] = useState('all');
	const [pageIndex, setPageIndex] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [deleteConfirm, setDeleteConfirm] = useState(false);
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);
	const debouncedInput = useDebounce({ value: searchTerm, delay: 500 });
	const queryClient = useQueryClient();

	const { isLoading, error, data, refetch } = useQuery({
		queryKey: ['products', pageIndex, pageSize, debouncedInput, status],
		queryFn: () =>
			GetProducts({
				pageNumber: pageIndex,
				pageSize: pageSize,
				Search: debouncedInput,
				Status: status,
			}),
		staleTime: 5 * 1000,
		placeholderData: keepPreviousData,
	});

	useEffect(() => {
		setPageIndex(1);
	}, [pageSize, debouncedInput, status]);

	const form = useForm<ProductForm>({
		resolver: zodResolver(ProductFormSchema),
		defaultValues: {
			id: editingProduct?.id,
			name: editingProduct?.name || '',
			category: editingProduct?.category || '',
			stock: editingProduct?.stock || 0,
			unit: editingProduct?.unit || '',
			low_stock_threshold: editingProduct?.low_stock_threshold || 0,
			price: editingProduct?.price || 0,
			description: editingProduct?.description || '',
		},
	});

	const createMutation = useMutation({
		mutationFn: CreateProduct,
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ['products', 'stats'],
			});
			refetch();
			form.reset({});
			toast.success('Product created successfully');
			setIsDialogOpen(false);
		},
		onError: (error: any) => {
			toast.error(error.message);
		},
	});

	const updateMutation = useMutation({
		mutationFn: UpdateProduct,
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ['products'],
			});
			form.reset({});
			toast.success('Product updated successfully');
			setIsDialogOpen(false);
		},
		onError: (error: any) => {
			toast.error(error.message);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: DeleteProduct,
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ['products'],
			});
			// refetch();
			setEditingProduct(null);
			toast.success('Product deleted successfully');
		},
		onError: (error: any) => {
			toast.error(error.message);
		},
	});

	const onDelete = (id: number) => {
		deleteMutation.mutate(id);
	};

	const onSubmit = (data: ProductForm) => {
		if (editingProduct) {
			updateMutation.mutate({ ...data, id: editingProduct.id });
		} else {
			createMutation.mutate(data);
		}
	};

	const onError = (error: any) => {
		console.log(error);
	};

	const handleEdit = (product: Product) => {
		setEditingProduct(product);
		form.reset({
			id: product.id,
			name: product.name,
			category: product.category,
			stock: product.stock,
			unit: product.unit,
			low_stock_threshold: product.low_stock_threshold,
			price: product.price,
			description: product.description,
		});
		setIsDialogOpen(true);
	};

	const handleAddNew = () => {
		setEditingProduct(null);
		form.reset();
		setIsDialogOpen(true);
	};

	const getStockStatus = (product: Product) => {
		if (product.stock <= 0) {
			return <Badge variant="destructive">Out</Badge>;
		}
		if (product.stock <= product.low_stock_threshold) {
			return <Badge variant="outline">Low</Badge>;
		}
		return <Badge variant={'default'}>Good</Badge>;
	};

	if (isLoading) {
		return <Spinner />;
	}

	if (error) {
		return <ErrorCard message={error.message} />;
	}

	const filteredProducts = data?.data || [];
	const pagination = data?.pagination;

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold mb-2">Products</h1>
					<p className="text-muted-foreground">
						Manage your pharmacy inventory
					</p>
				</div>
				<Dialog
					open={isDialogOpen}
					onOpenChange={(state) => {
						setIsDialogOpen(state);
						if (!state) {
							form.reset({});
							setEditingProduct(null);
						}
					}}
				>
					<DialogTrigger asChild>
						<Button
							onClick={handleAddNew}
							className="gradient-primary cursor-pointer"
						>
							<Plus className="w-4 h-4 mr-2" />
							Add Product
						</Button>
					</DialogTrigger>
					<DialogContent
						aria-describedby={undefined}
						className="max-w-2xl max-h-[90vh] overflow-y-auto"
					>
						<DialogHeader>
							<DialogTitle>
								{editingProduct
									? 'Edit Product'
									: 'Add New Product'}
							</DialogTitle>
						</DialogHeader>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit, onError)}
								className="space-y-8"
							>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="name"
										render={({ field }) => (
											<FormItem>
												<Label className="text-gray-700 font-semibold">
													Name
												</Label>
												<FormControl>
													<Input
														placeholder="Product Name"
														className="placeholder:text-sm placeholder:text-gray-500"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="category"
										render={({ field }) => (
											<FormItem>
												<Label className="text-gray-700 font-semibold">
													Category
												</Label>
												<FormControl>
													<Input
														placeholder="Category Name"
														className="placeholder:text-sm placeholder:text-gray-500"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="stock"
										render={({ field }) => (
											<FormItem>
												<Label className="text-gray-700 font-semibold">
													Stock
												</Label>
												<FormControl>
													<Input
														placeholder="100"
														disabled={
															editingProduct?.id !==
															undefined
														}
														type="number"
														className="placeholder:text-sm placeholder:text-gray-500"
														{...field}
														onChange={(e) =>
															field.onChange(
																Number(
																	e.target
																		.value,
																),
															)
														}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="unit"
										render={({ field }) => (
											<FormItem>
												<Label className="text-gray-700 font-semibold">
													Unit
												</Label>
												<FormControl>
													<Input
														placeholder="tube"
														className="placeholder:text-sm placeholder:text-gray-500"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="low_stock_threshold"
										render={({ field }) => (
											<FormItem>
												<Label className="text-gray-700 font-semibold">
													Minimum Stock
												</Label>
												<FormControl>
													<Input
														placeholder="50"
														type="number"
														className="placeholder:text-sm placeholder:text-gray-500"
														{...field}
														onChange={(e) =>
															field.onChange(
																Number(
																	e.target
																		.value,
																),
															)
														}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="price"
										render={({ field }) => (
											<FormItem>
												<Label className="text-gray-700 font-semibold">
													Price per Unit
												</Label>
												<FormControl>
													<Input
														placeholder="50"
														type="number"
														className="placeholder:text-sm placeholder:text-gray-500"
														{...field}
														onChange={(e) =>
															field.onChange(
																Number(
																	e.target
																		.value,
																),
															)
														}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="description"
										render={({ field }) => (
											<FormItem className="md:col-span-2">
												<Label className="text-gray-700 font-semibold">
													Description
												</Label>
												<FormControl>
													<Textarea
														placeholder="Product description..."
														className="placeholder:text-sm placeholder:text-gray-500"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<div className="flex justify-end gap-2">
									<Button
										type="button"
										variant="outline"
										onClick={() => {
											setEditingProduct(null);
											form.reset({});
											setIsDialogOpen(false);
										}}
									>
										Cancel
									</Button>
									<Button
										type="submit"
										className="gradient-primary"
										disabled={
											createMutation.isPending ||
											updateMutation.isPending
										}
									>
										{editingProduct
											? updateMutation.isPending
												? 'Updating...'
												: 'Update'
											: createMutation.isPending
											? 'Adding...'
											: 'Add'}{' '}
										Product
									</Button>
								</div>
								{/* </div> */}
							</form>
						</Form>
					</DialogContent>
				</Dialog>
			</div>

			<Card className="shadow-card">
				<CardHeader>
					<div className="flex items-center gap-4">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
							<Input
								placeholder="Search products..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10"
							/>
						</div>
						<Select
							value={status}
							defaultValue={status}
							onValueChange={(val: string) => {
								setStatus(val);
							}}
						>
							<SelectTrigger>
								<SelectValue placeholder={pageSize} />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value="all">All</SelectItem>
									<SelectItem value="in_stock">
										In Stock
									</SelectItem>
									<SelectItem value="out_of_stock">
										Low on Stock
									</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
				</CardHeader>
				<CardContent>
					<div className="rounded-lg border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Product Name</TableHead>
									<TableHead>Category</TableHead>
									<TableHead>Stock</TableHead>
									<TableHead>Unit</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Price</TableHead>
									<TableHead>Description</TableHead>
									{decoded?.role === ADMIN_ROLE && (
										<TableHead className="text-right">
											Actions
										</TableHead>
									)}
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredProducts.length !== 0 ? (
									filteredProducts.map((product) => (
										<TableRow key={product.id}>
											<TableCell className="font-medium">
												{product.name}
											</TableCell>
											<TableCell>
												{product.category}
											</TableCell>
											<TableCell>
												{product.stock}
											</TableCell>
											<TableCell>
												{product.unit}
											</TableCell>
											<TableCell>
												{getStockStatus(product)}
											</TableCell>
											<TableCell>
												{product.price.toFixed(2)}
											</TableCell>
											<TableCell className="max-w-[100px] truncate">
												<Tooltip>
													<TooltipTrigger asChild>
														<span>
															{
																product.description
															}
														</span>
													</TooltipTrigger>
													<TooltipContent>
														{product.description}
													</TooltipContent>
												</Tooltip>
											</TableCell>
											{decoded?.role === ADMIN_ROLE && (
												<TableCell className="text-right">
													<div className="flex justify-end gap-2">
														<Button
															variant="ghost"
															size="icon"
															className="cursor-pointer"
															onClick={() =>
																handleEdit(
																	product,
																)
															}
														>
															<Pencil className="w-4 h-4" />
														</Button>
														<Button
															variant="ghost"
															size="icon"
															className="cursor-pointer"
															onClick={() => {
																setEditingProduct(
																	product,
																);
																setDeleteConfirm(
																	true,
																);
															}}
														>
															<Trash2 className="w-4 h-4 text-red-600" />
														</Button>
													</div>
												</TableCell>
											)}
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell
											colSpan={8}
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
			<DeleteConfirm
				resourceName="product"
				action="Delete Product"
				open={deleteConfirm}
				setOpen={setDeleteConfirm}
				onConfirm={() => onDelete(editingProduct?.id || 0)}
				onCancel={() => setEditingProduct(null)}
			/>
		</div>
	);
}
