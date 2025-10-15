<script lang="ts">
	import Withdraw from '$lib/components/dashboard/main/Withdraw.svelte';
	import Card from '$lib/components/ui/Card1.svelte';
	import { useContract } from '$lib/hooks/useContract';
	import { useWallet } from '$lib/hooks/useWallet';
	import { activeTab } from '$lib/stores/stotes';
	import { Activity, DollarSign, Users } from 'lucide-svelte';

	import { onMount } from 'svelte';

	const { address } = useWallet();
	const { getActiveServicesCount, getTotalSupporters } = useContract();

	let activeServicesCount = $state(0);
	let totalSupporters = $state(0);

	const load = async () => {
		if (!address) return;

		activeServicesCount = await getActiveServicesCount($address);
		totalSupporters = await getTotalSupporters($address);
		console.log('Active Services Count:', activeServicesCount);
	};

	onMount(() => {
		load();
	});
</script>

<div class="grid gap-8">
	<Withdraw />
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
		<Card
			icon={Users}
			title="Total Supporters"
			description={`You have ${totalSupporters} active supporters this month.`}
			action=""
			onAction={() => console.log('Navegar a actividad')}
			variant="indigo"
		/>
		<Card
			icon={Activity}
			title="Active Services"
			description={`You are currently running ${activeServicesCount} active services.`}
			action="Manage Services"
			onAction={() => activeTab.set(1)}
			variant="purple"
		/>
		<Card
			icon={DollarSign}
			title="Total Revenue"
			description="Total revenue generated this month."
			action="View Reports"
			onAction={() => activeTab.set(3)}
			variant="teal"
		/>
	</div>
</div>
