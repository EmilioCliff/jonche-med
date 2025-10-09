import api from '@/api/api';
import type { UserResponse } from '@/lib/types';
import { isAxiosError } from 'axios';

const GetUser = async (id: number) => {
	try {
		const response = await api
			.get<UserResponse>(`/users/${id}`)
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

export default GetUser;
