import api from '@/api/api';
import type { ProductResponse, StockUpdateForm } from '@/lib/types';
import { isAxiosError } from 'axios';

const AddProductStock = async ({
	id,
	data,
}: {
	id: number;
	data: StockUpdateForm;
}) => {
	try {
		const response = await api
			.post<ProductResponse>(`/products/${id}/add-stock`, data)
			.then((resp) => resp.data);

		if (response.message) {
			throw new Error(response.message);
		}

		return response;
	} catch (error: unknown) {
		if (isAxiosError(error)) {
			if (error.response) {
				throw new Error(error.response.data['message']);
			} else {
				throw new Error(
					'Error while processing request try again later',
				);
			}
		} else {
			throw new Error('Error while processing request try again later');
		}
	}
};

export default AddProductStock;
