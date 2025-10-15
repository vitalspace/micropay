import type { AddEquation } from 'three';
import axios from './axios';

// Users

export const createUser = async (body: any) => await axios.post('/create-user', body);
export const profile = async (body: any) => await axios.post('/profile', body);
export const updateProfile = async (body: any) => await axios.put('/update-user', body);

// Messages

export const createMessage = async (body: { sender_address: string; receiver_address: string; message: string; service_id?: number; subject?: string }) => await axios.post('/messages', body);

export const getUserMessages = async (
	address: string,
	params?: {
		page?: number;
		limit?: number;
	}
) => {
	const response = await axios.get('/messages/user', {
		params: { address, ...params }
	});
	return response.data;
};

export const getConversation = async (
	userAddress: string,
	otherAddress: string,
	params?: {
		page?: number;
		limit?: number;
		service_id?: number;
	}
) => {
	const response = await axios.get(`/messages/conversation/${userAddress}/${otherAddress}`, {
		params
	});
	return response.data;
};

// Services
export const createService = async (body: any) => await axios.post('/services', body);

// AI

export const improveService = async (body: any) => await axios.post('/improve', body);
export const analyzeService = async (body: any) => await axios.post('/analyze-service', body);
