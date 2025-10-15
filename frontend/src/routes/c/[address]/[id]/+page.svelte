<!-- src/routes/c/[address]/[id]/+page.svelte -->

<script>
	import Service from '$lib/components/service/Service.svelte';

	/** @type {import('./$types').PageProps} */
	let { data } = $props();
	import ToastContainer from '$lib/components/ui/ToastContainer.svelte';
</script>

<Service userAddress={data.address} serviceId={data.id} />

<ToastContainer />

<!-- <div class="container mx-auto pt-28 text-white">
	<h1 class="text-3xl font-bold mb-4">Contract Details</h1>
	<p class="mb-2">Address: {data.address}</p>
	<p>ID: {data.id}</p>
</div> -->
