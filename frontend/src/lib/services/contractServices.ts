import { Contract, RpcProvider, CairoCustomEnum } from 'starknet';
import { connect } from 'get-starknet';
import { browser } from '$app/environment';
import { CONTRACT_ABI } from '$lib/constants/contants';

const CONTRACT_ADDRESS = '0x04263ae1290e77c7bd4dde480e5a48f462af926055d7b31437628ee82698e2d0';
const STRK_TOKEN_ADDRESS = '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d';

const CUSTOM_RPC_PROVIDER = new RpcProvider({
	nodeUrl: 'https://starknet-sepolia-rpc.publicnode.com'
});

// ✅ ABI actualizado con los nuevos métodos

const ERC20_ABI = [
	{
		type: 'function',
		name: 'approve',
		inputs: [
			{
				name: 'spender',
				type: 'core::starknet::contract_address::ContractAddress'
			},
			{
				name: 'amount',
				type: 'core::integer::u256'
			}
		],
		outputs: [{ type: 'core::bool' }],
		state_mutability: 'external'
	},
	{
		type: 'function',
		name: 'transfer',
		inputs: [
			{
				name: 'recipient',
				type: 'core::starknet::contract_address::ContractAddress'
			},
			{
				name: 'amount',
				type: 'core::integer::u256'
			}
		],
		outputs: [{ type: 'core::bool' }],
		state_mutability: 'external'
	},
	{
		type: 'function',
		name: 'balanceOf',
		inputs: [
			{
				name: 'account',
				type: 'core::starknet::contract_address::ContractAddress'
			}
		],
		outputs: [{ type: 'core::integer::u256' }],
		state_mutability: 'view'
	}
];

interface Service {
	owner: string;
	name: string;
	description: string;
	service_type: string;
	image_url: string;
	amount: string;
	total_raised: string;
	supporter_count: number;
	is_active: boolean;
	created_at: number;
	updated_at: number;
	amountFormatted?: string;
	totalRaisedFormatted?: string;
	createdAtDate?: Date;
	updatedAtDate?: Date;
}

class ContractService {
	private writeContract: Contract | null = null;
	private readContract: Contract;
	private walletAccount: any = null;

	constructor() {
		this.readContract = new Contract(CONTRACT_ABI, CONTRACT_ADDRESS, CUSTOM_RPC_PROVIDER);
	}

	formatAddress(address: any): string {
		let hex: string;

		// Convertir a string hexadecimal
		if (typeof address === 'string') {
			hex = address;
		} else if (typeof address === 'bigint' || typeof address === 'number') {
			hex = '0x' + BigInt(address).toString(16);
		} else {
			hex = address.toString();
		}

		// Si no empieza con 0x, agregar
		if (!hex.startsWith('0x')) {
			hex = '0x' + hex;
		}

		// Remover el prefijo 0x
		const withoutPrefix = hex.slice(2);

		// Remover todos los ceros al inicio
		const cleanHex = withoutPrefix.replace(/^0+/, '') || '0';

		// Retornar con prefijo
		return '0x' + cleanHex;
	}

	private formatWeiToEth(wei: string): string {
		try {
			const weiValue = BigInt(wei);
			const ethValue = Number(weiValue) / 1e18;

			if (ethValue === 0) return '0';

			if (ethValue >= 1000000) {
				return ethValue.toExponential(2);
			}

			if (ethValue >= 1000) {
				return ethValue.toLocaleString('en-US', {
					minimumFractionDigits: 0,
					maximumFractionDigits: 2
				});
			}

			if (ethValue < 0.000001) return ethValue.toExponential(2);
			if (ethValue < 1) return ethValue.toFixed(6).replace(/\.?0+$/, '');

			return ethValue.toFixed(4).replace(/\.?0+$/, '');
		} catch (error) {
			console.error('Error formatting wei:', error);
			return '0';
		}
	}

	private formatCurrency(wei: string, symbol: string = 'STRK'): string {
		const formatted = this.formatWeiToEth(wei);
		return `${formatted} ${symbol}`;
	}

	ethToWei(eth: string | number): string {
		const ethValue = typeof eth === 'string' ? parseFloat(eth) : eth;
		const weiValue = BigInt(Math.floor(ethValue * 1e18));
		return weiValue.toString();
	}

	private hexToString(hex: string): string {
		if (!hex || typeof hex !== 'string') {
			return '';
		}

		if (hex.startsWith('0x')) {
			hex = hex.slice(2);
		}
		try {
			const bytes = [];
			for (let i = 0; i < hex.length; i += 2) {
				bytes.push(parseInt(hex.substr(i, 2), 16));
			}
			return String.fromCharCode(...bytes);
		} catch {
			return '';
		}
	}

	private parseContractAddress(
		data: string[],
		startIndex: number
	): { value: string; nextIndex: number } {
		const address = data[startIndex];
		return { value: address, nextIndex: startIndex + 1 };
	}

	private parseByteArray(data: string[], startIndex: number): { value: string; nextIndex: number } {
		const dataArrayLength = parseInt(data[startIndex], 16);
		let currentIndex = startIndex + 1;

		const textParts: string[] = [];

		for (let i = 0; i < dataArrayLength; i++) {
			textParts.push(this.hexToString(data[currentIndex]));
			currentIndex++;
		}

		const pendingWord = data[currentIndex];
		if (pendingWord && pendingWord !== '0x0') {
			textParts.push(this.hexToString(pendingWord));
		}
		currentIndex += 2;

		return { value: textParts.join(''), nextIndex: currentIndex };
	}

	private parseU256(data: string[], startIndex: number): { value: string; nextIndex: number } {
		const low = BigInt(data[startIndex]);
		const high = BigInt(data[startIndex + 1]);
		const value = (high << 128n) | low;
		return { value: value.toString(), nextIndex: startIndex + 2 };
	}

	private parseU32(data: string[], startIndex: number): { value: number; nextIndex: number } {
		const value = parseInt(data[startIndex], 16);
		return { value, nextIndex: startIndex + 1 };
	}

	private parseBool(data: string[], startIndex: number): { value: boolean; nextIndex: number } {
		const value = data[startIndex] === '0x1' || data[startIndex] === '1';
		return { value, nextIndex: startIndex + 1 };
	}

	private parseU64(data: string[], startIndex: number): { value: number; nextIndex: number } {
		const value = parseInt(data[startIndex], 16);
		return { value, nextIndex: startIndex + 1 };
	}

	private parseEnum(data: string[], startIndex: number): { value: string; nextIndex: number } {
		const variantIndex = parseInt(data[startIndex], 16);
		const variants = ['Donation', 'Service', 'Product'];
		const value = variants[variantIndex] || 'Unknown';
		return { value, nextIndex: startIndex + 1 };
	}

	private normalizeString(str: string): string {
		return str
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/[^\x00-\x7F]/g, '');
	}

	private async getWriteContract() {
		if (!browser) return;

		const starknet = await connect();

		if (starknet && starknet.isConnected && starknet.account) {
			this.walletAccount = starknet.account;
			this.writeContract = new Contract(CONTRACT_ABI, CONTRACT_ADDRESS, starknet.account);
		}
		return this.writeContract;
	}

	async createService(
		name: string,
		description: string,
		serviceType: string,
		imageUrl: string,
		amount: string
	) {
		try {
			const contract = await this.getWriteContract();
			if (!contract) throw new Error('Wallet not connected');

			let cleanAmount = amount.toString().trim().replace(/,/g, '').replace(/\s/g, '');
			const amountFloat = parseFloat(cleanAmount);

			if (isNaN(amountFloat)) {
				throw new Error(`Invalid amount: ${amount}`);
			}

			let amountInWei: string;
			let amountInStrk: number;

			if (amountFloat > 1000000000000) {
				amountInStrk = amountFloat / 1e18;
				amountInWei = Math.floor(amountFloat).toString();
			} else {
				amountInStrk = amountFloat;
				amountInWei = this.ethToWei(amountFloat);
			}

			if (amountInStrk <= 0) {
				throw new Error('Amount must be greater than 0');
			}

			if (amountInStrk > 1000000) {
				throw new Error('Amount is too large. Maximum is 1,000,000 STRK');
			}

			const normalizedName = this.normalizeString(name);
			const normalizedDescription = this.normalizeString(description);

			const serviceTypeEnum = new CairoCustomEnum({
				Donation: serviceType === 'Donation' ? {} : undefined,
				Service: serviceType === 'Service' ? {} : undefined,
				Product: serviceType === 'Product' ? {} : undefined
			});

			const result = await contract.create_service(
				normalizedName,
				normalizedDescription,
				serviceTypeEnum,
				imageUrl,
				amountInWei
			);

			console.log('✅ Service created successfully!');
			return result;
		} catch (error) {
			console.error('Error creating service:', error);
			throw error;
		}
	}

	async getService(user: string, id: string): Promise<Service> {
		try {
			if (!browser) throw new Error('Not in browser environment');

			const result = await this.readContract.get_service(user, id);

			let serviceTypeStr = 'Unknown';
			if (result.service_type && typeof result.service_type === 'object') {
				if (typeof result.service_type.activeVariant === 'function') {
					serviceTypeStr = result.service_type.activeVariant();
				}
			} else if (typeof result.service_type === 'string') {
				serviceTypeStr = result.service_type;
			}

			const service: Service = {
				owner: result.owner.toString(),
				name: result.name,
				description: result.description,
				service_type: serviceTypeStr,
				image_url: result.image_url,
				amount: result.amount.toString(),
				total_raised: result.total_raised.toString(),
				supporter_count: Number(result.supporter_count),
				is_active: Boolean(result.is_active),
				created_at: Number(result.created_at),
				updated_at: Number(result.updated_at),
				amountFormatted: this.formatCurrency(result.amount.toString()),
				totalRaisedFormatted: this.formatCurrency(result.total_raised.toString()),
				createdAtDate: new Date(Number(result.created_at) * 1000),
				updatedAtDate: new Date(Number(result.updated_at) * 1000)
			};

			return service;
		} catch (error) {
			console.error('Error getting service:', error);
			throw error;
		}
	}

	async payService(user: string, id: string, payAmount: string) {
		try {
			const contract = await this.getWriteContract();
			if (!contract) throw new Error('Wallet not connected');

			let cleanAmount = payAmount.toString().trim();
			cleanAmount = cleanAmount.replace(/,/g, '');
			cleanAmount = cleanAmount.replace(/\s/g, '');

			const amountFloat = parseFloat(cleanAmount);

			if (isNaN(amountFloat)) {
				throw new Error(`Invalid payment amount: ${payAmount}`);
			}

			if (amountFloat <= 0) {
				throw new Error('Payment amount must be greater than 0');
			}

			const amountInWei = this.ethToWei(amountFloat);

			const token = new Contract(ERC20_ABI, STRK_TOKEN_ADDRESS, this.walletAccount);

			const approvalTx = await token.approve(CONTRACT_ADDRESS, amountInWei);

			await this.walletAccount.waitForTransaction(approvalTx.transaction_hash);

			const result = await contract.pay_service(user, id, amountInWei);

			return result;
		} catch (error) {
			console.error('Error paying service:', error);
			throw error;
		}
	}

	async withdrawFunds(id: string) {
		try {
			const contract = await this.getWriteContract();
			if (!contract) throw new Error('Wallet not connected');

			const result = await contract.withdraw_funds(id);

			return result;
		} catch (error) {
			console.error('Error withdrawing funds:', error);
			throw error;
		}
	}

	async toggleServiceStatus(id: string) {
		try {
			const contract = await this.getWriteContract();
			if (!contract) throw new Error('Wallet not connected');

			const result = await contract.toggle_service_status(id);

			console.log('✅ Service status toggled!');
			return result;
		} catch (error) {
			console.error('Error toggling service status:', error);
			throw error;
		}
	}

	async updateService(id: string, name: string, description: string, imageUrl: string) {
		try {
			const contract = await this.getWriteContract();
			if (!contract) throw new Error('Wallet not connected');

			const normalizedName = this.normalizeString(name);
			const normalizedDescription = this.normalizeString(description);

			const result = await contract.update_service(
				id,
				normalizedName,
				normalizedDescription,
				imageUrl
			);

			console.log('✅ Service updated successfully!');
			return result;
		} catch (error) {
			console.error('Error updating service:', error);
			throw error;
		}
	}

	async getStrkBalance(address: string): Promise<string> {
		try {
			const token = new Contract(ERC20_ABI, STRK_TOKEN_ADDRESS, CUSTOM_RPC_PROVIDER);
			const balance = await token.balanceOf(address);

			return this.formatCurrency(balance.toString(), 'STRK');
		} catch (error) {
			console.error('Error getting STRK balance:', error);
			return '0 STRK';
		}
	}

	async getUserServices(user: string): Promise<Service[]> {
		try {
			if (!browser) return [];

			const response = await CUSTOM_RPC_PROVIDER.callContract({
				contractAddress: CONTRACT_ADDRESS,
				entrypoint: 'get_user_services',
				calldata: [user]
			});

			let data: string[];

			if (Array.isArray(response)) {
				data = response;
			} else if (response && response.result) {
				data = response.result;
			} else {
				return [];
			}

			if (data.length === 0) {
				return [];
			}

			const arrayLength = parseInt(data[0], 16);

			if (arrayLength === 0) {
				return [];
			}

			const services: Service[] = [];
			let currentIndex = 1;

			for (let i = 0; i < arrayLength; i++) {
				const ownerResult = this.parseContractAddress(data, currentIndex);
				currentIndex = ownerResult.nextIndex;

				const nameResult = this.parseByteArray(data, currentIndex);
				currentIndex = nameResult.nextIndex;

				const descResult = this.parseByteArray(data, currentIndex);
				currentIndex = descResult.nextIndex;

				const typeResult = this.parseEnum(data, currentIndex);
				currentIndex = typeResult.nextIndex;

				const imageResult = this.parseByteArray(data, currentIndex);
				currentIndex = imageResult.nextIndex;

				const amountResult = this.parseU256(data, currentIndex);
				currentIndex = amountResult.nextIndex;

				const raisedResult = this.parseU256(data, currentIndex);
				currentIndex = raisedResult.nextIndex;

				const supporterCountResult = this.parseU32(data, currentIndex);
				currentIndex = supporterCountResult.nextIndex;

				const isActiveResult = this.parseBool(data, currentIndex);
				currentIndex = isActiveResult.nextIndex;

				const createdAtResult = this.parseU64(data, currentIndex);
				currentIndex = createdAtResult.nextIndex;

				const updatedAtResult = this.parseU64(data, currentIndex);
				currentIndex = updatedAtResult.nextIndex;

				services.push({
					owner: ownerResult.value,
					name: nameResult.value,
					description: descResult.value,
					service_type: typeResult.value,
					image_url: imageResult.value,
					amount: amountResult.value,
					total_raised: raisedResult.value,
					supporter_count: supporterCountResult.value,
					is_active: isActiveResult.value,
					created_at: createdAtResult.value,
					updated_at: updatedAtResult.value,
					amountFormatted: this.formatCurrency(amountResult.value),
					totalRaisedFormatted: this.formatCurrency(raisedResult.value),
					createdAtDate: new Date(createdAtResult.value * 1000),
					updatedAtDate: new Date(updatedAtResult.value * 1000)
				});
			}

			console.log('Parsed services:', services);
			return services;
		} catch (error) {
			console.error('Error getting user services:', error);
			return [];
		}
	}

	async canReceivePayment(user: string, id: string): Promise<boolean> {
		try {
			const result = await this.readContract.can_receive_payment(user, id);
			return Boolean(result);
		} catch (error) {
			console.error('Error checking if can receive payment:', error);
			return false;
		}
	}

	// ✅ NUEVOS MÉTODOS

	async getServiceSupporters(user: string, id: string): Promise<string[]> {
		try {
			if (!browser) throw new Error('Not in browser environment');

			const result = await this.readContract.get_service_supporters(user, id);

			const formattedSupporters = result.map((addr: any) => {
				if (typeof addr === 'string' && addr.startsWith('0x')) {
					return addr;
				}
				// Convert BigInt to hex SIN padStart
				try {
					const hexAddr = '0x' + BigInt(addr).toString(16); // ← QUITÉ .padStart(64, '0')
					return hexAddr;
				} catch {
					return addr.toString();
				}
			});

			return formattedSupporters;
		} catch (error) {
			console.error('Error getting service supporters:', error);
			return [];
		}
	}

	/**
	 * Obtiene el número de servicios activos de un usuario
	 * @param user Dirección del usuario
	 * @returns Número de servicios activos
	 */
	async getActiveServicesCount(user: string): Promise<number> {
		try {
			if (!browser) throw new Error('Not in browser environment');

			const result = await this.readContract.get_active_services_count(user);

			// El resultado es un u32, convertirlo a número
			return Number(result);
		} catch (error) {
			console.error('Error getting active services count:', error);
			return 0;
		}
	}

	/**
	 * Obtiene el revenue total de todos los servicios con saldo de un usuario
	 * @param user Dirección del usuario
	 * @returns Revenue total en formato string y formateado
	 */
	async getTotalRevenue(user: string): Promise<{ raw: string; formatted: string }> {
		try {
			if (!browser) throw new Error('Not in browser environment');

			const result = await this.readContract.get_total_revenue(user);

			// El resultado es un u256
			const revenueRaw = result.toString();
			const revenueFormatted = this.formatCurrency(revenueRaw);

			return {
				raw: revenueRaw,
				formatted: revenueFormatted
			};
		} catch (error) {
			console.error('Error getting total revenue:', error);
			return { raw: '0', formatted: '0 STRK' };
		}
	}

	async getTotalSupporters(user: string): Promise<number> {
		try {
			if (!browser) throw new Error('Not in browser environment');

			const result = await this.readContract.get_total_supporters(user);

			// El resultado es un u32, convertirlo a número
			return Number(result);
		} catch (error) {
			console.error('Error getting total supporters:', error);
			return 0;
		}
	}

	/**
	 * Retira todos los fondos disponibles de todos los servicios del usuario
	 * @returns El total retirado en formato string y formateado
	 */
	async withdrawAllFunds(): Promise<{ raw: string; formatted: string }> {
		try {
			const contract = await this.getWriteContract();
			if (!contract) throw new Error('Wallet not connected');

			const result = await contract.withdraw_all_funds();

			console.log('✅ All funds withdrawn successfully!');

			// El resultado es un u256 que contiene el total retirado
			// Nota: En transacciones, es posible que necesites esperar el receipt
			// para obtener el valor de retorno
			return {
				raw: '0', // Se actualizará después de procesar el receipt
				formatted: 'Processing...'
			};
		} catch (error) {
			console.error('Error withdrawing all funds:', error);
			throw error;
		}
	}
}

export const contractService = new ContractService();
