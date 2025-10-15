<script lang="ts">
	import {
		Building2,
		Edit,
		Heart,
		Package,
		Users,
		Calendar,
		CheckCircle,
		XCircle
	} from 'lucide-svelte';

	type ServiceType = 'donation' | 'service' | 'product';

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

	interface Props {
		service: Service;
		serviceId: string;
		onEdit?: (service: Service) => void;
		onSelect?: (service: Service) => void;
		onToggleStatus?: (serviceId: string, isActive: boolean) => void;
	}

	let { service, serviceId, onEdit, onSelect, onToggleStatus }: Props = $props();

	const extractNumber = (formatted: string): number => {
		if (!formatted) return 0;
		const match = formatted.match(/[\d,]+(\.\d+)?/);
		if (!match) return 0;
		return parseFloat(match[0].replace(/,/g, ''));
	};

	const totalRaised = $derived(extractNumber(service.totalRaisedFormatted || '0'));
	const goalAmount = $derived(extractNumber(service.amountFormatted || '0'));
	const progressPercentage = $derived(
		goalAmount > 0 ? Math.min((totalRaised / goalAmount) * 100, 100) : 0
	);

	// Determinar si es una donación
	const isDonation = $derived(service.service_type?.toLowerCase() === 'donation');

	const IconComponent = $derived(() => {
		const type = service.service_type?.toLowerCase();
		switch (type) {
			case 'donation':
				return Heart;
			case 'service':
			case 'business':
				return Building2;
			case 'product':
				return Package;
			default:
				return Package;
		}
	});

	const formatRelativeTime = (date: Date): string => {
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return 'just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 30) return `${diffDays}d ago`;

		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	};

	function handleEdit(e: Event) {
		e.stopPropagation();
		onEdit?.(service);
	}

	function handleView(e: Event) {
		e.stopPropagation();
		onSelect?.(service);
	}

	function handleToggle(e: Event) {
		e.stopPropagation();
		onToggleStatus?.(serviceId, service.is_active);
	}
</script>

<div
	class="group rounded-3xl border border-white/20 bg-white/80 p-6 shadow-lg shadow-purple-500/5 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20 h-[420px] flex flex-col"
	class:opacity-60={!service.is_active}
	onclick={() => onSelect?.(service)}
	onkeydown={(e) => e.key === 'Enter' && onSelect?.(service)}
	role="button"
	tabindex="0"
>
	<!-- Service Header -->
	<div class="mb-4 flex items-start gap-4 h-20 flex-shrink-0">
		<div class="relative flex-shrink-0">
			{#if service.image_url}
				<img
					class="h-16 w-16 rounded-2xl border-2 border-purple-100 shadow-md object-cover"
					src={service.image_url}
					alt={service.name}
					onerror={(e) => {
						e.currentTarget.style.display = 'none';
						e.currentTarget.nextElementSibling?.classList?.remove('hidden');
					}}
				/>
				<div
					class="hidden h-16 w-16 rounded-2xl border-2 border-purple-100 shadow-md bg-gradient-to-br from-purple-100 to-indigo-100 items-center justify-center"
				>
					<IconComponent class="w-8 h-8 text-purple-600" />
				</div>
			{:else}
				<div
					class="h-16 w-16 rounded-2xl border-2 border-purple-100 shadow-md bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center"
				>
					<IconComponent class="w-8 h-8 text-purple-600" />
				</div>
			{/if}

			<!-- Status indicator -->
			<div
				class="absolute -bottom-1 -right-1 rounded-full border-2 border-white p-1"
				class:bg-green-500={service.is_active}
				class:bg-gray-400={!service.is_active}
			>
				{#if service.is_active}
					<CheckCircle class="w-3 h-3 text-white" />
				{:else}
					<XCircle class="w-3 h-3 text-white" />
				{/if}
			</div>
		</div>

		<div class="min-w-0 flex-1 h-full flex flex-col justify-start">
			<h3 class="text-gray-900 font-bold text-base leading-tight mb-1 line-clamp-2 overflow-hidden">
				{service.name}
			</h3>
			<p class="text-gray-500/90 text-xs leading-tight line-clamp-2 overflow-hidden">
				{service.description || 'No description available'}
			</p>
		</div>

		<!-- Edit button -->
		<!-- {#if onEdit}
            <button
                onclick={handleEdit}
                class="p-2 rounded-xl text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200 flex-shrink-0"
                aria-label="Edit service"
            >
                <Edit class="w-4 h-4" />
            </button>
        {/if} -->
	</div>

	<!-- Status and Type Badges -->
	<div class="mb-4 flex items-center gap-2 h-6 flex-shrink-0">
		<!-- Status Badge -->
		{#if service.is_active}
			<span
				class="rounded-md border border-green-500/20 bg-green-500/20 px-2 py-1 text-xs font-semibold text-green-600 leading-none"
			>
				Active
			</span>
		{:else}
			<span
				class="rounded-md border border-gray-500/20 bg-gray-500/10 px-2 py-1 text-xs font-semibold text-gray-600 leading-none"
			>
				Inactive
			</span>
		{/if}

		<!-- Type Badge -->
		<span
			class="rounded-md border border-purple-500/20 bg-purple-500/20 px-2 py-1 text-xs font-semibold text-purple-600 capitalize leading-none"
		>
			{service.service_type || 'service'}
		</span>
	</div>

	<!-- Amount Section - Conditional rendering based on type -->
	{#if isDonation}
		<!-- DONATION: Show raised amount and goal -->
		<div class="mb-4 flex items-baseline gap-2 h-12 flex-shrink-0">
			<span
				class="bg-gradient-to-br from-purple-600 to-indigo-600 bg-clip-text text-4xl font-bold text-transparent leading-none"
			>
				{totalRaised.toLocaleString()}
			</span>
			<span class="text-gray-500/90 text-sm font-medium">STRK raised</span>
		</div>
	{:else}
		<!-- SERVICE/PRODUCT: Show fixed price -->
		<div class="mb-4 flex flex-col gap-1 h-12 flex-shrink-0">
			<span class="text-xs text-gray-500/90 uppercase tracking-wide">Price</span>
			<div class="flex items-baseline gap-2">
				<span
					class="bg-gradient-to-br from-purple-600 to-indigo-600 bg-clip-text text-3xl font-bold text-transparent leading-none"
				>
					{goalAmount.toLocaleString()}
				</span>
				<span class="text-gray-500/90 text-sm font-medium">STRK</span>
			</div>
		</div>
	{/if}

	<!-- Progress Section - Conditional rendering -->
	<div class="flex-grow flex flex-col justify-between">
		{#if isDonation && goalAmount > 0}
			<!-- DONATION: Show progress bar and goal -->
			<div class="space-y-2">
				<!-- Progress Bar -->
				<div class="h-2 overflow-hidden rounded-full bg-purple-100">
					<div
						class="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-500"
						style="width: {progressPercentage}%"
					></div>
				</div>

				<!-- Progress Stats -->
				<div class="flex items-center justify-between text-xs">
					<span class="text-gray-500/90">
						{progressPercentage.toFixed(1)}% funded
					</span>
					<span class="font-medium text-purple-600 flex-shrink-0">
						Goal: {goalAmount.toLocaleString()} STRK
					</span>
				</div>
			</div>
		{:else if !isDonation}
			<!-- SERVICE/PRODUCT: Show purchase status -->
			<div class="space-y-2">
				{#if service.supporter_count > 0}
					<div
						class="flex items-center gap-2 text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2"
					>
						<CheckCircle class="w-4 h-4" />
						<span class="font-medium">
							{service.supporter_count}
							{service.supporter_count === 1 ? 'purchase' : 'purchases'}
						</span>
					</div>
				{:else}
					<div class="text-xs text-gray-500/90 bg-gray-50 rounded-lg px-3 py-2">
						No purchases yet
					</div>
				{/if}
			</div>
		{:else}
			<div class="text-xs text-gray-500/90">No funding goal set</div>
		{/if}

		<!-- Supporters Count -->
		<div class="mt-3 flex items-center gap-2 text-xs text-gray-500/90">
			<Users class="w-4 h-4" />
			<span>
				{service.supporter_count}
				{isDonation
					? service.supporter_count === 1
						? 'supporter'
						: 'supporters'
					: service.supporter_count === 1
						? 'buyer'
						: 'buyers'}
			</span>
		</div>

		<!-- Footer -->
		<div class="mt-auto pt-4 border-t border-purple-100 flex-shrink-0">
			<!-- Created Date -->
			<div class="flex items-center gap-2 text-xs text-gray-500/90 mb-2">
				<Calendar class="w-3 h-3" />
				<span>
					{service.createdAtDate ? formatRelativeTime(service.createdAtDate) : 'Unknown'}
				</span>
			</div>

			<div class="flex items-center justify-between">
				<div class="text-xs min-w-0 flex-1">
					<p class="font-mono text-gray-500/90 truncate">
						by: {service.owner.slice(0, 6)}...{service.owner.slice(-4)}
					</p>
				</div>

				<a
					href={`/c/${service.owner}/${serviceId}`}
					class="cursor-pointer rounded-md border border-purple-500/20 bg-purple-500/20 px-4 py-2 text-xs font-semibold text-purple-600 hover:bg-purple-500/30 transition-all flex-shrink-0 ml-3"
					onclick={handleView}
				>
					View
				</a>
			</div>
		</div>
	</div>
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
