import { Button } from './ui/button';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select';

export interface PaginationProps {
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
	hasNext: boolean;
	hasPrevious: boolean;
	nextPage: number;
	previousPage: number;
	onPageChange: (page: number) => void;
	onPageSizeChange: (size: number) => void;
}

export default function Pagination({
	page,
	totalPages,
	hasNext,
	hasPrevious,
	nextPage,
	previousPage,
	pageSize,
	onPageChange,
	onPageSizeChange,
}: PaginationProps) {
	return (
		<div className="flex flex-col md:flex-row md:items-center justify-between py-4 px-4 gap-2">
			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					disabled={!hasPrevious}
					onClick={() => onPageChange(previousPage)}
				>
					Previous
				</Button>
				<span className="mx-4 text-sm">
					Page {page} of {totalPages}
				</span>
				<Button
					variant="outline"
					disabled={!hasNext}
					onClick={() => onPageChange(nextPage)}
				>
					Next
				</Button>
			</div>
			<div className="flex items-center gap-2 px-4">
				<span className="text-sm">Rows per page:</span>
				<Select
					value={String(pageSize)}
					defaultValue={String(pageSize)}
					onValueChange={(val) => {
						onPageChange(1);
						onPageSizeChange(Number(val));
					}}
				>
					<SelectTrigger className="w-75px]">
						<SelectValue placeholder={pageSize} />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectItem value="10">10</SelectItem>
							<SelectItem value="20">20</SelectItem>
							<SelectItem value="30">30</SelectItem>
							<SelectItem value="40">40</SelectItem>
							<SelectItem value="50">50</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}
