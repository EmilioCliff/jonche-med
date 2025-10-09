import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from '@/components/ui/form';
import { Eye, EyeOff, Lock, Mail, Package } from 'lucide-react';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { LoginForm } from '@/lib/types';
import { LoginFormSchema } from '@/lib/schemas';
import { useMutation } from '@tanstack/react-query';

export default function Login() {
	const [showPassword, setShowPassword] = useState(false);
	const { login } = useAuth();
	const navigate = useNavigate();

	const loginForm = useForm<LoginForm>({
		resolver: zodResolver(LoginFormSchema),
	});

	const loginMutation = useMutation({
		mutationFn: login,
		onSuccess: async (data) => {
			toast.success(`Welcome back ${data.data.user.name}!`);
			navigate('/');
		},
		onError: (error: any) => {
			toast.error(error.message);
		},
	});

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
			<Card className="w-full max-w-md shadow-elevated">
				<CardHeader className="space-y-4 text-center">
					<div className="mx-auto w-16 h-16 rounded-2xl bg-secondary-foreground flex items-center justify-center shadow-elevated">
						<Package className="w-8 h-8 text-secondary" />
					</div>
					<div>
						<CardTitle className="text-2xl font-bold">
							ChemStock
						</CardTitle>
						<CardDescription>
							Sign in to your account
						</CardDescription>
					</div>
				</CardHeader>
				<CardContent>
					<Form {...loginForm}>
						<form
							onSubmit={loginForm.handleSubmit((data) =>
								loginMutation.mutate(data),
							)}
							className="space-y-8"
						>
							<FormField
								control={loginForm.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<Label className="text-gray-700 font-semibold">
											Email
										</Label>
										<FormControl>
											<div className="relative">
												<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
												<Input
													placeholder="example@gmail.com"
													className="pl-10 border-2 placeholder:text-sm placeholder:text-gray-500 border-gray-200 focus:border-green-500 rounded-xl"
													{...field}
												/>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={loginForm.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<Label className="text-gray-700 font-semibold">
											Password
										</Label>
										<FormControl>
											<div className="relative">
												<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
												<Input
													placeholder="*******"
													className="pl-10 border-2 placeholder:text-sm placeholder:text-gray-500 border-gray-200 focus:border-green-500 rounded-xl"
													{...field}
													type={
														showPassword
															? 'text'
															: 'password'
													}
												/>
												<Button
													type="button"
													className="absolute bg-transparent right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 hover:cursor-pointer hover:bg-transparent w-5 h-5"
													size={'icon'}
													onClick={() =>
														setShowPassword(
															(prevState) =>
																!prevState,
														)
													}
												>
													{showPassword ? (
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
							<Button
								type="submit"
								className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
								disabled={loginMutation.isPending}
							>
								{loginMutation.isPending
									? 'Logging in...'
									: 'Login'}
							</Button>
							{/* </div> */}
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
