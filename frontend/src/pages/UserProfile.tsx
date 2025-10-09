import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Form,
	FormField,
	FormItem,
	FormControl,
	FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserFormSchema } from '@/lib/schemas';
import Spinner from '@/components/Spinner';
import ErrorCard from '@/components/ErrorCard';
import { Eye, Pencil, Save, KeyRound, Lock, EyeOff } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import GetUser from '@/services/getUser';
import UpdateUser from '@/services/updateUser';
import ChangePassword from '@/services/changePassword';
import { toast } from 'react-toastify';
import { Label } from '@/components/ui/label';

export default function UserProfile() {
	const { id } = useParams();
	const [showOldPassword, setShowOldPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const queryClient = useQueryClient();
	const [isEditMode, setIsEditMode] = useState(false);
	const [isPasswordMode, setIsPasswordMode] = useState(false);

	const { data, isLoading, error } = useQuery({
		queryKey: ['user', id],
		queryFn: () => GetUser(Number(id)),
		staleTime: 5 * 1000,
	});

	const user = data?.data;

	const form = useForm({
		resolver: zodResolver(UserFormSchema),
		defaultValues: user || {
			name: '',
			email: '',
			phone_number: '',
			role: '',
		},
	});

	useEffect(() => {
		if (user) {
			form.reset(user);
		}
	}, [user]);

	const updateMutation = useMutation({
		mutationFn: UpdateUser,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['user', id] });
			setIsEditMode(false);
			toast.success('Profile updated successfully');
		},
		onError: (error: any) => {
			toast.error(error.message);
		},
	});

	const passwordForm = useForm({
		defaultValues: {
			old_password: '',
			password: '',
		},
	});

	const passwordMutation = useMutation({
		mutationFn: ChangePassword,
		onSuccess: async () => {
			passwordForm.reset();
			setIsPasswordMode(false);
			toast.success('Password changed successfully');
		},
		onError: (error: any) => {
			toast.error(error.message);
		},
	});

	if (isLoading) return <Spinner />;
	if (error) return <ErrorCard message={error.message} />;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
					User Profile
				</h1>
				<p className="text-muted-foreground">
					View and update your profile details
				</p>
			</div>
			<Card className="shadow-card">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Pencil className="w-5 h-5 text-blue-600" /> Profile
						Details
					</CardTitle>
				</CardHeader>
				<CardContent>
					{isEditMode ? (
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit((data) =>
									updateMutation.mutate({
										id: Number(id),
										data: data,
									}),
								)}
								className="space-y-4"
							>
								<div className="grid grid-cols-1 md:grid-cols-2 space-y-4 gap-4">
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
														placeholder="Name"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="email"
										render={({ field }) => (
											<FormItem>
												<Label className="text-gray-700 font-semibold">
													Email
												</Label>
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
										control={form.control}
										name="phone_number"
										render={({ field }) => (
											<FormItem>
												<Label className="text-gray-700 font-semibold">
													Phone Number
												</Label>
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
								</div>
								<div className="flex justify-end gap-2 mt-4">
									<Button
										type="button"
										variant="outline"
										className="cursor-pointer"
										onClick={() => setIsEditMode(false)}
									>
										Cancel
									</Button>
									<Button
										type="submit"
										className="gradient-primary flex items-center gap-2 cursor-pointer"
									>
										<Save className="w-4 h-4" /> Save
										Changes
									</Button>
								</div>
							</form>
						</Form>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<p className="text-sm text-muted-foreground">
									Name
								</p>
								<p className="font-semibold text-lg">
									{user?.name}
								</p>
							</div>
							<div className="space-y-2">
								<p className="text-sm text-muted-foreground">
									Email
								</p>
								<p className="font-semibold text-lg">
									{user?.email}
								</p>
							</div>
							<div className="space-y-2">
								<p className="text-sm text-muted-foreground">
									Phone
								</p>
								<p className="font-semibold text-lg">
									{user?.phone_number}
								</p>
							</div>
							<div className="space-y-2">
								<p className="text-sm text-muted-foreground">
									Role
								</p>
								<p className="font-semibold text-lg">
									{user?.role}
								</p>
							</div>
							<div className="flex justify-end mt-4 col-span-2">
								<Button
									variant="outline"
									onClick={() => setIsEditMode(true)}
									className="flex items-center gap-2 cursor-pointer"
								>
									<Pencil className="w-4 h-4" /> Edit Profile
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
			<Card className="shadow-card">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<KeyRound className="w-5 h-5 text-red-500" /> Change
						Password
					</CardTitle>
				</CardHeader>
				<CardContent>
					{isPasswordMode ? (
						<Form {...passwordForm}>
							<form
								onSubmit={passwordForm.handleSubmit((data) =>
									passwordMutation.mutate({
										id: Number(id),
										password: data.password,
										old_password: data.old_password,
									}),
								)}
								className="space-y-4"
							>
								<div className="space-y-4 ">
									<FormField
										control={passwordForm.control}
										name="old_password"
										render={({ field }) => (
											<FormItem>
												<Label className="text-gray-700 font-semibold">
													Current Password
												</Label>
												<FormControl>
													<div className="relative">
														<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
														<Input
															placeholder="*******"
															className="pl-10 border-2 placeholder:text-sm placeholder:text-gray-500 border-gray-200 focus:border-green-500 rounded-xl"
															{...field}
															type={
																showOldPassword
																	? 'text'
																	: 'password'
															}
														/>
														<Button
															type="button"
															className="absolute cursor-pointer bg-transparent right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 hover:cursor-pointer hover:bg-transparent w-5 h-5"
															size={'icon'}
															onClick={() =>
																setShowOldPassword(
																	(
																		prevState,
																	) =>
																		!prevState,
																)
															}
														>
															{showOldPassword ? (
																<EyeOff />
															) : (
																<Eye />
															)}
														</Button>
													</div>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={passwordForm.control}
										name="password"
										render={({ field }) => (
											<FormItem>
												<Label className="text-gray-700 font-semibold">
													New Password
												</Label>
												<FormControl>
													<div className="relative">
														<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
														<Input
															placeholder="*******"
															className="pl-10 border-2 placeholder:text-sm placeholder:text-gray-500 border-gray-200 focus:border-green-500 rounded-xl"
															{...field}
															type={
																showNewPassword
																	? 'text'
																	: 'password'
															}
														/>
														<Button
															type="button"
															className="absolute bg-transparent right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 hover:cursor-pointer hover:bg-transparent w-5 h-5"
															size={'icon'}
															onClick={() =>
																setShowNewPassword(
																	(
																		prevState,
																	) =>
																		!prevState,
																)
															}
														>
															{showNewPassword ? (
																<EyeOff />
															) : (
																<Eye />
															)}
														</Button>
													</div>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<div className="flex justify-end gap-2 mt-4 col-span-2">
									<Button
										type="button"
										variant="outline"
										className="cursor-pointer"
										onClick={() => setIsPasswordMode(false)}
									>
										Cancel
									</Button>
									<Button
										type="submit"
										className="gradient-primary flex items-center gap-2 cursor-pointer"
									>
										<KeyRound className="w-4 h-4" /> Change
										Password
									</Button>
								</div>
							</form>
						</Form>
					) : (
						<div className="flex justify-end mt-2">
							<Button
								variant="outline"
								onClick={() => setIsPasswordMode(true)}
								className="flex items-center gap-2 cursor-pointer"
							>
								<KeyRound className="w-4 h-4" /> Change Password
							</Button>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
