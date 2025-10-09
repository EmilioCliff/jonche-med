import { AlertTriangle } from 'lucide-react';

export default function ErrorCard({ message }: { message: string }) {
	return (
		<div className="flex items-center gap-3 bg-gradient-to-r from-red-100 via-red-50 to-green-50 border border-red-300 rounded-xl p-4 shadow-lg animate-in fade-in slide-in-from-bottom duration-500">
			<div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-200">
				<AlertTriangle className="text-red-600 w-6 h-6" />
			</div>
			<div className="flex-1">
				<p className="text-red-700 font-semibold text-base">
					Oops! Something went wrong.
				</p>
				<p className="text-gray-700 text-sm">{message}</p>
			</div>
		</div>
	);
}
