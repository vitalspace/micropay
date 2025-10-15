<script lang="ts">
	import { useApi } from '$lib/hooks/useApi';
	import { useContract } from '$lib/hooks/useContract';
	import { useWallet } from '$lib/hooks/useWallet';
	import { activeTab } from '$lib/stores/stotes';
	import { showToast } from '$lib/stores/toastStore';
	import { Calendar, Link as LinkIcon, User } from 'lucide-svelte';
	import { onMount } from 'svelte';

	const { profile } = useApi();
	const { address } = useWallet();
	const { getUserServices, getCurrentBalance, getTotalSupporters } = useContract();

	let balance: any = $state({ formatted: '0', symbol: 'STRK' });
	let supporters = $state(0);
	let services: any[] = $state([]);
	let loading = true;
	let userProfile: any = $state({
		nickname: 'Loading...',
		avatar: '',
		bio: 'Loading profile...',
		address: ''
	});

	async function loadCampaigns() {
		if (!$address) return;
		try {
			loading = true;
			services = await getUserServices($address);
			userProfile = (await profile({ address: $address })).data;
			supporters = await getTotalSupporters($address);
			balance = await getCurrentBalance($address);
		} catch (err) {
			loading = false;
			console.error(err);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadCampaigns();
	});

	$effect(() => {
		if ($address) loadCampaigns();
	});

	async function shareProfile(address: string) {
		const url = `${window.location.origin}/u/${address}`;

		try {
			await navigator.clipboard.writeText(url);
			showToast('Profile link copied to clipboard!', 'success');
		} catch (error) {
			showToast('Failed to copy link', 'error');
		}
	}
</script>

<div
	class="bg-gradient-to-br from-slate-50 via-white to-gray-50 rounded-3xl p-8 border border-gray-200/50 shadow-lg relative overflow-hidden"
>
	<!-- Efectos de fondo sutiles -->
	<div
		class="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-100/30 to-cyan-100/20 rounded-full blur-2xl"
	></div>
	<div
		class="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-tr from-emerald-100/20 to-teal-100/15 rounded-full blur-3xl"
	></div>

	<div class="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
		<!-- Avatar Section Mejorada -->
		<div class="flex-shrink-0">
			<div class="relative">
				<div
					class="bg-white/80 backdrop-blur-sm p-4 rounded-3xl shadow-xl border border-white/50 group hover:shadow-2xl transition-all duration-300"
				>
					{#if userProfile.avatar}
						<img
							src={userProfile.avatar}
							alt="Avatar"
							class="h-24 w-24 rounded-2xl object-cover ring-4 ring-white/50"
						/>
					{:else}
						<div
							class="bg-gradient-to-br from-emerald-500 via-teal-500 to-green-600 p-4 rounded-2xl shadow-lg"
						>
							<User class="h-16 w-16 text-white drop-shadow-sm" />
						</div>
					{/if}
				</div>
				<!-- Indicador online -->
				<div
					class="absolute -bottom-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-4 border-white shadow-lg"
				>
					<div class="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
				</div>
			</div>
		</div>

		<!-- Profile Info Mejorada -->
		<div class="flex-1 text-center md:text-left space-y-6">
			<!-- Información principal -->
			<div class="space-y-3">
				<h2 class="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
					{userProfile.nickname || 'Anonymous User'}
				</h2>

				{#if userProfile.bio}
					<p class="text-gray-700 text-base leading-relaxed max-w-2xl">
						{userProfile.bio}
					</p>
				{:else}
					<p class="text-gray-500 text-base italic">
						No bio available yet. Add a description to tell others about yourself.
					</p>
				{/if}

				<!-- Información adicional -->
				<div
					class="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-600"
				>
					{#if userProfile.address}
						<div
							class="flex items-center gap-2 bg-gray-100/80 backdrop-blur-sm px-3 py-2 rounded-xl"
						>
							<LinkIcon class="h-4 w-4 text-gray-500" />
							<span class="font-mono text-xs">
								{userProfile.address.slice(0, 8)}...{userProfile.address.slice(-6)}
							</span>
						</div>
					{/if}

					<div
						class="flex items-center gap-2 bg-green-100/80 backdrop-blur-sm px-3 py-2 rounded-xl"
					>
						<Calendar class="h-4 w-4 text-green-600" />
						<span class="text-green-700 font-medium">Member since 2025</span>
					</div>
				</div>
			</div>

			<!-- Stats Grid Mejoradas -->
			<div class="grid grid-cols-3 gap-4">
				<div
					class="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-white/60 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
				>
					<div
						class="text-3xl font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors"
					>
						{services.length}
					</div>
					<div class="text-xs font-semibold text-gray-600 uppercase tracking-wider">Campaigns</div>
				</div>

				<div
					class="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-white/60 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
				>
					<div
						class="text-3xl font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors"
					>
						{supporters}
					</div>
					<div class="text-xs font-semibold text-gray-600 uppercase tracking-wider">Supporters</div>
				</div>

				<div
					class="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-white/60 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
				>
					<div
						class="text-3xl font-bold text-gray-900 mb-1 group-hover:text-pink-600 transition-colors"
					>
						{balance.formatted}
					</div>
					<div class="text-xs font-semibold text-gray-600 uppercase tracking-wider">Raised</div>
				</div>
			</div>

			<!-- Botones de acción -->
			<div class="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-4">
				<button
					onclick={() => activeTab.set(5)}
					class="cursor-pointer px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
				>
					Edit Profile
				</button>

				<button
					onclick={() => shareProfile($address)}
					class="cursor-pointer px-6 py-3 bg-white/80 backdrop-blur-sm text-gray-700 hover:text-gray-900 rounded-2xl font-semibold border border-gray-200/60 hover:border-gray-300/60 shadow-md hover:shadow-lg transition-all duration-300"
				>
					Share Profile
				</button>
			</div>
		</div>
	</div>
</div>
