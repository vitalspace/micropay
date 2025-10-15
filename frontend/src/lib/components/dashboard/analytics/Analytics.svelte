<script lang="ts">
	import { useApi } from '$lib/hooks/useApi';
	import { useContract } from '$lib/hooks/useContract';
	import { useWallet } from '$lib/hooks/useWallet';
	import { onMount } from 'svelte';
	import { Chart, registerables } from 'chart.js';
	import { Loader2, TrendingUp, Users, DollarSign, BarChart3 } from 'lucide-svelte';

	// Register Chart.js components
	Chart.register(...registerables);

	const { analyzeService } = useApi();
	const { getUserServices } = useContract();
	const { address } = useWallet();

	let analyticsData: any = $state(null);
	let services: any[] = $state([]);
	let loading = $state(true);
	let error: string | null = $state(null);
	let chartInstances: any[] = [];

	async function loadAnalytics() {
		try {
			loading = true;
			error = null;

			// Fetch user services from blockchain
			services = await getUserServices($address);

			if (services.length > 0) {
				// Format amounts for AI analysis
				const formattedServices = services.map(service => ({
					...service,
					amountFormatted: (parseFloat(service.amount) / 1e18).toFixed(2) + ' STRK',
					totalRaisedFormatted: (parseFloat(service.total_raised) / 1e18).toFixed(2) + ' STRK'
				}));

				// Analyze services with AI
				const response = await analyzeService({ services: formattedServices });
				analyticsData = response.data;
			} else {
				analyticsData = { analysis: 'No services found to analyze.' };
			}
		} catch (err) {
			console.error('Error loading analytics:', err);
			error = 'Failed to load analytics data.';
		} finally {
			loading = false;
		}
	}

	function createCharts() {
		// Destroy existing charts
		chartInstances.forEach(chart => chart.destroy());
		chartInstances = [];

		if (services.length === 0) return;

		// Service Types Distribution
		const typeCounts = services.reduce((acc, service) => {
			acc[service.service_type] = (acc[service.service_type] || 0) + 1;
			return acc;
		}, {});

		const typeChartCanvas = document.getElementById('typeChart') as HTMLCanvasElement;
		if (typeChartCanvas) {
			const typeChart = new Chart(typeChartCanvas, {
				type: 'doughnut',
				data: {
					labels: Object.keys(typeCounts),
					datasets: [{
						data: Object.values(typeCounts),
						backgroundColor: ['#f59e0b', '#fb923c', '#fdba74'],
						borderWidth: 0
					}]
				},
				options: {
					responsive: true,
					plugins: {
						legend: {
							position: 'bottom',
							labels: { color: '#374151' }
						}
					}
				}
			});
			chartInstances.push(typeChart);
		}

		// Funds Raised Chart
		const fundsChartCanvas = document.getElementById('fundsChart') as HTMLCanvasElement;
		if (fundsChartCanvas) {
			const fundsChart = new Chart(fundsChartCanvas, {
				type: 'bar',
				data: {
					labels: services.map(s => s.name.length > 20 ? s.name.substring(0, 20) + '...' : s.name),
					datasets: [{
						label: 'Funds Raised (STRK)',
						data: services.map(s => parseFloat(s.total_raised) / 1e18),
						backgroundColor: '#f59e0b',
						borderRadius: 8
					}]
				},
				options: {
					responsive: true,
					scales: {
						y: {
							beginAtZero: true,
							ticks: { color: '#374151' },
							grid: { color: '#f3f4f6' }
						},
						x: {
							ticks: { color: '#374151' },
							grid: { display: false }
						}
					},
					plugins: {
						legend: { display: false }
					}
				}
			});
			chartInstances.push(fundsChart);
		}

		// Supporters Chart
		const supportersChartCanvas = document.getElementById('supportersChart') as HTMLCanvasElement;
		if (supportersChartCanvas) {
			const supportersChart = new Chart(supportersChartCanvas, {
				type: 'line',
				data: {
					labels: services.map(s => s.name.length > 20 ? s.name.substring(0, 20) + '...' : s.name),
					datasets: [{
						label: 'Supporters',
						data: services.map(s => s.supporter_count),
						borderColor: '#f59e0b',
						backgroundColor: '#fef3c7',
						tension: 0.4,
						fill: true
					}]
				},
				options: {
					responsive: true,
					scales: {
						y: {
							beginAtZero: true,
							ticks: { color: '#374151' },
							grid: { color: '#f3f4f6' }
						},
						x: {
							ticks: { color: '#374151' },
							grid: { display: false }
						}
					},
					plugins: {
						legend: { display: false }
					}
				}
			});
			chartInstances.push(supportersChart);
		}
	}

	onMount(() => {
		loadAnalytics();
	});

	// Create charts when services are loaded
	$effect(() => {
		if (!loading && services.length > 0) {
			// Wait for DOM to be ready
			setTimeout(createCharts, 100);
		}
	});
</script>

<div class="mx-auto max-w-7xl">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
			<BarChart3 class="w-8 h-8 text-amber-500" />
			Analytics Dashboard
		</h1>
		<p class="text-gray-600">Comprehensive insights into your services and campaigns</p>
	</div>

	{#if loading}
		<!-- Loading State -->
		<div class="flex items-center justify-center py-20">
			<div class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-lg p-8">
				<div class="flex items-center gap-4">
					<Loader2 class="w-8 h-8 animate-spin text-amber-500" />
					<div>
						<h3 class="text-lg font-semibold text-gray-900">Analyzing Your Data</h3>
						<p class="text-gray-600">Generating insights with AI...</p>
					</div>
				</div>
			</div>
		</div>
	{:else if error}
		<!-- Error State -->
		<div class="bg-red-50/80 backdrop-blur-sm border border-red-200/60 rounded-3xl p-8">
			<div class="flex items-center gap-3">
				<div class="w-2 h-2 bg-red-500 rounded-full"></div>
				<p class="text-red-800 font-medium">{error}</p>
			</div>
		</div>
	{:else}
		<!-- Stats Overview -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
			<div class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
				<div class="flex items-center gap-4">
					<div class="bg-gradient-to-br from-amber-100 to-orange-100 p-3 rounded-2xl">
						<DollarSign class="w-6 h-6 text-amber-600" />
					</div>
					<div>
						<p class="text-sm text-gray-600">Total Raised</p>
						<p class="text-2xl font-bold text-gray-900">
							{services.reduce((sum, s) => sum + parseFloat(s.total_raised) / 1e18, 0).toFixed(2)} STRK
						</p>
					</div>
				</div>
			</div>

			<div class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
				<div class="flex items-center gap-4">
					<div class="bg-gradient-to-br from-amber-100 to-orange-100 p-3 rounded-2xl">
						<Users class="w-6 h-6 text-amber-600" />
					</div>
					<div>
						<p class="text-sm text-gray-600">Total Supporters</p>
						<p class="text-2xl font-bold text-gray-900">
							{services.reduce((sum, s) => sum + s.supporter_count, 0)}
						</p>
					</div>
				</div>
			</div>

			<div class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
				<div class="flex items-center gap-4">
					<div class="bg-gradient-to-br from-amber-100 to-orange-100 p-3 rounded-2xl">
						<TrendingUp class="w-6 h-6 text-amber-600" />
					</div>
					<div>
						<p class="text-sm text-gray-600">Active Services</p>
						<p class="text-2xl font-bold text-gray-900">
							{services.filter(s => s.is_active).length} / {services.length}
						</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Charts Section -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
			<!-- Service Types Distribution -->
			<div class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
				<h3 class="text-xl font-bold text-gray-900 mb-4">Service Types Distribution</h3>
				<div class="h-64">
					<canvas id="typeChart"></canvas>
				</div>
			</div>

			<!-- Funds Raised -->
			<div class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
				<h3 class="text-xl font-bold text-gray-900 mb-4">Funds Raised by Service</h3>
				<div class="h-64">
					<canvas id="fundsChart"></canvas>
				</div>
			</div>

			<!-- Supporters -->
			<div class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 p-6 lg:col-span-2">
				<h3 class="text-xl font-bold text-gray-900 mb-4">Supporters by Service</h3>
				<div class="h-64">
					<canvas id="supportersChart"></canvas>
				</div>
			</div>
		</div>

		<!-- AI Analysis -->
		<div class="">


			<div class="relative z-10">
				<div class="flex items-center gap-4 mb-8">
					<div class="bg-gradient-to-br from-amber-500 to-orange-500 p-3 rounded-2xl shadow-lg">
						<BarChart3 class="w-6 h-6 text-white" />
					</div>
					<div>
						<h3 class="text-2xl font-bold text-gray-900">AI-Powered Analysis</h3>
						<p class="text-gray-600 text-sm">Intelligent insights generated from your service data</p>
					</div>
				</div>

				{#if analyticsData?.analysis}
					<div class="space-y-6">
						{@html analyticsData.analysis}
					</div>
				{:else}
					<div class="text-center py-12">
						<div class="bg-amber-100/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
							<BarChart3 class="w-8 h-8 text-amber-600" />
						</div>
						<p class="text-gray-600 text-lg">No analysis available</p>
						<p class="text-gray-500 text-sm">Create some services to see AI-powered insights here</p>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
