import { derived, type Readable } from 'svelte/store';

import { walletService, walletStore } from '$lib/services/walletServices';

export const useWallet = () => {
	const connectWallet = async () => await walletService.connectWallet();
	const disconnectWallet = async () => await walletService.disconnectWallet();
	const checkConnection = async () => await walletService.checkConnection();

	const isConnected: Readable<boolean> = derived(
		walletStore,
		($walletStore) => $walletStore.isConnected
	);

	const address: Readable<string> = derived(walletStore, ($walletStore) => $walletStore.address);

	return {
		connectWallet,
		disconnectWallet,
		checkConnection,
		isConnected,
		address
	};
};
