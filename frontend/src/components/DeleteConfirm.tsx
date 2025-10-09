import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

type DeleteConfirmProps = {
	resourceName: string; // e.g. "user", "role", "project"
	open: boolean;
	action: string;
	fullDescription?: string;
	setOpen: (open: boolean) => void;
	onConfirm: () => void;
	onCancel?: () => void;
};

export default function DeleteConfirm({
	resourceName,
	fullDescription,
	action,
	onConfirm,
	onCancel,
	open,
	setOpen,
}: DeleteConfirmProps) {
	const [confirmText, setConfirmText] = useState('');

	const handleConfirm = () => {
		onConfirm();
		setOpen(false);
		setConfirmText('');
	};

	return (
		<div
			className="space-y-3 
		"
		>
			{/* Trigger */}
			<button
				onClick={() => setOpen(true)}
				className="px-4 py-2 bg-red-600 hidden text-white text-sm font-medium rounded-md hover:bg-red-700"
			>
				Delete {resourceName}
			</button>

			{/* Modal */}
			{open && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 space-y-4">
						<div className="flex items-start space-x-3">
							<AlertTriangle className="w-6 h-6 text-red-600" />
							<div>
								<h2 className="text-lg font-semibold text-gray-900">
									{/* Delete {resourceName} */}
									{fullDescription
										? fullDescription
										: `Delete ${resourceName}`}
								</h2>
								<p className="text-sm text-gray-600 mt-1">
									This action is{' '}
									<span className="font-bold text-red-600">
										irreversible
									</span>
									. To confirm, type{' '}
									<code className="bg-gray-100 px-1 rounded">
										{resourceName}
									</code>{' '}
									below.
								</p>
							</div>
						</div>

						<input
							type="text"
							placeholder={`Type "${resourceName}" to confirm`}
							value={confirmText}
							onChange={(e) => setConfirmText(e.target.value)}
							className="w-full border border-gray-300 rounded-md p-2 text-sm"
						/>

						<div className="flex justify-end space-x-2 pt-3">
							<button
								onClick={() => {
									setOpen(false);
									setConfirmText('');
									onCancel?.();
								}}
								className="px-4 py-2 rounded-md text-sm border border-gray-300 hover:bg-gray-50"
							>
								Cancel
							</button>
							<button
								onClick={handleConfirm}
								disabled={confirmText !== resourceName}
								className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
									confirmText === resourceName
										? 'bg-red-600 hover:bg-red-700'
										: 'bg-red-300 cursor-not-allowed'
								}`}
							>
								{action}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
