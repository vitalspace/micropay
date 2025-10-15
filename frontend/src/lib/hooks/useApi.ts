import {
	createService,
	createUser,
	profile,
	improveService,
	analyzeService,
	updateProfile,
	createMessage,
	getConversation,
	getUserMessages
} from '../services/apiServices';

export const useApi = () => {
	return {
		createUser,
		createServiceApi: createService,
		profile,
		improveService,
		analyzeService,
		updateProfile,
		createMessage,
		getConversation,
		getUserMessages
	};
};
