<script lang="ts">
	import { CircleCheck, CircleX, TriangleAlert, X } from 'lucide-svelte';
	import { removeToast } from '$lib/stores/toastStore';
	import type { Toast } from '$lib/stores/toastStore';

	interface Props {
		toast: Toast;
	}

	let { toast }: Props = $props();


	function getBgColor() {
		switch (toast.type) {
			case 'success':
				return 'bg-green-500';
			case 'error':
				return 'bg-red-500';
			case 'warn':
				return 'bg-yellow-500';
			default:
				return 'bg-gray-500';
		}
	}

	function getTextColor() {
		return 'text-white';
	}
</script>

<div
	class="flex items-center p-4 mb-2 rounded-lg shadow-lg {getBgColor()} {getTextColor()} max-w-sm"
>
	{#if toast.type === 'success'}
		<CircleCheck class="w-6 h-6 mr-3" />
	{:else if toast.type === 'error'}
		<CircleX class="w-6 h-6 mr-3" />
	{:else}
		<TriangleAlert class="w-6 h-6 mr-3" />
	{/if}

	<span class="flex-1">{toast.message}</span>
	<button
		onclick={() => removeToast(toast.id)}
		class="ml-3 p-1 rounded hover:bg-opacity-20 hover:bg-black"
	>
		<X class="w-4 h-4" />
	</button>
</div>
