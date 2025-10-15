<script lang="ts">
  import Cta from "$lib/components/home/Cta.svelte";
  import Features from "$lib/components/home/Features.svelte";
  import Hero from "$lib/components/home/Hero.svelte";
  import Hiw from "$lib/components/home/Hiw.svelte";
  import Usecases from "$lib/components/home/Usecases.svelte";
</script>

<main class="flex flex-col min-h-screen">
  <!-- Hero Section -->
  <Hero />
  <!-- How It Works Section -->
  <Hiw />
  <!-- Use Cases Section -->
  <Usecases />
  <!-- Features Section -->
  <Features />
  <!-- Final Call to Action Section -->
  <Cta />
</main>
