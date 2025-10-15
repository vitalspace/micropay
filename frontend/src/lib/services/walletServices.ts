import { writable } from 'svelte/store';
import type { WalletState } from '../types/types';
import { RpcProvider, Contract } from 'starknet';
import { connect, disconnect } from 'get-starknet';
import { browser } from '$app/environment';
import { useApi } from '$lib/hooks/useApi';
import { json } from 'zod';
const { createUser } = useApi();

const STORAGE_KEY = 'walletState';

export const walletStore = writable({
	isConnected: false,
	address: ''
});

class WalletService {
	constructor() {
		this.checkConnection();
	}

	private updateWalletState(updated: Partial<WalletState>) {
		walletStore.update((state) => ({ ...state, ...updated }));
	}

	async connectWallet() {
		try {
			const starknet = await connect();
			if (starknet && starknet.isConnected) {
				const account = starknet.account;
				this.updateWalletState({ isConnected: true, address: account.address });

				if (browser) {
					localStorage.setItem(
						STORAGE_KEY,
						JSON.stringify({ isConnected: true, address: account.address })
					);
				}
				try {
					await createUser({ address: account.address });
				} catch (error) {
					// console.error('Error creating user:', error);
				}
			}
		} catch (error) {
			console.error('Error connecting to wallet:', error);
		}
	}

	async disconnectWallet() {
		try {
			await disconnect();
			this.updateWalletState({ isConnected: false, address: '' });
			if (!browser || !window.starknet) return;
			localStorage.removeItem(STORAGE_KEY);
		} catch (error) {
			console.error('Error disconnecting from wallet:', error);
		}
	}

	checkConnection() {
		try {
			if (!browser) return;

			if (window.starknet) {
				const stored = localStorage.getItem(STORAGE_KEY);
				if (stored) {
					const parsed = JSON.parse(stored);
					this.updateWalletState(parsed);
				}
			} else {
				this.updateWalletState({ isConnected: false, address: '' });
				localStorage.removeItem(STORAGE_KEY);
			}
		} catch (error) {
			console.error('Error checking wallet connection:', error);
			this.updateWalletState({ isConnected: false, address: '' });
		}
	}
}

export const walletService = new WalletService();
