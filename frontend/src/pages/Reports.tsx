import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
	FileText,
	FileSpreadsheet,
	Download,
	BarChart2,
	Users,
	Package,
	ArrowLeftRight,
} from 'lucide-react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { DateRangePicker } from '@/components/DateRangePicker';

const REPORT_OPTIONS = [
	{
		label: 'Products Report',
		value: 'products',
		icon: <Package className="w-4 h-4 mr-2" />,
	},
	{
		label: 'Users Report',
		value: 'users',
		icon: <Users className="w-4 h-4 mr-2" />,
	},
	{
		label: 'Movements Report',
		value: 'movements',
		icon: <ArrowLeftRight className="w-4 h-4 mr-2" />,
	},
	{
		label: 'Stock Alerts',
		value: 'stock_alerts',
		icon: <BarChart2 className="w-4 h-4 mr-2" />,
	},
];

export default function Reports() {
	const [reportType, setReportType] = useState('products');
	const [format, setFormat] = useState('excel');
	const [dateRange, setDateRange] = useState({ from: '', to: '' });

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
					Reports
				</h1>
				<p className="text-muted-foreground">
					Generate and download inventory, user, and movement reports
				</p>
			</div>
			<Card className="shadow-card">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<FileText className="w-6 h-6 text-primary" />
						Generate Report
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-medium mb-2 text-muted-foreground">
									Report Type
								</label>
								<Select
									value={reportType}
									onValueChange={setReportType}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select report type" />
									</SelectTrigger>
									<SelectContent>
										{REPORT_OPTIONS.map((opt) => (
											<SelectItem
												key={opt.value}
												value={opt.value}
											>
												<span className="flex items-center">
													{opt.icon}
													{opt.label}
												</span>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div>
								<label className="block text-sm font-medium mb-2 text-muted-foreground">
									Format
								</label>
								<Select
									value={format}
									onValueChange={setFormat}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select format" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="excel">
											<FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />{' '}
											Excel (.xlsx)
										</SelectItem>
										<SelectItem value="pdf">
											<FileText className="w-4 h-4 mr-2 text-red-600" />{' '}
											PDF (.pdf)
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						<div>
							<label className="block text-sm font-medium mb-2 text-muted-foreground">
								Date Range
							</label>
							<DateRangePicker setTimeRange={setDateRange} />
							{dateRange.from && dateRange.to && (
								<p className="text-xs text-muted-foreground mt-2">
									Selected: {dateRange.from} - {dateRange.to}
								</p>
							)}
						</div>
						<div className="flex justify-end gap-2 mt-6">
							<Button
								className="gradient-primary flex items-center gap-2 cursor-pointer"
								disabled
							>
								<Download className="w-4 h-4" />
								Generate {format === 'excel' ? 'Excel' : 'PDF'}
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
			<Card className="shadow-card">
				<CardHeader>
					<CardTitle>How it works</CardTitle>
				</CardHeader>
				<CardContent>
					<ul className="list-disc pl-6 space-y-2 text-muted-foreground">
						<li>
							Select the type of report you want to generate
							(Products, Users, Movements, Stock Alerts).
						</li>
						<li>Choose your preferred format: Excel or PDF.</li>
						<li>Pick a date range for the report.</li>
						<li>
							Click the Generate button to download your report.
						</li>
						<li>
							Reports include all relevant data and are formatted
							for easy analysis and printing.
						</li>
					</ul>
				</CardContent>
			</Card>
		</div>
	);
}
