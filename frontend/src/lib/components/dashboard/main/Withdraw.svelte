<script lang="ts">
	import { MoveUpRight, Send, Wallet } from 'lucide-svelte';

	import { useWallet } from '$lib/hooks/useWallet';
	import { useContract } from '$lib/hooks/useContract';
	import { onMount } from 'svelte';

	const { getCurrentBalance, withdrawAllFunds } = useContract();
	const { address } = useWallet();

	let balance = $state();
	let isWithdrawing = $state(false);

	const loadBalance = async () => {
		if (!address) return;
		const result = await getCurrentBalance($address);

		balance = result.formatted;
		console.log('Current Balance:', balance);
	};

	const handleWithdrawAll = async () => {
		if (!address) return;
		isWithdrawing = true;
		await withdrawAllFunds();
		isWithdrawing = false;
		await loadBalance();
	};

	onMount(() => {
		loadBalance();
	});
</script>

<div
	class="flex justify-between items-center bg-gradient-to-r from-purple-700 to-indigo-600 p-6 rounded-3xl text-white shadow-lg"
>
	<div class="grid gap-4">
		<div class="flex items-center mb-2">
			<div
				class="bg-white/30 p-3 rounded-full mr-3 flex items-center justify-center text-purple-200 shadow-lg"
			>
				<Wallet class="h-7 w-7" />
			</div>
			<span class="text-xl font-semibold tracking-wide drop-shadow-md">Current Balance</span>
		</div>

		<div>
			<span class="text-4xl font-extrabold tracking-tight drop-shadow-lg"> ${balance} </span>
			<div class="flex items-center mt-1 text-green-400 font-semibold">
				<MoveUpRight class="mr-1 h-5 w-5 drop-shadow-md" />
				<span class="text-base">+12.5% this month</span>
			</div>
		</div>
	</div>

	<div class="flex flex-col items-end space-y-2">
		<!-- <button
			class="bg-white/30 hover:bg-white/50 cursor-pointer text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-3 transition duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
			onclick={handleWithdrawAll}
			disabled={isWithdrawing}
		>
			<Send class="h-5 w-5" />
			<span>{isWithdrawing ? 'Withdrawing...' : 'Withdraw'}</span>
		</button> -->

		<button
			class="bg-white/30 hover:bg-white/50 cursor-pointer text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-3 transition duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
			onclick={handleWithdrawAll}
			disabled={false}
		>
			<Send class="h-5 w-5" />
			<span>{isWithdrawing ? 'Withdrawing...' : 'Withdraw'}</span>
		</button>
		<p class="text-sm text-white/80 italic font-medium select-none">instant deposit</p>
	</div>
</div>
