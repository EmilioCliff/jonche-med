import api from '@/api/api';
import type { GetUsersResponse, ListCommonProps } from '@/lib/types';
import { isAxiosError } from 'axios';

const GetUsers = async (data: ListCommonProps) => {
	try {
		let baseUrl = `/users?limit=${data.pageSize}&page=${
			data.pageNumber + 1
		}`;

		if (data.Search) {
			baseUrl = baseUrl + `&search=${encodeURIComponent(data.Search)}`;
		}
		if (data.Role) {
			baseUrl = baseUrl + `&role=${encodeURIComponent(data.Role)}`;
		}

		const response = await api
			.get<GetUsersResponse>(baseUrl)
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

export default GetUsers;
