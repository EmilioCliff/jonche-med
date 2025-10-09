import api from '@/api/api';
import type { GetProductsResponse, ListCommonProps } from '@/lib/types';
import { isAxiosError } from 'axios';

const GetProducts = async (data: ListCommonProps) => {
	try {
		let baseUrl = `/products?limit=${data.pageSize}&page=${data.pageNumber}`;

		if (data.Search) {
			baseUrl = baseUrl + `&search=${encodeURIComponent(data.Search)}`;
		}

		if (data.Status) {
			baseUrl = baseUrl + `&status=${encodeURIComponent(data.Status)}`;
		}

		const response = await api
			.get<GetProductsResponse>(baseUrl)
			.then((resp) => resp.data);

		if (response.message) {
			throw new Error(response.message);
		}

		return response;
	} catch (error: unknown) {
		console.log(error);
		if (isAxiosError(error)) {
			if (error.response) {
				throw new Error(error.response.data['message']);
			} else {
				throw new Error(error.message);
			}
		} else {
			throw new Error('Error while processing request try again later');
		}
	}
};

export default GetProducts;
