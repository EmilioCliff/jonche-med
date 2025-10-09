import api from '@/api/api';
import type { GetTransactionsResponse, ListCommonProps } from '@/lib/types';
import { isAxiosError } from 'axios';

const GetTransactions = async (data: ListCommonProps) => {
	try {
		let baseUrl = `/products/movements?limit=${data.pageSize}&page=${data.pageNumber}`;

		if (data.ProductID) {
			baseUrl =
				baseUrl + `&product_id=${encodeURIComponent(data.ProductID)}`;
		}
		if (data.Type) {
			baseUrl = baseUrl + `&type=${encodeURIComponent(data.Type)}`;
		}
		if (data.BatchNumber) {
			baseUrl =
				baseUrl +
				`&batch_number=${encodeURIComponent(data.BatchNumber)}`;
		}
		if (data.FromDate) {
			baseUrl = baseUrl + `&from=${encodeURIComponent(data.FromDate)}`;
		}
		if (data.ToDate) {
			baseUrl = baseUrl + `&to=${encodeURIComponent(data.ToDate)}`;
		}

		const response = await api
			.get<GetTransactionsResponse>(baseUrl)
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

export default GetTransactions;
