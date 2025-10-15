<script lang="ts">
	import { onMount } from 'svelte';
	import { useWallet } from '$lib/hooks/useWallet';

	const { isConnected, connectWallet } = useWallet();

	let isLoading = true;

	onMount(async () => {
		// Simulate initial loading time for connection check
		await new Promise(resolve => setTimeout(resolve, 1000));
		isLoading = false;
	});
</script>

{#if isLoading}
	<!-- Loading State -->
	<div class="min-h-screen flex items-center justify-center p-4">
		<div class="rounded-3xl border border-white/20 bg-white/80 p-8 shadow-2xl shadow-purple-500/10 backdrop-blur-xl text-center py-16 max-w-md w-full">
			<div class="relative inline-block">
				<div class="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
			</div>
			<h3 class="text-xl font-semibold text-gray-700 mt-6 mb-2">Checking wallet connection...</h3>
			<p class="text-gray-500">Please wait while we verify your wallet status</p>
		</div>
	</div>
{:else if $isConnected}
	<slot />
{:else}
	<!-- Wallet Connection Required State -->
	<div class="min-h-screen flex items-center justify-center p-4">
		<div class="rounded-3xl border border-white/20 bg-white/80 p-8 shadow-2xl shadow-purple-500/10 backdrop-blur-xl text-center py-16 max-w-md w-full">
			<div class="relative mb-8">
				<div class="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto">
					<svg class="h-12 w-12 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
					</svg>
				</div>
				<div class="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
					<span class="text-xs">🔒</span>
				</div>
			</div>
			<h2 class="text-2xl font-bold text-gray-900 mb-3">Wallet Connection Required</h2>
			<p class="text-gray-600 mb-8 max-w-md mx-auto">
				To access this page, you need to connect your wallet first. This ensures secure and personalized access to your account.
			</p>
			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				<button
					on:click={connectWallet}
					class="cursor-pointer px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
				>
					Connect Wallet
				</button>
			</div>
		</div>
	</div>
{/if}