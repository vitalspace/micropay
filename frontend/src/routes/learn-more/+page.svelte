<script lang="ts">
	import {
		ArrowRight,
		Brain,
		ChevronLeft,
		ChevronRight,
		Code,
		Database,
		Globe,
		Sparkles,
		Target,
		TrendingUp,
		Wallet
	} from 'lucide-svelte';

	let currentSlide = $state(0);
	const totalSlides = 6;
	let isTransitioning = $state(false);
	let isLoaded = $state(false);
	let prefersReducedMotion = $state(false);

	// Progressive enhancement: Check for reduced motion preference
	if (typeof window !== 'undefined') {
		prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		isLoaded = true;
	}

	const slides = [
		{ id: 'hero', title: 'Welcome to MicroPay' },
		{ id: 'overview', title: 'Project Overview' },
		{ id: 'technology', title: 'Technology Stack' },
		{ id: 'capabilities', title: 'Platform Capabilities' },
		{ id: 'usecases', title: 'Use Cases' },
		{ id: 'getstarted', title: 'Getting Started' }
	];

	function nextSlide() {
		if (currentSlide < totalSlides - 1 && !isTransitioning) {
			performSlideTransition(currentSlide + 1);
		}
	}

	function prevSlide() {
		if (currentSlide > 0 && !isTransitioning) {
			performSlideTransition(currentSlide - 1);
		}
	}

	function goToSlide(index: number) {
		if (index !== currentSlide && !isTransitioning) {
			performSlideTransition(index);
		}
	}

	function performSlideTransition(newSlide: number) {
		isTransitioning = true;
		currentSlide = newSlide;

		// Reset transition state after animation completes
		setTimeout(() => {
			isTransitioning = false;
		}, 600);
	}

	// Keyboard navigation
	function handleKeydown(event: KeyboardEvent) {
		switch (event.key) {
			case 'ArrowLeft':
				event.preventDefault();
				prevSlide();
				break;
			case 'ArrowRight':
				event.preventDefault();
				nextSlide();
				break;
			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
				event.preventDefault();
				goToSlide(parseInt(event.key) - 1);
				break;
		}
	}
</script>

<svelte:head>
	<title>About MicroPay - Learn More</title>
	<meta
		name="description"
		content="Learn about MicroPay, a revolutionary blockchain platform for micropayments on StarkNet with AI-powered campaign optimization. Discover our technology, capabilities, and how we're transforming digital transactions."
	/>
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<!-- Loading State -->
{#if !isLoaded}
	<div class="fixed inset-0 bg-slate-900 flex items-center justify-center z-50">
		<div class="text-center">
			<div
				class="w-16 h-16 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"
			></div>
			<p class="text-slate-300 text-lg">Loading MicroPay Experience...</p>
		</div>
	</div>
{/if}

<!-- Slide Container -->
<div
	class="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden"
>
	<!-- Enhanced Slide Navigation -->
	<div class="absolute top-6 sm:top-8 left-1/2 transform -translate-x-1/2 z-20">
		<div
			class="flex items-center space-x-3 sm:space-x-4 bg-slate-800/60 backdrop-blur-xl rounded-full px-4 sm:px-8 py-3 sm:py-4 shadow-2xl"
			style="box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1);"
		>
			{#each slides as slide, index}
				<button
					onclick={() => goToSlide(index)}
					class="relative w-4 h-4 rounded-full transition-all duration-500 group"
					class:ring-2={currentSlide === index}
					class:ring-cyan-400={currentSlide === index}
					class:ring-offset-2={currentSlide === index}
					class:ring-offset-slate-800={currentSlide === index}
					aria-label="Go to slide {slide.title}"
				>
					<div
						class="w-full h-full rounded-full transition-all duration-500 {currentSlide === index
							? 'bg-gradient-to-r from-cyan-400 to-cyan-300 shadow-lg shadow-cyan-400/50 scale-125'
							: 'bg-slate-600 hover:bg-slate-500 hover:scale-110'}"
						style={currentSlide === index
							? 'box-shadow: 0 0 20px rgba(6, 182, 212, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.2);'
							: ''}
					></div>
					<!-- Active indicator ring -->
					{#if currentSlide === index}
						<div
							class="absolute inset-0 rounded-full border-2 border-cyan-400/50 animate-ping"
							style="animation-duration: 2s;"
						></div>
					{/if}
				</button>
			{/each}
		</div>
	</div>

	<!-- Enhanced Navigation Arrows -->
	<button
		onclick={prevSlide}
		class="cursor-pointer absolute left-2 top-1/2 transform -translate-y-1/2 z-30 w-12 h-12 sm:w-14 sm:h-14 bg-slate-800/70 hover:bg-slate-700/90 backdrop-blur-xl rounded-full border border-slate-600/50 flex items-center justify-center transition-all duration-300 group touch-manipulation {currentSlide ===
		0
			? 'opacity-50 cursor-not-allowed'
			: 'hover:scale-110 active:scale-95'} shadow-lg"
		style="box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);"
		disabled={currentSlide === 0}
	>
		<ChevronLeft class="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400 transition-colors duration-300" />
	</button>

	<button
		onclick={nextSlide}
		class="cursor-pointer absolute right-2 top-1/2 transform -translate-y-1/2 z-30 w-12 h-12 sm:w-14 sm:h-14 bg-slate-800/70 hover:bg-slate-700/90 backdrop-blur-xl rounded-full border border-slate-600/50 flex items-center justify-center transition-all duration-300 group touch-manipulation {currentSlide ===
		totalSlides - 1
			? 'opacity-50 cursor-not-allowed'
			: 'hover:scale-110 active:scale-95'} shadow-lg"
		style="box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);"
		disabled={currentSlide === totalSlides - 1}
	>
		<ChevronRight class="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400 transition-colors duration-300" />
	</button>

	<!-- Enhanced Keyboard Navigation Hint -->
	<div class="keyboard-hint {currentSlide > 0 ? 'show' : ''}">
		<div class="flex items-center space-x-4 text-sm">
			<span class="text-slate-300">Navigate with</span>
			<div
				class="flex items-center space-x-2 bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-600/50"
			>
				<kbd
					class="px-2 py-1 bg-slate-800 text-cyan-400 rounded text-xs font-mono border border-slate-600"
					>←</kbd
				>
				<kbd
					class="px-2 py-1 bg-slate-800 text-cyan-400 rounded text-xs font-mono border border-slate-600"
					>→</kbd
				>
			</div>
			<span class="text-slate-300">or</span>
			<div class="flex items-center space-x-1">
				<kbd
					class="px-2 py-1 bg-slate-800 text-cyan-400 rounded text-xs font-mono border border-slate-600"
					>1-6</kbd
				>
			</div>
			<span class="text-slate-300">keys</span>
		</div>
	</div>

	<!-- Slide Content -->
	<div class="relative z-10 h-screen flex items-center justify-center px-4 sm:px-8">
		{#each [currentSlide] as slideIndex}
			<div class="w-full {isTransitioning ? 'animate-floatIn' : ''}">
			{#if slideIndex === 0}
				<!-- Slide 1: Welcome -->
				<div class="text-center max-w-5xl mx-auto animate-fadeIn">
					<!-- Badge con mejor contraste -->
					<div
						class="inline-flex items-center bg-white/10 border border-white/20 rounded-full px-6 py-3 mb-12 backdrop-blur-md shadow-lg"
					>
						<Sparkles class="w-5 h-5 text-cyan-400 mr-2" />
						<span class="text-white text-base font-medium">Welcome to MicroPay</span>
					</div>

					<!-- Título con mejor contraste - gradiente más claro -->
					<h1 class="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tight">
						<span
							class="bg-gradient-to-br from-cyan-300 via-blue-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_80px_rgba(34,211,238,0.3)]"
						>
							MicroPay
						</span>
					</h1>

					<!-- Subtítulo BLANCO para ser legible -->
					<p
						class="text-white text-xl md:text-2xl lg:text-3xl mb-12 leading-relaxed font-medium max-w-4xl mx-auto px-4"
					>
						The <span class="text-cyan-300 font-semibold">AI-powered</span> blockchain platform revolutionizing
						micropayments
					</p>

					<!-- Botones con mejor contraste -->
					<div class="flex flex-col sm:flex-row gap-4 justify-center px-4">
						<!-- Botón primario más vibrante -->
						<button
							onclick={nextSlide}
							class="group relative px-8 py-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-600 text-white rounded-xl font-semibold overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-400/50 hover:scale-[1.02] active:scale-[0.98] min-h-[56px]"
						>
							<div
								class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
							></div>

							<span class="relative flex items-center justify-center gap-2">
								Start Presentation
								<ArrowRight
									class="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
								/>
							</span>
						</button>

						<!-- Botón secundario con mejor visibilidad -->
						<a
							href="/dashboard"
							class="relative px-8 py-4 bg-white/15 text-white rounded-xl font-semibold backdrop-blur-md border border-white/30 hover:bg-white/20 hover:border-white/40 active:scale-[0.98] transition-all duration-300 min-h-[56px] flex items-center justify-center group overflow-hidden"
						>
							<div
								class="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/0 via-cyan-400/10 to-cyan-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
							></div>

							<span class="relative">Try MicroPay</span>
						</a>
					</div>
				</div>
			{/if}

			{#if slideIndex === 1}
				<!-- Slide 2: Project Overview -->
				<div class="max-w-7xl mx-auto px-4 animate-fadeIn">
					<!-- Header más compacto -->
					<div class="text-center mb-8">
						<div class="inline-block mb-4">
							<span
								class="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/40 rounded-full px-5 py-2 text-cyan-300 text-sm font-medium backdrop-blur-md"
							>
								Slide {slideIndex + 1} of {totalSlides}
							</span>
						</div>
						<h2 class="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
							<span
								class="bg-gradient-to-br from-cyan-300 via-blue-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(34,211,238,0.3)]"
							>
								Project Overview
							</span>
						</h2>
						<p class="text-lg text-white max-w-2xl mx-auto">
							Discover the power of <span class="text-cyan-300 font-semibold">AI-enhanced</span> blockchain
							micropayments
						</p>
					</div>

					<!-- Grid más compacto con colores vibrantes -->
					<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
						<!-- Columna izquierda -->
						<div class="space-y-6">
							<!-- What is MicroPay con BORDE CYAN BRILLANTE -->
							<div
								class="relative group bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md p-6 border-2 border-cyan-400 rounded-xl hover:border-cyan-300 transition-all duration-300 shadow-lg shadow-cyan-500/20"
							>
								<div
									class="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
								></div>
								<h3 class="relative text-2xl font-semibold text-cyan-300 mb-4 flex items-center">
									<span class="w-2 h-2 bg-cyan-400 rounded-full mr-3 animate-pulse"></span>
									What is MicroPay?
								</h3>
								<p class="relative text-white text-base leading-relaxed mb-4">
									<strong class="text-cyan-200">MicroPay</strong> is a comprehensive
									blockchain-based platform designed specifically for micropayments and
									microtransactions. Built on the
									<span class="text-cyan-300 font-semibold">StarkNet Layer 2</span> scaling solution,
									our platform enables users to create, manage, and participate in payment campaigns
									with unprecedented ease and efficiency.
								</p>
								<p class="relative text-white text-base leading-relaxed">
									Unlike traditional payment systems that struggle with small transactions due to
									high fees and slow processing times, MicroPay leverages StarkNet's <span
										class="text-cyan-300 font-semibold">zero-knowledge rollup technology</span
									> to provide instant, low-cost micropayments that are both secure and scalable.
								</p>
							</div>

							<!-- AI-Powered Intelligence con BORDE PURPLE BRILLANTE -->
							<div
								class="relative group bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md p-6 border-2 border-purple-400 rounded-xl hover:border-purple-300 transition-all duration-300 shadow-lg shadow-purple-500/20"
							>
								<div
									class="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
								></div>
								<div class="relative flex items-center mb-4">
									<div class="p-2 bg-purple-500/20 rounded-lg mr-3">
										<Brain class="w-6 h-6 text-purple-300" />
									</div>
									<h3 class="text-2xl font-semibold text-purple-300">AI-Powered Intelligence</h3>
								</div>
								<p class="relative text-white text-base leading-relaxed mb-4">
									Our advanced AI system analyzes campaign performance in <span
										class="text-purple-300 font-semibold">real-time</span
									>, automatically optimizing titles, descriptions, and pricing strategies to
									maximize engagement and conversion rates.
								</p>
								<div class="">
									<p class="text-white text-sm">
										<strong class="text-purple-200">AI Features:</strong> Smart title optimization, description
										enhancement, pricing suggestions, and performance analytics
									</p>
								</div>
							</div>
						</div>

						<!-- Columna derecha - Statistics con BORDE CYAN BRILLANTE -->
						<div
							class="relative group bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md p-6 border-2 border-cyan-400 rounded-xl hover:border-cyan-300 transition-all duration-300 shadow-lg shadow-cyan-500/20"
						>
							<div
								class="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
							></div>

							<h3
								class="relative text-2xl font-semibold text-cyan-300 mb-6 text-center flex items-center justify-center"
							>
								<span class="w-2 h-2 bg-cyan-400 rounded-full mr-3 animate-pulse"></span>
								Platform Statistics
							</h3>

							<div class="relative grid grid-cols-2 gap-6">
								<!-- Stat cards con BORDES BRILLANTES -->
								<div
									class="bg-gradient-to-br from-cyan-500/15 to-cyan-600/15 rounded-lg p-4 text-center hover:scale-105 transition-transform duration-300"
								>
									<div class="text-4xl font-bold text-cyan-300 mb-2">99.9%</div>
									<div class="text-white font-medium">Uptime</div>
								</div>
								<div
									class="bg-gradient-to-br from-blue-500/15 to-blue-600/15 rounded-lg p-4 text-center hover:scale-105 transition-transform duration-300"
								>
									<div class="text-4xl font-bold text-blue-300 mb-2">{'< $0.01'}</div>
									<div class="text-white font-medium">Avg Fee</div>
								</div>
								<div
									class="bg-gradient-to-br from-purple-500/15 to-purple-600/15 rounded-lg p-4 text-center hover:scale-105 transition-transform duration-300"
								>
									<div class="text-4xl font-bold text-purple-300 mb-2">{'< 2s'}</div>
									<div class="text-white font-medium">Confirmation</div>
								</div>
								<div
									class="bg-gradient-to-br from-pink-500/15 to-pink-600/15 rounded-lg p-4 text-center hover:scale-105 transition-transform duration-300"
								>
									<div class="text-4xl font-bold text-pink-300 mb-2">100%</div>
									<div class="text-white font-medium">Transparent</div>
								</div>
							</div>

							<div class="relative mt-6 pt-6 border-t-2 border-cyan-300 text-center">
								<div
									class="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2 animate-pulse"
								>
									AI-Powered
								</div>
								<div class="text-white font-medium">Campaign Optimization</div>
							</div>
						</div>
					</div>
				</div>
			{/if}

			{#if slideIndex === 2}
				<!-- Slide 3: Technology Stack -->
				<div class="max-w-6xl mx-auto animate-fadeIn">
					<div class="text-center mb-16">
						<div class="inline-block mb-6">
							<span
								class="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 rounded-full px-6 py-2 text-cyan-300 text-sm font-semibold"
							>
								Slide {slideIndex + 1} of {totalSlides}
							</span>
						</div>
						<h2 class="text-5xl md:text-6xl font-bold mb-8">
							<span
								class="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
							>
								Technology Stack
							</span>
						</h2>
						<p class="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
							Built with cutting-edge technologies to ensure <span
								class="text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text font-semibold"
								>scalability</span
							>,
							<span
								class="text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text font-semibold"
								>security</span
							>, and
							<span
								class="text-transparent bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text font-semibold"
								>performance</span
							>
						</p>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
						<!-- StarkNet -->
						<div
							class="relative bg-slate-900/80 backdrop-blur-md p-6 border border-slate-700/50 rounded-2xl hover:border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-400/10 transition-all duration-300 hover:-translate-y-2 group"
							style="box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);"
						>
							<div
								class="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl mx-auto mb-4 shadow-lg shadow-cyan-400/30"
							>
								<Code class="w-8 h-8 text-white" />
							</div>
							<h3 class="text-cyan-400 text-xl font-semibold mb-3 text-center">StarkNet L2</h3>
							<p class="text-slate-300 text-center leading-relaxed text-sm">
								Zero-knowledge rollup technology providing unlimited scalability with minimal fees
							</p>
						</div>

						<!-- Cairo -->
						<div
							class="relative bg-slate-900/80 backdrop-blur-md p-6 border border-slate-700/50 rounded-2xl hover:border-purple-400/50 hover:shadow-xl hover:shadow-purple-400/10 transition-all duration-300 hover:-translate-y-2 group"
							style="box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);"
						>
							<div
								class="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl mx-auto mb-4 shadow-lg shadow-purple-400/30"
							>
								<Database class="w-8 h-8 text-white" />
							</div>
							<h3 class="text-purple-400 text-xl font-semibold mb-3 text-center">
								Cairo Smart Contracts
							</h3>
							<p class="text-slate-300 text-center leading-relaxed text-sm">
								Next-generation smart contract language optimized for zero-knowledge proofs
							</p>
						</div>

						<!-- SvelteKit -->
						<div
							class="relative bg-slate-900/80 backdrop-blur-md p-6 border border-slate-700/50 rounded-2xl hover:border-emerald-400/50 hover:shadow-xl hover:shadow-emerald-400/10 transition-all duration-300 hover:-translate-y-2 group"
							style="box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);"
						>
							<div
								class="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl mx-auto mb-4 shadow-lg shadow-emerald-400/30"
							>
								<Globe class="w-8 h-8 text-white" />
							</div>
							<h3 class="text-emerald-400 text-xl font-semibold mb-3 text-center">
								SvelteKit Frontend
							</h3>
							<p class="text-slate-300 text-center leading-relaxed text-sm">
								Modern, reactive web framework for optimal user experience and performance
							</p>
						</div>

						<!-- AI Engine -->
						<div
							class="relative bg-slate-900/80 backdrop-blur-md p-6 border border-slate-700/50 rounded-2xl hover:border-pink-400/50 hover:shadow-xl hover:shadow-pink-400/10 transition-all duration-300 hover:-translate-y-2 group"
							style="box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);"
						>
							<div
								class="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl mx-auto mb-4 shadow-lg shadow-pink-400/30"
							>
								<Brain class="w-8 h-8 text-white" />
							</div>
							<h3 class="text-pink-400 text-xl font-semibold mb-3 text-center">AI Engine</h3>
							<p class="text-slate-300 text-center leading-relaxed text-sm">
								Advanced AI for campaign optimization, title enhancement, and pricing strategies
							</p>
						</div>
					</div>
				</div>
			{/if}

			{#if slideIndex === 3}
				<!-- Slide 4: Platform Capabilities -->
				<div class="max-w-6xl mx-auto animate-fadeIn">
					<div class="text-center mb-16">
						<div class="inline-block mb-6">
							<span
								class="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 rounded-full px-6 py-2 text-cyan-300 text-sm font-semibold"
							>
								Slide {slideIndex + 1} of {totalSlides}
							</span>
						</div>
						<h2 class="text-5xl md:text-6xl font-bold mb-8">
							<span
								class="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
							>
								Platform Capabilities
							</span>
						</h2>
						<p class="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
							Comprehensive features enhanced with <span
								class="text-transparent bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text font-semibold"
								>AI-powered</span
							> optimization
						</p>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
						<!-- Campaign Management -->
						<div
							class="relative bg-slate-900/80 backdrop-blur-md p-6 border border-slate-700/50 rounded-2xl hover:border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-400/10 transition-all duration-300 hover:-translate-y-2 group"
							style="box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);"
						>
							<div
								class="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl mx-auto mb-4 shadow-lg shadow-cyan-400/30"
							>
								<Target class="w-8 h-8 text-white" />
							</div>
							<h3 class="text-cyan-400 text-xl font-semibold mb-3 text-center">
								Campaign Management
							</h3>
							<p class="text-slate-300 text-center leading-relaxed mb-4 text-sm">
								Create and manage multiple types of campaigns including donations, services, and
								product sales with our intuitive dashboard.
							</p>
							<div class="flex flex-wrap justify-center gap-2">
								<span
									class="bg-slate-800/50 text-cyan-400 px-3 py-1 rounded-full text-xs border border-slate-600/50"
								>
									Donations
								</span>
								<span
									class="bg-slate-800/50 text-cyan-400 px-3 py-1 rounded-full text-xs border border-slate-600/50"
								>
									Services
								</span>
								<span
									class="bg-slate-800/50 text-cyan-400 px-3 py-1 rounded-full text-xs border border-slate-600/50"
								>
									Products
								</span>
							</div>
						</div>

						<!-- AI Optimization -->
						<div
							class="relative bg-slate-900/80 backdrop-blur-md p-6 border border-slate-700/50 rounded-2xl hover:border-pink-400/50 hover:shadow-xl hover:shadow-pink-400/10 transition-all duration-300 hover:-translate-y-2 group"
							style="box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);"
						>
							<div
								class="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl mx-auto mb-4 shadow-lg shadow-pink-400/30"
							>
								<Brain class="w-8 h-8 text-white" />
							</div>
							<h3 class="text-pink-400 text-xl font-semibold mb-3 text-center">
								AI Campaign Optimization
							</h3>
							<p class="text-slate-300 text-center leading-relaxed mb-4 text-sm">
								Advanced AI analyzes performance and automatically optimizes titles, descriptions,
								and pricing for maximum engagement.
							</p>
							<div class="flex flex-wrap justify-center gap-2">
								<span
									class="bg-slate-800/50 text-pink-400 px-3 py-1 rounded-full text-xs border border-slate-600/50"
								>
									Smart Titles
								</span>
								<span
									class="bg-slate-800/50 text-pink-400 px-3 py-1 rounded-full text-xs border border-slate-600/50"
								>
									Auto-Pricing
								</span>
							</div>
						</div>

						<!-- Real-time Analytics -->
						<div
							class="relative bg-slate-900/80 backdrop-blur-md p-6 border border-slate-700/50 rounded-2xl hover:border-purple-400/50 hover:shadow-xl hover:shadow-purple-400/10 transition-all duration-300 hover:-translate-y-2 group"
							style="box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);"
						>
							<div
								class="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl mx-auto mb-4 shadow-lg shadow-purple-400/30"
							>
								<TrendingUp class="w-8 h-8 text-white" />
							</div>
							<h3 class="text-purple-400 text-xl font-semibold mb-3 text-center">
								Real-time Analytics
							</h3>
							<p class="text-slate-300 text-center leading-relaxed mb-4 text-sm">
								Monitor your campaign performance with comprehensive analytics including participant
								insights and revenue tracking.
							</p>
							<div class="flex flex-wrap justify-center gap-2">
								<span
									class="bg-slate-800/50 text-purple-400 px-3 py-1 rounded-full text-xs border border-slate-600/50"
								>
									Live Monitoring
								</span>
								<span
									class="bg-slate-800/50 text-purple-400 px-3 py-1 rounded-full text-xs border border-slate-600/50"
								>
									AI Insights
								</span>
							</div>
						</div>

						<!-- Wallet Integration -->
						<div
							class="relative bg-slate-900/80 backdrop-blur-md p-6 border border-slate-700/50 rounded-2xl hover:border-emerald-400/50 hover:shadow-xl hover:shadow-emerald-400/10 transition-all duration-300 hover:-translate-y-2 group"
							style="box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);"
						>
							<div
								class="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl mx-auto mb-4 shadow-lg shadow-emerald-400/30"
							>
								<Wallet class="w-8 h-8 text-white" />
							</div>
							<h3 class="text-emerald-400 text-xl font-semibold mb-3 text-center">
								Wallet Integration
							</h3>
							<p class="text-slate-300 text-center leading-relaxed mb-4 text-sm">
								Seamless integration with StarkNet wallets providing secure transaction signing and
								account management.
							</p>
							<div class="flex flex-wrap justify-center gap-2">
								<span
									class="bg-slate-800/50 text-emerald-400 px-3 py-1 rounded-full text-xs border border-slate-600/50"
								>
									Multi-Wallet
								</span>
								<span
									class="bg-slate-800/50 text-emerald-400 px-3 py-1 rounded-full text-xs border border-slate-600/50"
								>
									Secure
								</span>
							</div>
						</div>
					</div>
				</div>
			{/if}

			{#if slideIndex === 4}
				<!-- Slide 5: Use Cases -->
				<div class="max-w-7xl mx-auto animate-fadeIn">
					<div class="text-center mb-16">
						<div class="inline-block mb-6">
							<span
								class="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 rounded-full px-6 py-2 text-cyan-300 text-sm font-semibold"
							>
								Slide {slideIndex + 1} of {totalSlides}
							</span>
						</div>
						<h2 class="text-5xl md:text-6xl font-bold mb-8">
							<span
								class="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
							>
								Use Cases
							</span>
						</h2>
						<p class="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
							Discover how <span
								class="text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text font-semibold"
								>MicroPay</span
							> transforms everyday transactions across different industries
						</p>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 place-items-center">
						<!-- Charity & Fundraising Card -->
						<div
							class="relative bg-slate-900/80 backdrop-blur-md p-8 border border-cyan-500/20 rounded-2xl hover:border-cyan-400/40 hover:shadow-2xl hover:shadow-cyan-400/10 transition-all duration-500 hover:-translate-y-3 w-full max-w-sm group"
						>
							<div
								class="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl mx-auto mb-6 shadow-lg shadow-cyan-400/30 group-hover:scale-110 transition-transform duration-300"
							>
								<svg
									class="w-10 h-10 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M15.536 8.464a5 5 0 010 7.072m2.828-2.828a9 9 0 010-12.728M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
									></path>
								</svg>
							</div>
							<h3 class="text-cyan-400 text-2xl font-semibold mb-4 text-center">
								Charity & Fundraising
							</h3>
							<p class="text-slate-300 text-center leading-relaxed mb-6">
								Launch donation campaigns for causes you care about with transparent tracking and
								instant blockchain settlements. AI optimization ensures maximum donor engagement.
							</p>
							<div class="flex flex-wrap justify-center gap-2">
								<span
									class="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 px-3 py-1 rounded-full text-sm font-medium border border-cyan-500/30 backdrop-blur-sm"
									>Transparent</span
								>
								<span
									class="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 px-3 py-1 rounded-full text-sm font-medium border border-cyan-500/30 backdrop-blur-sm"
									>AI-Optimized</span
								>
							</div>
						</div>

						<!-- Freelancers & Services Card -->
						<div
							class="relative bg-slate-900/80 backdrop-blur-md p-8 border border-purple-500/20 rounded-2xl hover:border-purple-400/40 hover:shadow-2xl hover:shadow-purple-400/10 transition-all duration-500 hover:-translate-y-3 w-full max-w-sm group"
						>
							<div
								class="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mx-auto mb-6 shadow-lg shadow-purple-400/30 group-hover:scale-110 transition-transform duration-300"
							>
								<svg
									class="w-10 h-10 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V8a2 2 0 01-2 2H8a2 2 0 01-2-2V6m8 0H8"
									></path>
								</svg>
							</div>
							<h3 class="text-purple-400 text-2xl font-semibold mb-4 text-center">
								Freelancers & Services
							</h3>
							<p class="text-slate-300 text-center leading-relaxed mb-6">
								Offer professional services and accept payments securely through blockchain-based
								campaigns with transparent pricing. AI suggests optimal pricing strategies.
							</p>
							<div class="flex flex-wrap justify-center gap-2">
								<span
									class="bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-400 px-3 py-1 rounded-full text-sm font-medium border border-purple-500/30 backdrop-blur-sm"
									>Smart Pricing</span
								>
								<span
									class="bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-400 px-3 py-1 rounded-full text-sm font-medium border border-purple-500/30 backdrop-blur-sm"
									>Instant Pay</span
								>
							</div>
						</div>

						<!-- E-commerce & Products Card -->
						<div
							class="relative bg-slate-900/80 backdrop-blur-md p-8 border border-emerald-500/20 rounded-2xl hover:border-emerald-400/40 hover:shadow-2xl hover:shadow-emerald-400/10 transition-all duration-500 hover:-translate-y-3 w-full max-w-sm group"
						>
							<div
								class="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl mx-auto mb-6 shadow-lg shadow-emerald-400/30 group-hover:scale-110 transition-transform duration-300"
							>
								<svg
									class="w-10 h-10 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
									></path>
								</svg>
							</div>
							<h3 class="text-emerald-400 text-2xl font-semibold mb-4 text-center">
								E-commerce & Products
							</h3>
							<p class="text-slate-300 text-center leading-relaxed mb-6">
								Sell digital or physical products through secure campaigns with transparent pricing
								and instant blockchain payments. AI optimizes product listings for better
								conversion.
							</p>
							<div class="flex flex-wrap justify-center gap-2">
								<span
									class="bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-400 px-3 py-1 rounded-full text-sm font-medium border border-emerald-500/30 backdrop-blur-sm"
									>Global Sales</span
								>
								<span
									class="bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-400 px-3 py-1 rounded-full text-sm font-medium border border-emerald-500/30 backdrop-blur-sm"
									>AI Listings</span
								>
							</div>
						</div>
					</div>
				</div>
			{/if}

			{#if slideIndex === 5}
				<!-- Slide 6: Getting Started -->
				<div class="max-w-7xl mx-auto animate-fadeIn">
					<div class="text-center mb-16">
						<div class="inline-block mb-6">
							<span
								class="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 rounded-full px-6 py-2 text-cyan-300 text-sm font-semibold"
							>
								Slide {slideIndex + 1} of {totalSlides}
							</span>
						</div>
						<h2 class="text-5xl md:text-6xl font-bold mb-8">
							<span
								class="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
							>
								Getting Started
							</span>
						</h2>
						<p class="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
							Get started with <span
								class="text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text font-semibold"
								>AI-powered micropayments</span
							> in just three simple steps
						</p>
					</div>

					<!-- Steps -->
					<div class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 place-items-center">
						<!-- Step 1 -->
						<div class="text-center">
							<div
								class="px-8 py-3 bg-transparent border-2 border-cyan-400 text-cyan-400 text-2xl font-bold mb-8 shadow-lg shadow-cyan-400/20 backdrop-blur-sm rounded-2xl"
							>
								01
							</div>
							<div
								class="relative bg-slate-900/80 backdrop-blur-md p-8 border border-cyan-500/20 rounded-2xl hover:border-cyan-400/40 hover:shadow-2xl hover:shadow-cyan-400/10 transition-all duration-500 hover:-translate-y-3 w-full max-w-sm group"
							>
								<div
									class="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl mx-auto mb-6 shadow-lg shadow-cyan-400/30 group-hover:scale-110 transition-transform duration-300"
								>
									<Wallet class="w-10 h-10 text-white" />
								</div>
								<h3 class="text-cyan-400 text-2xl font-semibold mb-4">Connect Your Wallet</h3>
								<p class="text-slate-300 leading-relaxed">
									Securely connect your StarkNet wallet to start sending and receiving micropayments
									instantly.
								</p>
							</div>
						</div>

						<!-- Step 2 -->
						<div class="text-center">
							<div
								class="px-8 py-3 bg-transparent border-2 border-purple-400 text-purple-400 text-2xl font-bold mb-8 shadow-lg shadow-purple-400/20 backdrop-blur-sm rounded-2xl"
							>
								02
							</div>
							<div
								class="relative bg-slate-900/80 backdrop-blur-md p-8 border border-purple-500/20 rounded-2xl hover:border-purple-400/40 hover:shadow-2xl hover:shadow-purple-400/10 transition-all duration-500 hover:-translate-y-3 w-full max-w-sm group"
							>
								<div
									class="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mx-auto mb-6 shadow-lg shadow-purple-400/30 group-hover:scale-110 transition-transform duration-300"
								>
									<Brain class="w-10 h-10 text-white" />
								</div>
								<h3 class="text-purple-400 text-2xl font-semibold mb-4">
									Create AI-Optimized Campaign
								</h3>
								<p class="text-slate-300 leading-relaxed">
									Our AI analyzes market trends and suggests optimal titles, descriptions, and
									pricing strategies for maximum engagement.
								</p>
							</div>
						</div>

						<!-- Step 3 -->
						<div class="text-center">
							<div
								class="px-8 py-3 bg-transparent border-2 border-emerald-400 text-emerald-400 text-2xl font-bold mb-8 shadow-lg shadow-emerald-400/20 backdrop-blur-sm rounded-2xl"
							>
								03
							</div>
							<div
								class="relative bg-slate-900/80 backdrop-blur-md p-8 border border-emerald-500/20 rounded-2xl hover:border-emerald-400/40 hover:shadow-2xl hover:shadow-emerald-400/10 transition-all duration-500 hover:-translate-y-3 w-full max-w-sm group"
							>
								<div
									class="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl mx-auto mb-6 shadow-lg shadow-emerald-400/30 group-hover:scale-110 transition-transform duration-300"
								>
									<svg
										class="w-10 h-10 text-white"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
										></path>
									</svg>
								</div>
								<h3 class="text-emerald-400 text-2xl font-semibold mb-4">Launch & Monitor</h3>
								<p class="text-slate-300 leading-relaxed">
									Launch your campaign and monitor performance with real-time AI-powered analytics
									and optimization suggestions.
								</p>
							</div>
						</div>
					</div>

					<div class="text-center mt-16">
						<a
							href="/dashboard"
							class="px-12 py-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl text-xl inline-flex items-center"
						>
							Launch Your First Campaign
							<ArrowRight class="ml-3 w-6 h-6" />
						</a>
					</div>
				</div>
			{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	@keyframes floatIn {
		0% {
			transform: translateY(20px) scale(0.95);
			opacity: 0;
		}
		25% {
			transform: translateY(-5px) scale(1.02);
			opacity: 0.7;
		}
		50% {
			transform: translateY(5px) scale(0.98);
			opacity: 0.9;
		}
		100% {
			transform: translateY(0) scale(1);
			opacity: 1;
		}
	}

	.animate-floatIn {
		animation: floatIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
	}
</style>
