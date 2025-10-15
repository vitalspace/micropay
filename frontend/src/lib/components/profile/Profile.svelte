<script lang="ts">
	import Card2 from '$lib/components/ui/Card2.svelte';
	import { useApi } from '$lib/hooks/useApi';
	import { useContract } from '$lib/hooks/useContract';
	import { useWallet } from '$lib/hooks/useWallet';
	import { User } from 'lucide-svelte';
	import { onMount } from 'svelte';

	const { profile } = useApi();
	const { getUserServices } = useContract();

	let profileLoading = $state(false);
	let profileError = $state(false);
	let userProfile: any = $state(null);

	let loading = $state(false);

	let services = $state<any[]>([]);

	const { address, id } = $props();

	const load = async () => {
		if (!address) return;

		profileLoading = true;
		profileError = false;

		try {
			userProfile = (await profile({ address: address })).data;
			services = await getUserServices(address);
		} catch (error) {
			profileError = true;
		} finally {
			profileLoading = false;
		}
	};

	const handleSelect = (campaign: any) => {
		window.location.href = `/campaign/${campaign.owner}/${services.indexOf(campaign)}`;
	};

	onMount(() => {
		load();
	});

	$effect(() => {
		if (address) {
			load();
		}
	});
</script>

<div class="container mx-auto px-4 max-w-7xl relative z-10 pt-28 pb-10">
	{#if profileLoading}
		<!-- Profile Loading State -->
		<div
			class="mb-12 rounded-3xl border border-white/20 bg-white/80 p-8 shadow-2xl shadow-purple-500/10 backdrop-blur-xl"
		>
			<div class="flex flex-col items-start gap-8 md:flex-row md:items-center">
				<!-- Avatar Skeleton -->
				<div class="relative">
					<div
						class="h-28 w-28 rounded-full border-4 border-purple-100 shadow-xl bg-gray-200 animate-pulse"
					></div>
				</div>
				<!-- Info Skeleton -->
				<div class="flex-1 space-y-3">
					<div class="h-10 bg-gray-200 rounded animate-pulse w-64"></div>
					<div class="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
					<div class="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
				</div>
				<!-- Stats Skeleton -->
				<div class="flex w-full flex-wrap gap-4 md:w-auto">
					<div class="rounded-md p-4 bg-gray-200 animate-pulse w-20 h-16"></div>
					<div class="rounded-md p-4 bg-gray-200 animate-pulse w-20 h-16"></div>
					<div class="rounded-md p-4 bg-gray-200 animate-pulse w-20 h-16"></div>
				</div>
			</div>
		</div>
	{:else if profileError}
		<!-- Profile Error State -->
		<div
			class="mb-12 rounded-3xl border border-red-200 bg-red-50 p-8 shadow-2xl shadow-red-500/10 backdrop-blur-xl"
		>
			<div class="text-center">
				<h2 class="text-2xl font-bold text-red-800 mb-2">User Not Found</h2>
				<p class="text-red-600">The requested user profile could not be loaded.</p>
			</div>
		</div>
	{:else}
		<!-- Profile Header Card -->
		<div
			class="mb-12 rounded-3xl border border-white/20 bg-white/80 p-8 shadow-2xl shadow-purple-500/10 backdrop-blur-xl"
		>
			<div class="flex flex-col items-start gap-8 md:flex-row md:items-center">
				<!-- Avatar -->
				<div class="relative">
					<div
						class="h-28 w-28 rounded-full border-4 border-purple-100 shadow-xl dark:border-purple-900/70 overflow-hidden"
					>
						{#if userProfile?.avatar}
							<img src={userProfile.avatar} alt="Avatar" class="h-full w-full object-cover" />
						{:else}
							<div
								class="h-full w-full bg-gradient-to-br from-purple-200 to-indigo-200 flex items-center justify-center"
							>
								<User class="h-14 w-14 text-purple-600" />
							</div>
						{/if}
					</div>
				</div>

				<!-- Profile Info -->
				<div class="flex-1 space-y-3">
					<h2 class="text-foreground text-4xl font-bold">
						{userProfile?.nickname || 'Anonymous User'}
					</h2>
					{#if userProfile?.bio}
						<p class="text-muted-foreground text-base text-gray-500">
							{userProfile.bio}
						</p>
					{:else}
						<p class="text-muted-foreground text-base text-gray-500">
							Web3 Creator & Campaign Manager
						</p>
					{/if}
					{#if userProfile?.address}
						<span
							class="inline-block rounded-md border border-gray-200 px-3 py-1 text-sm text-gray-500 font-mono"
						>
							{userProfile.address.slice(0, 10)}...{userProfile.address.slice(-8)}
						</span>
					{/if}
				</div>

				<!-- Stats -->
				<div class="flex w-full flex-wrap gap-4 md:w-auto">
					<div class="rounded-md p-4 text-center shadow-lg shadow-purple-500/10">
						<p
							class="mb-2 bg-gradient-to-br from-purple-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent"
						>
							{services.length}
						</p>
						<span
							class="text-muted-foreground text-xs font-medium tracking-wider text-gray-500 uppercase"
							>Campaigns</span
						>
					</div>

					<div class="rounded-md p-4 text-center shadow-lg shadow-purple-500/10">
						<p
							class="mb-2 bg-gradient-to-br from-purple-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent"
						>
							{services.reduce((sum, c) => sum + Number(c.supporter_count), 0)}
						</p>
						<span
							class="text-muted-foreground text-xs font-medium tracking-wider text-gray-500 uppercase"
							>Supporters</span
						>
					</div>

					<div class="rounded-md p-4 text-center shadow-lg shadow-purple-500/10">
						<p
							class="mb-2 bg-gradient-to-br from-purple-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent"
						>
							{(services.reduce((sum, c) => sum + Number(c.total_raised), 0) / 1e18).toFixed(2)}
						</p>
						<span
							class="text-muted-foreground text-xs font-medium tracking-wider text-gray-500 uppercase"
							>STRK Raised</span
						>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Campaigns Section Header -->
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h2 class="text-foreground mb-1 text-2xl font-bold">Active Campaigns</h2>
			<p class="text-muted-foreground text-sm">Discover and support amazing projects</p>
		</div>
		{#if services.length > 0}
			<div class="flex items-center space-x-2">
				<div class="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
				<span class="text-muted-foreground text-sm font-medium"
					>{services.filter((c) => c.is_active).length} active</span
				>
			</div>
		{/if}
	</div>

	{#if loading}
		<!-- Loading State -->
		<div class="rounded-3xl border border-white/20 bg-white/80 p-8 shadow-2xl shadow-purple-500/10 backdrop-blur-xl text-center py-16">
			<div class="relative inline-block">
				<div
					class="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"
				></div>
			</div>
			<h3 class="text-xl font-semibold text-gray-700 mt-6 mb-2">Loading campaigns...</h3>
			<p class="text-gray-500">Please wait while we fetch the latest data</p>
		</div>
	{:else if services.length === 0}
		<!-- Empty State -->
		<div class="rounded-3xl border border-white/20 bg-white/80 p-8 shadow-2xl shadow-purple-500/10 backdrop-blur-xl text-center py-16">
			<div class="relative mb-8">
				<div
					class="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto"
				>
					<div class="text-4xl">🚀</div>
				</div>
				<div
					class="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center"
				>
					<span class="text-xs">✨</span>
				</div>
			</div>
			<h3 class="text-2xl font-bold text-gray-900 mb-3">Ready to start something amazing?</h3>
			<p class="text-gray-600 mb-8 max-w-md mx-auto">
				This user hasn't created any campaigns yet. Be the first to support their future projects!
			</p>
			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				<button
					class="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
				>
					Follow User
				</button>
				<button
					class="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
				>
					Share Profile
				</button>
			</div>
		</div>
	{:else}
		<!-- Campaigns Grid -->
		<div class="rounded-3xl border border-white/20 bg-white/80 p-8 shadow-2xl shadow-purple-500/10 backdrop-blur-xl">
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each services as service, id}
				<Card2
					{service}
					onEdit={() => {}}
					serviceId={id.toString()}
					onToggleStatus={() => {}}
					onSelect={handleSelect}
				/>
			{/each}
			</div>
		</div>
	{/if}
</div>
