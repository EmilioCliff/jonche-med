import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, User as UserIcon, Eye, Trash, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DeleteConfirm from '@/components/DeleteConfirm';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import GetUsers from '@/services/getUsers';
import DeleteUser from '@/services/deleteUser';
import CreateUser from '@/services/createUser';
import UpdateUser from '@/services/updateUser';
import { UserFormSchema } from '@/lib/schemas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Form,
	FormField,
	FormItem,
	FormControl,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import type { User } from '@/lib/types';
import Spinner from '@/components/Spinner';
import ErrorCard from '@/components/ErrorCard';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

export default function Users() {
	const [deleteConfirm, setDeleteConfirm] = useState(false);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [isViewModalOpen, setIsViewModalOpen] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const queryClient = useQueryClient();

	const { isLoading, error, data } = useQuery({
		queryKey: ['users'],
		queryFn: () => GetUsers({ pageNumber: 0, pageSize: 50 }),
		staleTime: 5 * 1000,
	});

	const deleteMutation = useMutation({
		mutationFn: DeleteUser,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['users'] });
			setDeleteConfirm(false);
			setSelectedUser(null);
			toast.success('User deleted successfully');
		},
		onError: (error: any) => {
			toast.error(error.message);
		},
	});

	const createForm = useForm({
		resolver: zodResolver(UserFormSchema),
		defaultValues: {
			name: '',
			email: '',
			phone_number: '',
			role: 'staff',
		},
	});

	const createMutation = useMutation({
		mutationFn: CreateUser,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['users'] });
			createForm.reset();
			setIsCreateModalOpen(false);
			toast.success('User created successfully');
		},
		onError: (error: any) => {
			toast.error(error.message);
		},
	});

	const editForm = useForm({
		resolver: zodResolver(UserFormSchema),
		defaultValues: selectedUser || {
			name: '',
			email: '',
			phone_number: '',
			role: '',
		},
	});

	const updateMutation = useMutation({
		mutationFn: UpdateUser,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['users'] });
			editForm.reset();
			setIsEditMode(false);
			setIsViewModalOpen(false);
			toast.success('User updated successfully');
		},
		onError: (error: any) => {
			toast.error(error.message);
		},
	});

	const users = data?.data || [];

	const handleView = (user: User) => {
		setSelectedUser(user);
		setIsViewModalOpen(true);
		setIsEditMode(false);
		editForm.reset(user);
	};

	const handleDelete = (user: User) => {
		setSelectedUser(user);
		setDeleteConfirm(true);
	};

	const handleCreate = () => {
		setIsCreateModalOpen(true);
		createForm.reset();
	};

	if (isLoading) {
		return <Spinner />;
	}

	if (error) {
		return <ErrorCard message={error.message} />;
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
					User Management
				</h1>
				<p className="text-muted-foreground">
					Manage system users and permissions
				</p>
			</div>
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{users.map((user) => (
					<Card
						key={user.id}
						className="shadow-card hover:shadow-elevated transition-shadow"
					>
						<CardHeader>
							<div className="flex items-center gap-3">
								<div>
									<CardTitle className="text-lg">
										{user.name}
									</CardTitle>
									<p className="text-sm text-muted-foreground">
										{user.email}
									</p>
								</div>
							</div>
						</CardHeader>

						<CardContent className="space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">
									Role
								</span>
								<Badge
									variant={
										user.role === 'admin'
											? 'default'
											: 'secondary'
									}
									className="gap-1"
								>
									{user.role === 'admin' ? (
										<Shield className="w-3 h-3" />
									) : (
										<UserIcon className="w-3 h-3" />
									)}
									{user.role === 'admin'
										? 'Administrator'
										: 'Staff'}
								</Badge>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">
									Status
								</span>
								<Badge className="bg-secondary">Active</Badge>
							</div>
						</CardContent>

						<CardFooter className="flex justify-end ">
							<Button
								variant="ghost"
								size="icon"
								className="cursor-pointer"
								onClick={() => handleView(user)}
							>
								<Eye className="w-4 h-4" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								className="hover:bg-destructive/10 cursor-pointer"
								onClick={() => handleDelete(user)}
							>
								<Trash className="text-destructive w-4 h-4" />
							</Button>
						</CardFooter>
					</Card>
				))}

				<Card
					className="shadow-card hover:shadow-elevated border-dashed border-2 border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-all"
					onClick={handleCreate}
				>
					<div className="flex flex-col items-center justify-center h-full py-10">
						<div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
							<Plus className="w-7 h-7 text-primary" />
						</div>
						<p className="text-primary font-medium">Add New User</p>
					</div>
				</Card>
			</div>

			<Card className="shadow-card">
				<CardHeader>
					<CardTitle>Permissions</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="flex items-start gap-3">
							<Shield className="w-5 h-5 text-blue-500 mt-0.5" />
							<div>
								<h3 className="font-medium">Administrator</h3>
								<p className="text-sm text-muted-foreground">
									Full access to all features including user
									management, products, stock operations, and
									reports.
								</p>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<UserIcon className="w-5 h-5 text-primary mt-0.5" />
							<div>
								<h3 className="font-medium">Staff</h3>
								<p className="text-sm text-muted-foreground">
									Access to products, stock in/out operations,
									and reports. Cannot manage users.
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
			<DeleteConfirm
				resourceName="user"
				action="Delete User"
				open={deleteConfirm}
				setOpen={setDeleteConfirm}
				onConfirm={() =>
					selectedUser && deleteMutation.mutate(selectedUser.id)
				}
				onCancel={() => setSelectedUser(null)}
			/>

			{/* View/Edit User Modal */}
			<Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
				<DialogContent
					aria-describedby={undefined}
					className="max-w-lg"
				>
					<DialogHeader>
						<DialogTitle>User Details</DialogTitle>
					</DialogHeader>
					<div className="flex items-center gap-2 mb-4">
						<Switch
							checked={isEditMode}
							onCheckedChange={setIsEditMode}
						/>
						<span className="text-sm">Edit Mode</span>
					</div>
					{isEditMode ? (
						<Form {...editForm}>
							<form
								onSubmit={editForm.handleSubmit((data) =>
									updateMutation.mutate({
										data: data,
										id: selectedUser?.id || 0,
									}),
								)}
								className="space-y-4"
							>
								<FormField
									control={editForm.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Input
													placeholder="Name"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={editForm.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Input
													placeholder="Email"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={editForm.control}
									name="phone_number"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Input
													placeholder="Phone Number"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={editForm.control}
									name="role"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Select
													onValueChange={
														field.onChange
													}
													defaultValue={field.value}
												>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Select Role" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="admin">
															Admin
														</SelectItem>
														<SelectItem value="staff">
															Staff
														</SelectItem>
													</SelectContent>
												</Select>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Button
									type="submit"
									className="w-full gradient-primary cursor-pointer"
								>
									Update User
								</Button>
							</form>
						</Form>
					) : (
						<div className="space-y-2">
							<p>
								<span className="font-semibold">Name:</span>{' '}
								{selectedUser?.name}
							</p>
							<p>
								<span className="font-semibold">Email:</span>{' '}
								{selectedUser?.email}
							</p>
							<p>
								<span className="font-semibold">Phone:</span>{' '}
								{selectedUser?.phone_number}
							</p>
							<p>
								<span className="font-semibold">Role:</span>{' '}
								{selectedUser?.role}
							</p>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Create User Modal */}
			<Dialog
				open={isCreateModalOpen}
				onOpenChange={setIsCreateModalOpen}
			>
				<DialogContent
					aria-describedby={undefined}
					className="max-w-lg"
				>
					<DialogHeader>
						<DialogTitle>Create User</DialogTitle>
					</DialogHeader>
					<Form {...createForm}>
						<form
							onSubmit={createForm.handleSubmit((data) =>
								createMutation.mutate(data),
							)}
							className="space-y-4"
						>
							<FormField
								control={createForm.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<Input
												placeholder="Name"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={createForm.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<Input
												placeholder="Email"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={createForm.control}
								name="phone_number"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<Input
												placeholder="Phone Number"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={createForm.control}
								name="role"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
											>
												<SelectTrigger className="w-full">
													<SelectValue placeholder="Select Role" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="admin">
														Admin
													</SelectItem>
													<SelectItem value="staff">
														Staff
													</SelectItem>
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button
								type="submit"
								className="w-full gradient-primary cursor-pointer"
							>
								Update User
							</Button>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
