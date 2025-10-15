<!-- src/routes/c/[address]/[id]/+page.svelte -->

<script>
	/** @type {import('./$types').PageProps} */
	let { data } = $props();
	import ToastContainer from '$lib/components/ui/ToastContainer.svelte';
	import Profile from '$lib/components/profile/Profile.svelte';

	console.log(data);
</script>

<!-- <Service userAddress={data.address} serviceId={data.id} /> -->

<Profile address={data.address} id={data.id} />
<ToastContainer />

<!-- <div class="container mx-auto pt-28 text-white">
	<h1 class="text-3xl font-bold mb-4">Contract Details</h1>
	<p class="mb-2">Address: {data.address}</p>
	<p>ID: {data.id}</p>
</div> -->
