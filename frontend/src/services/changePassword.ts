import api from '@/api/api';
import type { CommonResponse } from '@/lib/types';
import { isAxiosError } from 'axios';

const ChangePassword = async ({
	id,
	old_password,
	password,
}: {
	id: number;
	old_password: string;
	password: string;
}) => {
	try {
		const response = await api
			.put<CommonResponse>(`/users/${id}/change-password`, {
				old_password,
				password,
			})
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

export default ChangePassword;
