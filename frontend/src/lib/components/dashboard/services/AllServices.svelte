<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { useWallet } from '$lib/hooks/useWallet';
	import { useContract } from '$lib/hooks/useContract';
	import Card2 from '$lib/components/ui/Card2.svelte';

	const { address } = useWallet();
	const { getUserServices } = useContract();

	// Make sure to import or define the Service type above if not already present
	let services: any = $state([]);
	let loading: boolean = $state(false);
	let error: string | null = null;

	const loadServices = async () => {
		try {
			loading = true;
			if ($address) {
				services = await getUserServices($address);
				console.log('Loaded services:', services);
			}
		} catch (error) {
			error = 'Failed to load campaigns';
			console.error('Error loading services:', error);
		} finally {
			loading = false;
		}
	};

	function handleEdit(campaign: any) {
		// TODO: Implement edit functionality
		console.log('Edit campaign:', campaign);
	}

	function handleToggle(campaignId: string, isActive: boolean) {
		// TODO: Implement toggle functionality
		console.log('Toggle campaign:', campaignId, isActive);
	}

	function handleSelect(campaign: any) {
		// TODO: Implement select functionality
		console.log('Select campaign:', campaign);
	}

	onMount(() => {
		loadServices();
	});
</script>

{#if loading}
	<div class="text-center py-12">
		<div class="text-4xl mb-4">⏳</div>
		<p class="text-gray-400">Loading campaigns...</p>
	</div>
{:else if error}
	<div class="text-center py-12">
		<div class="text-4xl mb-4">❌</div>
		<p class="text-red-400">{error}</p>
		<button
			onclick={loadServices}
			class="mt-4 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
		>
			Retry
		</button>
	</div>
{:else}
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		{#each services as service, id}
			<Card2
				{service}
				onEdit={handleEdit}
				serviceId={id.toString()}
				onToggleStatus={handleToggle}
				onSelect={handleSelect}
			/>
		{/each}
	</div>
{/if}

{#if services.length === 0}
	<div class="text-center py-12">
		<div class="text-6xl mb-4">📄</div>
		<h3 class="text-xl font-semibold text-white mb-2">No campaigns yet</h3>
		<p class="text-gray-400">Create your first campaign to start receiving payments</p>
	</div>
{/if}
