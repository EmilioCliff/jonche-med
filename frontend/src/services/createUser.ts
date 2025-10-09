import api from '@/api/api';
import type { UserResponse, UserForm } from '@/lib/types';
import { isAxiosError } from 'axios';

const CreateUser = async (data: UserForm) => {
	try {
		const response = await api
			.post<UserResponse>('/users', data)
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

export default CreateUser;
