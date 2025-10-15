import { contractService } from '$lib/services/contractServices';

export const useContract = () => {
	const createService = contractService.createService.bind(contractService);
	const getUserServices = contractService.getUserServices.bind(contractService);
	const getService = contractService.getService.bind(contractService);
	const payService = contractService.payService.bind(contractService);
	const getCurrentBalance = contractService.getTotalRevenue.bind(contractService);
	const getTotalSupporters = contractService.getTotalSupporters.bind(contractService);
	const getActiveServicesCount = contractService.getActiveServicesCount.bind(contractService);
	const withdrawAllFunds = contractService.withdrawAllFunds.bind(contractService);
	const getServiceSupporters = contractService.getServiceSupporters.bind(contractService);

	return {
		createService,
		getUserServices,
		getService,
		payService,
		getCurrentBalance,
		getTotalSupporters,
		getActiveServicesCount,
		getServiceSupporters,
		withdrawAllFunds
	};
};
