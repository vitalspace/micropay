<script lang="ts">
	import { useContract } from '$lib/hooks/useContract';
	import { useWallet } from '$lib/hooks/useWallet';
	import { onMount } from 'svelte';
	import { createMessage, getConversation } from '$lib/services/apiServices';
	import { showToast } from '$lib/stores/toastStore';

	const { getService, payService, getServiceSupporters } = useContract();
	const { address } = useWallet();
	const { userAddress, serviceId } = $props();

	import {
		Building2,
		Calendar,
		DollarSign,
		Heart,
		Link,
		MessageCircle,
		Package,
		Share,
		ShoppingCart,
		User,
		Users,
		X,
		CheckCircle,
		FileText,
		Box,
		Award
	} from 'lucide-svelte';

	let loading = $state(false);
	let error: string | null = $state(null);
	let service: any = $state(null);
	let donationAmount = $state(0);

	let supporters: string[] = $state([]);

	let paymentLoading = $state(false);
	let paymentError: string | null = $state(null);
	let paymentSuccess = $state(false);
	let hasPaid = $state(false);

	let showChat = $state(false);
	let chatMessages: any[] = $state([]);
	let newMessage = $state('');
	let chatLoading = $state(false);

	const fetchService = async () => {
		try {
			loading = true;
			error = null;

			const result = await getService(userAddress, serviceId);
			supporters = await getServiceSupporters(userAddress, serviceId);

			console.log('Fetched service:', supporters);
			console.log('Current user address:', $address);

			// Debug logs removed - issue fixed

			service = {
				title: result.name,
				description: result.description,
				type: result.service_type,
				image: result.image_url,
				isActive: result.is_active,
				totalRaised: parseFloat(result.amountFormatted?.replace(' STRK', '') || '0'),
				donorCount: result.supporter_count,
				goal: parseFloat(result.amountFormatted?.replace(' STRK', '') || '0'),
				price: parseFloat(result.amountFormatted?.replace(' STRK', '') || '0'),
				balance: parseFloat(result.totalRaisedFormatted?.replace(' STRK', '') || '0'),
				createdAt: result.createdAtDate,
				updatedAt: result.updatedAtDate,
				createdBy: result.owner,
				rawAmount: result.amount,
				rawTotalRaised: result.total_raised
			};

			loading = false;
		} catch (err) {
			console.error('Error fetching service:', err);
			error = 'Failed to load service. Please try again later.';
			loading = false;
		}
	};

	const fetchChatMessages = async () => {
		try {
			const messages = await getConversation($address, service.createdBy, {
				service_id: parseInt(serviceId)
			});
			chatMessages = messages;
		} catch (err) {
			console.error('Error fetching chat messages:', err);
		}
	};

	const sendMessage = async () => {
		if (!newMessage.trim()) return;

		try {
			chatLoading = true;
			await createMessage({
				sender_address: $address,
				receiver_address: userAddress,
				message: newMessage,
				service_id: parseInt(serviceId)
			});
			newMessage = '';
			await fetchChatMessages();
			showToast('Message sent successfully!', 'success');
		} catch (err: any) {
			console.error('Error sending message:', err);
			const errorMessage = err.response?.data?.message || 'Failed to send message. Please try again.';
			showToast(errorMessage, 'error');
		} finally {
			chatLoading = false;
		}
	};

	const toggleChat = async () => {
		showChat = !showChat;
		if (showChat) {
			await fetchChatMessages();
		}
	};

	const handlePayment = async () => {
		try {
			paymentLoading = true;
			paymentError = null;
			paymentSuccess = false;

			let amountToPay: number;

			if (service.type === 'Donation') {
				amountToPay = donationAmount;
				if (!amountToPay || amountToPay <= 0) {
					throw new Error('Please enter a valid donation amount');
				}
			} else {
				amountToPay = service.price;
			}

			console.log('Processing payment:', {
				user: userAddress,
				serviceId: serviceId,
				amount: amountToPay,
				type: service.type
			});

			const result = await payService(userAddress, serviceId, amountToPay.toString());

			console.log('Payment successful:', result);

			paymentSuccess = true;
			hasPaid = true;
			paymentLoading = false;

			showToast('Payment completed successfully!', 'success');

			setTimeout(() => {
				fetchService();
			}, 10000);
		} catch (err: any) {
			console.error('Payment error:', err);
			paymentError = err.message || 'Payment failed. Please try again.';
			paymentLoading = false;
			showToast(paymentError || 'Payment failed. Please try again.', 'error');
		}
	};

	onMount(() => {
		fetchService();
	});
</script>

<div
	class="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 relative overflow-hidden"
>
	<!-- Efectos de fondo animados -->
	<div class="fixed inset-0 overflow-hidden pointer-events-none">
		<div
			class="absolute -top-40 -left-40 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl animate-pulse"
		></div>
		<div
			class="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-indigo-300/30 rounded-full blur-3xl animate-pulse"
			style="animation-delay: 1.5s;"
		></div>
		<div
			class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-pulse"
			style="animation-delay: 3s;"
		></div>
	</div>

	<div class="relative z-10 max-w-5xl mx-auto px-4 py-6 pt-24">
		{#if loading}
			<div class="flex items-center justify-center min-h-[80vh]">
				<div class="text-center">
					<div class="relative mb-8">
						<div
							class="w-16 h-16 mx-auto border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"
						></div>
					</div>
					<h3 class="text-2xl font-semibold text-gray-900 mb-2">Loading...</h3>
					<p class="text-gray-600 mb-6">Fetching details from StarkNet...</p>
				</div>
			</div>
		{:else if error}
			<div class="flex items-center justify-center min-h-[80vh]">
				<div class="text-center max-w-md mx-auto">
					<div
						class="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6"
					>
						<X size={24} class="text-red-600" />
					</div>
					<h2 class="text-2xl font-semibold text-gray-900 mb-3">Not Found</h2>
					<p class="text-red-600 text-base mb-8">{error}</p>
					<button
						onclick={() => window.history.back()}
						class="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg"
					>
						← Go Back
					</button>
				</div>
			</div>
		{:else if service}
			<!-- Header Card -->
			<div class="relative mb-8">
				<div
					class="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl shadow-purple-500/10"
				>
					<div class="flex items-start gap-6">
						<!-- Icon -->
						<div class="relative flex-shrink-0">
							{#if service.image}
								<img
									src={service.image}
									alt={service.title}
									class="w-24 h-24 rounded-2xl object-cover border-2 border-purple-100 shadow-md"
								/>
							{:else}
								<div
									class="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center border-2 border-purple-100 shadow-md"
								>
									{#if service.type === 'Donation'}
										<Heart size={32} class="text-purple-600" />
									{:else if service.type === 'Product'}
										<Package size={32} class="text-purple-600" />
									{:else}
										<Building2 size={32} class="text-purple-600" />
									{/if}
								</div>
							{/if}
							<div
								class="absolute -top-1 -right-1 w-5 h-5 {service.isActive
									? 'bg-green-500'
									: 'bg-red-500'} rounded-full border-2 border-white"
							></div>
						</div>

						<!-- Info -->
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-3 mb-3">
								<h1 class="text-3xl font-bold text-gray-900 truncate">
									{service.title}
								</h1>
								<div class="flex items-center gap-2 flex-shrink-0">
									<span
										class="px-3 py-1 bg-purple-500/20 text-purple-600 rounded-md text-xs font-semibold border border-purple-500/20 uppercase"
									>
										{service.type}
									</span>
									<span
										class="px-3 py-1 {service.isActive
											? 'bg-green-500/20 text-green-600 border-green-500/20'
											: 'bg-gray-500/20 text-gray-600 border-gray-500/20'} rounded-md text-xs font-semibold border uppercase"
									>
										{service.isActive ? 'ACTIVE' : 'PAUSED'}
									</span>
								</div>
							</div>

							<p class="text-gray-600 mb-6 leading-relaxed text-base">
								{service.description}
							</p>

							<!-- Quick Stats -->
							{#if service.type === 'Donation'}
								<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
									<div
										class="bg-white/50 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20 shadow-sm"
									>
										<div
											class="text-2xl font-bold bg-gradient-to-br from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-1"
										>
											{service.balance.toFixed(2)}
										</div>
										<div class="text-xs font-medium text-gray-500 uppercase tracking-wider">
											STRK Donated
										</div>
									</div>
									<div
										class="bg-white/50 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20 shadow-sm"
									>
										<div
											class="text-2xl font-bold bg-gradient-to-br from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-1"
										>
											{service.donorCount}
										</div>
										<div
											class="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center justify-center gap-1"
										>
											<Users size={12} />
											Donors
										</div>
									</div>
									<div
										class="bg-white/50 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20 shadow-sm"
									>
										<div
											class="text-2xl font-bold bg-gradient-to-br from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-1"
										>
											{service.goal.toFixed(2)}
										</div>
										<div class="text-xs font-medium text-gray-500 uppercase tracking-wider">
											Goal
										</div>
									</div>
									<div
										class="bg-white/50 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20 shadow-sm"
									>
										<div
											class="text-2xl font-bold bg-gradient-to-br from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-1"
										>
											{Math.round((service.balance / service.goal) * 100)}%
										</div>
										<div class="text-xs font-medium text-gray-500 uppercase tracking-wider">
											Progress
										</div>
									</div>
								</div>
							{:else if service.type === 'Product'}
								<div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
									<div
										class="bg-white/50 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20 shadow-sm"
									>
										<div
											class="text-2xl font-bold bg-gradient-to-br from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-1"
										>
											{service.price.toFixed(2)}
										</div>
										<div class="text-xs font-medium text-gray-500 uppercase tracking-wider">
											Price (STRK)
										</div>
									</div>
									<div
										class="bg-white/50 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20 shadow-sm"
									>
										<div
											class="text-2xl font-bold bg-gradient-to-br from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-1"
										>
											{service.donorCount}
										</div>
										<div
											class="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center justify-center gap-1"
										>
											<ShoppingCart size={12} />
											Purchased
										</div>
									</div>
									<div
										class="bg-white/50 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20 shadow-sm"
									>
										<div
											class="text-2xl font-bold bg-gradient-to-br from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-1"
										>
											{service.donorCount > 0
												? 'Sold'
												: service.isActive
													? 'In Stock'
													: 'Out of Stock'}
										</div>
										<div class="text-xs font-medium text-gray-500 uppercase tracking-wider">
											Availability
										</div>
									</div>
								</div>
							{:else}
								<div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
									<div
										class="bg-white/50 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20 shadow-sm"
									>
										<div
											class="text-2xl font-bold bg-gradient-to-br from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-1"
										>
											{service.price.toFixed(2)}
										</div>
										<div class="text-xs font-medium text-gray-500 uppercase tracking-wider">
											Service Cost
										</div>
									</div>
									<div
										class="bg-white/50 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20 shadow-sm"
									>
										<div
											class="text-2xl font-bold bg-gradient-to-br from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-1"
										>
											{service.donorCount > 0
												? 'Paid'
												: service.isActive
													? 'Available'
													: 'Unavailable'}
										</div>
										<div class="text-xs font-medium text-gray-500 uppercase tracking-wider">
											Status
										</div>
									</div>
									<div
										class="bg-white/50 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20 shadow-sm"
									>
										<div
											class="text-2xl font-bold bg-gradient-to-br from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-1"
										>
											STRK
										</div>
										<div class="text-xs font-medium text-gray-500 uppercase tracking-wider">
											Currency
										</div>
									</div>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>

			<!-- Main Content Grid -->
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<!-- Left Column -->
				<div class="space-y-6">
					{#if service.type === 'Donation'}
						<!-- DONACIÓN: Barra de progreso -->
						<div
							class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-lg shadow-purple-500/5"
						>
							<div class="flex items-center gap-2 mb-6">
								<div
									class="w-1 h-6 bg-gradient-to-b from-purple-600 to-indigo-600 rounded-full"
								></div>
								<h2 class="text-lg font-bold text-gray-900">Campaign Progress</h2>
							</div>

							<div class="space-y-4">
								<div class="flex justify-between items-center">
									<span class="text-sm font-medium text-gray-600">Total Donated</span>
									<span
										class="text-sm font-bold bg-gradient-to-br from-purple-600 to-indigo-600 bg-clip-text text-transparent"
									>
										{service.balance.toFixed(4)} / {service.goal.toFixed(4)} STRK
									</span>
								</div>

								<div class="space-y-2">
									<div class="h-2 overflow-hidden rounded-full bg-purple-100">
										<div
											class="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-500"
											style="width: {Math.min((service.balance / service.goal) * 100, 100)}%"
										></div>
									</div>
									<div class="flex justify-between items-center">
										<span class="text-xs text-gray-500">0%</span>
										<span
											class="text-sm font-bold bg-gradient-to-br from-purple-600 to-indigo-600 bg-clip-text text-transparent"
										>
											{Math.round((service.balance / service.goal) * 100)}%
										</span>
										<span class="text-xs text-gray-500">100%</span>
									</div>
								</div>
							</div>
						</div>
					{:else if service.type === 'Product'}
						<!-- PRODUCTO: Información del producto -->
						<div
							class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-lg shadow-purple-500/5"
						>
							<div class="flex items-center gap-2 mb-6">
								<div class="w-1 h-6 bg-gradient-to-b from-blue-600 to-cyan-600 rounded-full"></div>
								<h2 class="text-lg font-bold text-gray-900">Product Information</h2>
							</div>

							<div class="space-y-4">
								<div class="bg-blue-50/50 rounded-2xl p-4 border border-blue-100">
									<div class="flex items-center gap-2 mb-2">
										<Box size={18} class="text-blue-600" />
										<div class="font-semibold text-gray-900 text-sm">Product Type</div>
									</div>
									<div class="text-sm font-medium text-blue-700">Digital/Physical Product</div>
								</div>

								<div class="bg-green-50/50 rounded-2xl p-4 border border-green-100">
									<div class="flex items-center gap-2 mb-2">
										<DollarSign size={18} class="text-green-600" />
										<div class="font-semibold text-gray-900 text-sm">Pricing</div>
									</div>
									<div class="text-sm font-medium text-green-700">
										Fixed price: {service.price.toFixed(4)} STRK per unit
									</div>
								</div>

								<div class="bg-purple-50/50 rounded-2xl p-4 border border-purple-100">
									<div class="flex items-center gap-2 mb-2">
										<Award size={18} class="text-purple-600" />
										<div class="font-semibold text-gray-900 text-sm">Social Proof</div>
									</div>
									<div class="text-sm font-medium text-purple-700">
										{service.donorCount}
										{service.donorCount === 1 ? 'person has' : 'people have'} purchased this product
									</div>
								</div>
							</div>
						</div>
					{:else}
						<!-- SERVICE: Información del servicio -->
						<div
							class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-lg shadow-purple-500/5"
						>
							<div class="flex items-center gap-2 mb-6">
								<div class="w-1 h-6 bg-gradient-to-b from-blue-600 to-cyan-600 rounded-full"></div>
								<h2 class="text-lg font-bold text-gray-900">Service Information</h2>
							</div>

							<div class="space-y-4">
								<div class="bg-blue-50/50 rounded-2xl p-4 border border-blue-100">
									<div class="flex items-center gap-2 mb-2">
										<FileText size={18} class="text-blue-600" />
										<div class="font-semibold text-gray-900 text-sm">Service Type</div>
									</div>
									<div class="text-sm font-medium text-blue-700">Professional Business Service</div>
								</div>

								<div class="bg-green-50/50 rounded-2xl p-4 border border-green-100">
									<div class="flex items-center gap-2 mb-2">
										<DollarSign size={18} class="text-green-600" />
										<div class="font-semibold text-gray-900 text-sm">Payment Details</div>
									</div>
									<div class="text-sm font-medium text-green-700">
										Single payment of {service.price.toFixed(4)} STRK
									</div>
								</div>

								<div class="bg-purple-50/50 rounded-2xl p-4 border border-purple-100">
									<div class="flex items-center gap-2 mb-2">
										<CheckCircle size={18} class="text-purple-600" />
										<div class="font-semibold text-gray-900 text-sm">Availability</div>
									</div>
									<div class="text-sm font-medium text-purple-700">
										{#if service.donorCount > 0}
											Service has been purchased
										{:else if service.isActive}
											Currently available for purchase
										{:else}
											Temporarily unavailable
										{/if}
									</div>
								</div>
							</div>
						</div>
					{/if}

					<!-- Details -->
					<div
						class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-lg shadow-purple-500/5"
					>
						<div class="flex items-center gap-2 mb-6">
							<div
								class="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"
							></div>
							<h2 class="text-lg font-bold text-gray-900">
								{#if service.type === 'Donation'}
									Campaign Details
								{:else if service.type === 'Product'}
									Product Details
								{:else}
									Provider Details
								{/if}
							</h2>
						</div>

						<div class="space-y-4">
							<div class="grid grid-cols-2 gap-4">
								<div class="bg-purple-50/50 rounded-2xl p-4 border border-purple-100">
									<div class="flex items-center gap-2 mb-2">
										<Calendar size={18} class="text-purple-600" />
										<div class="font-semibold text-gray-900 text-sm">Created</div>
									</div>
									<div class="text-sm font-medium text-purple-700">
										{service.createdAt.toLocaleDateString('en-US', {
											year: 'numeric',
											month: 'short',
											day: 'numeric'
										})}
									</div>
								</div>

								<div class="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100">
									<div class="flex items-center gap-2 mb-2">
										<Calendar size={18} class="text-indigo-600" />
										<div class="font-semibold text-gray-900 text-sm">Updated</div>
									</div>
									<div class="text-sm font-medium text-indigo-700">
										{service.updatedAt.toLocaleDateString('en-US', {
											year: 'numeric',
											month: 'short',
											day: 'numeric'
										})}
									</div>
								</div>
							</div>

							<div class="bg-cyan-50/50 rounded-2xl p-4 border border-cyan-100">
								<div class="flex items-center gap-2 mb-2">
									<User size={18} class="text-cyan-600" />
									<div class="font-semibold text-gray-900 text-sm">
										{#if service.type === 'Service'}
											Service Provider
										{:else if service.type === 'Product'}
											Seller
										{:else}
											Creator
										{/if}
									</div>
								</div>
								<div class="font-medium text-cyan-700 font-mono text-xs break-all">
									{service.createdBy}
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Right Column - Actions -->
				<div class="space-y-6">
					<!-- Purchase/Donate Section -->
					{#if service}
						{#if service.type === 'Service' || service.type === 'Product'}
							<!-- Para Service y Product: Verificar si ya fue pagado -->
							{#if service.donorCount > 0}
								<!-- YA FUE PAGADO -->
								<div
									class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-lg shadow-purple-500/5"
								>
									<div class="flex items-center gap-2 mb-4">
										<div
											class="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"
										></div>
										<h2 class="text-lg font-bold text-gray-900">
											{service.type === 'Product' ? 'Product Purchased' : 'Service Paid'}
										</h2>
									</div>

									<div class="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
										<div class="flex items-center gap-2 mb-2">
											<CheckCircle size={20} class="text-green-600" />
											<span class="text-green-800 font-semibold">
												{service.type === 'Product' ? 'Already Purchased' : 'Payment Completed'}
											</span>
										</div>
										<p class="text-green-700 text-sm">
											{#if service.type === 'Product'}
												This product has been purchased by {service.donorCount}
												{service.donorCount === 1 ? 'person' : 'people'}.
											{:else}
												This service has been paid for. Contact the provider for service details.
											{/if}
										</p>
									</div>

									<div class="bg-purple-50/50 border border-purple-100 rounded-xl p-4">
										<div class="flex items-center gap-2 mb-2">
											<DollarSign size={18} class="text-purple-600" />
											<span class="text-purple-900 font-semibold">Amount Paid</span>
										</div>
										<div class="text-purple-700 text-sm">
											{service.balance.toFixed(4)} STRK
										</div>
									</div>
								</div>
							{:else if service.isActive}
								<!-- DISPONIBLE PARA COMPRA -->
								{#if service.type === 'Product'}
									<!-- PRODUCTO: Precio fijo -->
									<div
										class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-lg shadow-purple-500/5"
									>
										<div class="flex items-center gap-2 mb-6">
											<div
												class="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"
											></div>
											<h2 class="text-lg font-bold text-gray-900">Purchase Product</h2>
										</div>

										{#if paymentSuccess}
											<div class="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
												<div class="flex items-center gap-2 mb-2">
													<CheckCircle size={20} class="text-green-600" />
													<span class="text-green-800 font-semibold">Purchase Successful!</span>
												</div>
												<p class="text-green-700 text-sm">
													Your purchase of {service.price.toFixed(4)} STRK has been completed!
												</p>
											</div>
										{:else}
											<div class="space-y-4">
												{#if paymentError}
													<div class="bg-red-50 border border-red-200 rounded-xl p-4">
														<div class="flex items-center gap-2">
															<X size={18} class="text-red-600" />
															<span class="text-red-700 text-sm font-medium">{paymentError}</span>
														</div>
													</div>
												{/if}

												<div class="bg-purple-50/50 border border-purple-100 rounded-xl p-4">
													<div class="flex items-center gap-2 mb-2">
														<ShoppingCart size={18} class="text-purple-600" />
														<span class="text-purple-900 font-bold">
															Product Price: {service.price.toFixed(4)} STRK
														</span>
													</div>
													<p class="text-purple-700 text-sm">
														Purchase this product securely. All transactions are processed on the
														StarkNet blockchain.
													</p>
												</div>

												<button
													onclick={handlePayment}
													disabled={paymentLoading}
													class="w-full cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
												>
													{#if paymentLoading}
														<div
															class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
														></div>
														<span>Processing...</span>
													{:else}
														<ShoppingCart size={18} />
														<span>Buy for {service.price.toFixed(4)} STRK</span>
													{/if}
												</button>
											</div>
										{/if}
									</div>
								{:else}
									<!-- SERVICE: Precio fijo -->
									<div
										class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-lg shadow-purple-500/5"
									>
										<div class="flex items-center gap-2 mb-6">
											<div
												class="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"
											></div>
											<h2 class="text-lg font-bold text-gray-900">Purchase Service</h2>
										</div>

										{#if paymentSuccess}
											<div class="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
												<div class="flex items-center gap-2 mb-2">
													<CheckCircle size={20} class="text-green-600" />
													<span class="text-green-800 font-semibold">Payment Successful!</span>
												</div>
												<p class="text-green-700 text-sm">
													Your payment of {service.price.toFixed(4)} STRK has been processed!
												</p>
											</div>
										{:else}
											<div class="space-y-4">
												{#if paymentError}
													<div class="bg-red-50 border border-red-200 rounded-xl p-4">
														<div class="flex items-center gap-2">
															<X size={18} class="text-red-600" />
															<span class="text-red-700 text-sm font-medium">{paymentError}</span>
														</div>
													</div>
												{/if}

												<div class="bg-purple-50/50 border border-purple-100 rounded-xl p-4">
													<div class="flex items-center gap-2 mb-2">
														<DollarSign size={18} class="text-purple-600" />
														<span class="text-purple-900 font-bold">
															Service Price: {service.price.toFixed(4)} STRK
														</span>
													</div>
													<p class="text-purple-700 text-sm">
														Purchase this professional service. Payment goes directly to the service
														provider.
													</p>
												</div>

												<button
													onclick={handlePayment}
													disabled={paymentLoading}
													class="w-full cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
												>
													{#if paymentLoading}
														<div
															class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
														></div>
														<span>Processing...</span>
													{:else}
														<Building2 size={18} />
														<span>Pay {service.price.toFixed(4)} STRK</span>
													{/if}
												</button>
											</div>
										{/if}
									</div>
								{/if}
							{:else}
								<!-- NO ACTIVO Y NO PAGADO -->
								<div
									class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-lg shadow-purple-500/5"
								>
									<div class="flex items-center gap-2 mb-4">
										<div
											class="w-1 h-6 bg-gradient-to-b from-gray-500 to-gray-600 rounded-full"
										></div>
										<h2 class="text-lg font-bold text-gray-900">
											{service.type === 'Product' ? 'Out of Stock' : 'Service Unavailable'}
										</h2>
									</div>

									<div class="bg-gray-50 border border-gray-200 rounded-xl p-4">
										<div class="flex items-center gap-2 mb-2">
											<X size={20} class="text-gray-600" />
											<span class="text-gray-800 font-semibold">Currently Unavailable</span>
										</div>
										<p class="text-gray-600 text-sm">
											{#if service.type === 'Product'}
												This product is currently out of stock. Please check back later or contact
												the seller.
											{:else}
												This service is temporarily unavailable. Please contact the provider for
												more information.
											{/if}
										</p>
									</div>
								</div>
							{/if}
						{:else}
							<!-- DONATION: Lógica original -->
							{#if service.isActive}
								<div
									class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-lg shadow-purple-500/5"
								>
									<div class="flex items-center gap-2 mb-6">
										<div
											class="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"
										></div>
										<h2 class="text-lg font-bold text-gray-900">Support this Cause</h2>
									</div>

									{#if paymentSuccess}
										<div class="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
											<div class="flex items-center gap-2 mb-2">
												<CheckCircle size={20} class="text-green-600" />
												<span class="text-green-800 font-semibold">Donation Successful!</span>
											</div>
											<p class="text-green-700 text-sm">
												Thank you for your generous donation of {donationAmount.toFixed(4)} STRK!
											</p>
										</div>
									{:else}
										<div class="space-y-4">
											{#if paymentError}
												<div class="bg-red-50 border border-red-200 rounded-xl p-4">
													<div class="flex items-center gap-2">
														<X size={18} class="text-red-600" />
														<span class="text-red-700 text-sm font-medium">{paymentError}</span>
													</div>
												</div>
											{/if}

											<div>
												<label class="block text-sm font-semibold text-gray-700 mb-2">
													Donation Amount (STRK)
												</label>
												<input
													type="number"
													bind:value={donationAmount}
													placeholder={service.price.toFixed(4)}
													min="0"
													step="0.0001"
													disabled={paymentLoading}
													class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/50 backdrop-blur-sm text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
												/>
												<div class="flex items-center justify-between mt-2">
													<span class="text-xs text-gray-500">
														Suggested: {service.price.toFixed(4)} STRK
													</span>
													<button
														onclick={() => (donationAmount = service.price)}
														disabled={paymentLoading}
														class="text-xs text-purple-600 hover:text-purple-700 font-semibold disabled:opacity-50"
													>
														Use suggested amount
													</button>
												</div>
											</div>

											<div class="grid grid-cols-4 gap-2">
												{#each [0.01, 0.05, 0.1, 0.5] as amount}
													<button
														onclick={() => (donationAmount = amount)}
														disabled={paymentLoading}
														class="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold transition-colors border border-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
													>
														{amount}
													</button>
												{/each}
											</div>

											<div class="bg-purple-50/50 border border-purple-100 rounded-xl p-4">
												<div class="flex items-start gap-2 mb-2">
													<Heart size={18} class="text-purple-600 flex-shrink-0 mt-0.5" />
													<div>
														<div class="font-semibold text-purple-900 text-sm mb-1">
															Every Contribution Counts
														</div>
														<p class="text-purple-700 text-xs">
															Donate any amount you wish. Every contribution helps make a difference
															on the StarkNet blockchain.
														</p>
													</div>
												</div>
											</div>

											<button
												onclick={handlePayment}
												disabled={paymentLoading || !donationAmount || donationAmount <= 0}
												class="w-full cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
											>
												{#if paymentLoading}
													<div
														class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
													></div>
													<span>Processing...</span>
												{:else}
													<Heart size={18} />
													<span>
														{#if donationAmount && donationAmount > 0}
															Donate {donationAmount.toFixed(4)} STRK
														{:else}
															Enter Amount to Donate
														{/if}
													</span>
												{/if}
											</button>
										</div>
									{/if}
								</div>
							{:else}
								<!-- DONACIÓN PAUSADA -->
								<div
									class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-lg shadow-purple-500/5"
								>
									<div class="flex items-center gap-2 mb-4">
										<div
											class="w-1 h-6 bg-gradient-to-b from-gray-500 to-gray-600 rounded-full"
										></div>
										<h2 class="text-lg font-bold text-gray-900">Campaign Paused</h2>
									</div>
									<p class="text-gray-600 text-sm">
										This donation campaign is currently paused and not accepting donations.
									</p>
								</div>
							{/if}
						{/if}
					{/if}

					<!-- Chat Section (only for supporters or payers) -->
					{#if supporters.some((s) => typeof s === 'string' && s.toLowerCase() === $address.toLowerCase()) || hasPaid}
						<div
							class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-lg shadow-purple-500/5"
						>
							<div class="flex items-center gap-2 mb-6">
								<div class="w-1 h-6 bg-gradient-to-b from-green-500 to-blue-500 rounded-full"></div>
								<h2 class="text-lg font-bold text-gray-900">Contact Creator</h2>
							</div>

							<div class="space-y-4">
								<div class="bg-green-50/50 rounded-xl p-4 border border-green-100">
									<div class="flex items-start gap-3 mb-3">
										<div class="p-2 bg-green-100 rounded-lg">
											<MessageCircle size={18} class="text-green-600" />
										</div>
										<div>
											<div class="font-semibold text-gray-900 text-sm">Chat with the creator</div>
											<div class="text-xs text-gray-600 mt-1">
												As a supporter or payer, you can contact the service creator directly
											</div>
										</div>
									</div>

									<button
										onclick={toggleChat}
										class="w-full cursor-pointer bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md"
									>
										<MessageCircle size={16} />
										<span>{showChat ? 'Close Chat' : 'Open Chat'}</span>
									</button>
								</div>

								{#if showChat}
									<div
										class="bg-gray-50/50 rounded-xl p-4 border border-gray-100 max-h-96 overflow-y-auto"
									>
										<div class="space-y-3 mb-4">
											{#each chatMessages as message}
												<div
													class="flex {message.sender_address === $address
														? 'justify-end'
														: 'justify-start'}"
												>
													<div
														class="max-w-xs px-3 py-2 rounded-lg {message.sender_address ===
														$address
															? 'bg-blue-500 text-white'
															: 'bg-white text-gray-900'}"
													>
														<p class="text-sm">{message.message}</p>
														<p class="text-xs opacity-70 mt-1">
															{new Date(message.createdAt).toLocaleTimeString()}
														</p>
													</div>
												</div>
											{/each}
										</div>

										<div class="flex gap-2">
											<input
												type="text"
												bind:value={newMessage}
												placeholder="Type your message..."
												class="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
												onkeydown={(e) => {
													if (e.key === 'Enter' && !chatLoading) {
														sendMessage();
													}
												}}
											/>
											<button
												onclick={sendMessage}
												disabled={chatLoading || !newMessage.trim()}
												class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
											>
												{#if chatLoading}
													<div
														class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
													></div>
												{:else}
													Send
												{/if}
											</button>
										</div>
									</div>
								{/if}
							</div>
						</div>
					{/if}

					<!-- Share Section -->
					<div
						class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-lg shadow-purple-500/5"
					>
						<div class="flex items-center gap-2 mb-6">
							<div class="w-1 h-6 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></div>
							<h2 class="text-lg font-bold text-gray-900">Share with others</h2>
						</div>

						<div class="space-y-3">
							<div class="bg-purple-50/50 rounded-xl p-4 border border-purple-100">
								<div class="flex items-start gap-3 mb-3">
									<div class="p-2 bg-purple-100 rounded-lg">
										<Link size={18} class="text-purple-600" />
									</div>
									<div>
										<div class="font-semibold text-gray-900 text-sm">
											{#if service.type === 'Donation'}
												Share this campaign
											{:else if service.type === 'Product'}
												Share this product
											{:else}
												Share this service
											{/if}
										</div>
										<div class="text-xs text-gray-600 mt-1">
											Let others discover this on StarkNet
										</div>
									</div>
								</div>

								<button
									onclick={async () => {
										try {
											await navigator.clipboard.writeText(window.location.href);
											showToast('Link copied to clipboard!', 'success');
										} catch (err) {
											showToast('Failed to copy link. Please try again.', 'error');
										}
									}}
									class="w-full cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md"
								>
									<Link size={16} />
									<span>Copy Share Link</span>
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
