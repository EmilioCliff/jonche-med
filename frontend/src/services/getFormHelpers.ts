import api from '@/api/api';
import type { CommonHelpersResponse } from '@/lib/types';
import { isAxiosError } from 'axios';

const GetFormHelpers = async () => {
	try {
		const response = await api
			.get<CommonHelpersResponse>('/products/form')
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

export default GetFormHelpers;
