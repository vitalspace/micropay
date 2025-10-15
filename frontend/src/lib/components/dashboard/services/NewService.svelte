<script lang="ts">
    import { useApi } from '$lib/hooks/useApi';
    import { useContract } from '$lib/hooks/useContract';
    import { showToast } from '$lib/stores/toastStore';
    import { ArrowLeft, Building2, Check, Heart, ShoppingBag, Sparkles, X } from 'lucide-svelte';
    import { z } from 'zod';

    const { improveService } = useApi();
    const { createService } = useContract();

    interface Props {
        onBack: () => void;
    }

    let { onBack }: Props = $props();

    // ✅ CAMBIO: Actualizar tipos de servicio para coincidir con el enum Cairo
    const SERVICE_TYPES = [
        { id: 0, name: 'Donation', description: 'Collect funds for a cause', icon: Heart },
        { id: 1, name: 'Service', description: 'Accept payments for services', icon: Building2 }, // Cambió de 'Business' a 'Service'
        { id: 2, name: 'Product', description: 'Sell products or services', icon: ShoppingBag }
    ];

    const getFormSchema = (selectedType: number) => {
        const baseSchema = z.object({
            name: z.string().min(1, 'Name is required').max(50, 'Name must be 50 characters or less'),
            description: z
                .string()
                .min(1, 'Description is required')
                .max(256, 'Description must be 256 characters or less'),
            image: z.union([z.string().url('Invalid image URL'), z.literal('')])
        });

        if (selectedType === 0) {
            return baseSchema.extend({
                goal: z.coerce.number().min(0, 'Goal must be 0 or greater'),
                price: z.any().optional()
            });
        } else {
            return baseSchema.extend({
                price: z.coerce.number().min(0, 'Price must be 0 or greater'),
                goal: z.any().optional()
            });
        }
    };

    let selectedType = $state(0);
    let formData = $state({
        name: '',
        description: '',
        goal: '',
        price: '',
        image: ''
    });

    let errors = $state<Record<string, string>>({});
    let isSubmitting = $state(false);
    let isImprovingName = $state(false);
    let isImprovingDescription = $state(false);

    const selectType = (typeId: number) => {
        selectedType = typeId;
    };

    const getButtonText = () => {
        switch (selectedType) {
            case 0:
                return 'Create Donation';
            case 1:
                return 'Create Service'; // ✅ Cambió de 'Business' a 'Service'
            case 2:
                return 'Create Product';
            default:
                return 'Create Campaign';
        }
    };

    const getLabels = () => {
        const typeNames = ['Donation', 'Service', 'Product']; // ✅ Cambió 'Business' a 'Service'
        const typeName = typeNames[selectedType] || 'Campaign';
        return {
            name: `${typeName} Name`,
            description: `${typeName} Description`,
            goal: 'Goal (STRK)',
            price: 'Price (STRK)',
            image: 'Image URL'
        };
    };

    // ✅ CAMBIO: Retornar exactamente las variantes del enum Cairo con capitalización correcta
    const getServiceType = (): 'Donation' | 'Service' | 'Product' => {
        switch (selectedType) {
            case 0:
                return 'Donation'; // Capitalizado
            case 1:
                return 'Service'; // Cambió de 'business' a 'Service'
            case 2:
                return 'Product'; // Capitalizado
            default:
                return 'Donation';
        }
    };

    const improveName = async () => {
        if (!formData.name.trim()) return;
        isImprovingName = true;
        try {
            const response = await improveService({
                field: 'name',
                context: formData.name,
                currentValue: formData.name
            });

            formData.name = response.data.improvedText;
            showToast('Campaign name improved!', 'success');
        } catch (error) {
            console.error('Error improving name:', error);
            showToast('Error improving name', 'error');
        } finally {
            isImprovingName = false;
        }
    };

    const improveDescription = async () => {
        if (!formData.description.trim()) return;
        isImprovingDescription = true;
        try {
            const response = await improveService({
                field: 'description',
                context: formData.description,
                currentValue: formData.description
            });
            formData.description = response.data.improvedText;
            showToast('Description improved!', 'success'); // ✅ Corrección: texto correcto
        } catch (error) {
            console.error('Error improving description:', error);
            showToast('Error improving description', 'error');
        } finally {
            isImprovingDescription = false;
        }
    };

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        const schema = getFormSchema(selectedType);
        const result = schema.safeParse(formData);
        if (!result.success) {
            const fieldErrors = result.error.flatten().fieldErrors as Record<string, string[]>;
            errors = {};
            for (const [key, errs] of Object.entries(fieldErrors)) {
                if (errs && errs.length > 0) {
                    errors[key] = errs[0];
                }
            }
        } else {
            errors = {};
            isSubmitting = true;
            try {
                const amountNum = selectedType === 0 ? result.data.goal : result.data.price;
                const amountU256 = (BigInt(Math.round(amountNum * 10 ** 18))).toString();
                
                // ✅ getServiceType() ahora retorna 'Donation', 'Service', o 'Product' con capitalización correcta
                const serviceType = getServiceType();
                
                console.log('Creating campaign with type:', serviceType, 'amount:', amountU256);
                
                await createService(
                    result.data.name,
                    result.data.description,
                    serviceType, // ✅ Ahora envía el valor correcto
                    result.data.image || '',
                    amountU256
                );
                showToast('Campaign created successfully', 'success');
                onBack();
            } catch (error) {
                console.error('Submission error:', error);
                showToast('Error creating campaign', 'error');
            } finally {
                isSubmitting = false;
            }
        }
    };
</script>

<div class="fixed inset-0 z-30 flex items-center justify-center backdrop-blur-2xl overflow-hidden">
    <!-- Left Sidebar -->
    <div class="w-1/5 bg-gradient-to-br from-purple-600 to-purple-700 p-8 flex flex-col justify-center text-white h-full">
        <div class="mb-8">
            <h1 class="text-3xl font-bold mb-4">Start Your Campaign</h1>
            <p class="text-purple-100 leading-relaxed">
                Bring your ideas to life and get the support you need. Let's make a difference together.
            </p>
        </div>

        <!-- Decorative Element -->
        <div class="relative">
            <div class="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
                <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                </div>
            </div>
        </div>
    </div>

    <!-- Main Content -->
    <div class="flex items-center justify-center h-full">
        <div class="bg-white shadow-xl w-full max-w-2xl h-screen pt-24">
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-100">
                <div class="flex items-center gap-4">
                    <button
                        onclick={onBack}
                        class="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                    >
                        <ArrowLeft size={20} class="text-gray-600" />
                    </button>
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900">Create Campaign</h1>
                        <p class="text-sm text-gray-600">Choose your campaign type and details</p>
                    </div>
                </div>
                <button
                    onclick={onBack}
                    class="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                    <X size={20} class="text-gray-600" />
                </button>
            </div>

            <!-- Campaign Type Selection -->
            <div class="p-6">
                <h2 class="text-lg font-bold text-gray-900 mb-4">Campaign Type</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                    {#each SERVICE_TYPES as type}
                        <button
                            onclick={() => selectType(type.id)}
                            class="w-full p-3 rounded-xl border-2 transition-all text-left cursor-pointer group {selectedType ===
                            type.id
                                ? 'border-purple-500 bg-purple-50 shadow-lg'
                                : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/50'}"
                        >
                            <div class="flex flex-col items-center text-center gap-2">
                                <!-- Ícono más compacto -->
                                <div
                                    class="p-2 rounded-lg {selectedType === type.id
                                        ? 'bg-purple-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-600 group-hover:bg-purple-100'}"
                                >
                                    {#if type.id === 0}
                                        <Heart size={20} />
                                    {:else if type.id === 1}
                                        <Building2 size={20} />
                                    {:else if type.id === 2}
                                        <ShoppingBag size={20} />
                                    {/if}
                                </div>

                                <!-- Contenido más compacto -->
                                <div class="flex-1">
                                    <div class="font-bold text-gray-900 text-base mb-1">
                                        {type.name}
                                    </div>
                                    <div class="text-xs text-gray-600 leading-tight">
                                        {type.description}
                                    </div>
                                </div>

                                <!-- Check mark más pequeño -->
                                {#if selectedType === type.id}
                                    <div
                                        class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-md"
                                    >
                                        <Check size={14} class="text-white" />
                                    </div>
                                {:else}
                                    <!-- Espacio reservado más pequeño -->
                                    <div class="w-5 h-5"></div>
                                {/if}
                            </div>
                        </button>
                    {/each}
                </div>
            </div>

            <!-- Form -->
            <form onsubmit={handleSubmit} class="px-6 pb-6 space-y-4">
                <!-- Campaign Name -->
                <div>
                    <div class="flex items-center justify-between mb-3">
                        <span class="block text-sm font-bold text-gray-800">
                            {getLabels().name}
                            <span class="text-xs text-gray-500 font-normal ml-2">({formData.name.length}/50)</span>
                        </span>
                        <button
                            type="button"
                            onclick={improveName}
                            disabled={!formData.name.trim() || isImprovingName}
                            class="cursor-pointer flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 disabled:bg-gray-100 disabled:text-gray-400 rounded-lg transition-all disabled:cursor-not-allowed"
                        >
                            {#if isImprovingName}
                                <div
                                    class="w-3 h-3 border border-purple-600 border-t-transparent rounded-full animate-spin"
                                ></div>
                                <span>Improving...</span>
                            {:else}
                                <Sparkles size={12} />
                                <span>Improve with AI</span>
                            {/if}
                        </button>
                    </div>
                    <input
                        type="text"
                        bind:value={formData.name}
                        maxlength="50"
                        placeholder="Enter campaign name"
                        class="w-full px-4 py-3 border border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all {errors.name
                            ? 'border-red-500'
                            : ''}"
                    />
                    {#if errors.name}
                        <p class="text-sm text-red-600 mt-2">{errors.name}</p>
                    {/if}
                </div>

                <!-- Description -->
                <div>
                    <div class="flex items-center justify-between mb-3">
                        <span class="block text-sm font-bold text-gray-800">
                            {getLabels().description}
                            <span class="text-xs text-gray-500 font-normal ml-2"
                                >({formData.description.length}/256)</span
                            >
                        </span>
                        <button
                            type="button"
                            onclick={improveDescription}
                            disabled={!formData.description.trim() || isImprovingDescription}
                            class=" cursor-pointer flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 disabled:bg-gray-100 disabled:text-gray-400 rounded-lg transition-all disabled:cursor-not-allowed"
                        >
                            {#if isImprovingDescription}
                                <div
                                    class="w-3 h-3 border border-purple-600 border-t-transparent rounded-full animate-spin"
                                ></div>
                                <span>Improving...</span>
                            {:else}
                                <Sparkles size={12} />
                                <span>Improve with AI</span>
                            {/if}
                        </button>
                    </div>
                    <textarea
                        bind:value={formData.description}
                        maxlength="256"
                        rows="4"
                        placeholder="Describe your campaign..."
                        class="w-full px-4 py-3 border border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none transition-all {errors.description
                            ? 'border-red-500'
                            : ''}"
                    ></textarea>
                    {#if errors.description}
                        <p class="text-sm text-red-600 mt-2">{errors.description}</p>
                    {/if}
                </div>

                <!-- Two column layout for goal/price and image -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Type-specific fields -->
                    {#if selectedType === 0}
                        <div>
                            <span class="block text-sm font-bold text-gray-800 mb-3">{getLabels().goal}</span>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                bind:value={formData.goal}
                                placeholder="0.00"
                                class="w-full px-4 py-3 border border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all {errors.goal
                                    ? 'border-red-500'
                                    : ''}"
                            />
                            {#if errors.goal}
                                <p class="text-sm text-red-600 mt-2">{errors.goal}</p>
                            {/if}
                        </div>
                    {/if}

                    {#if selectedType === 1 || selectedType === 2}
                        <div>
                            <span class="block text-sm font-bold text-gray-800 mb-3">{getLabels().price}</span>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                bind:value={formData.price}
                                placeholder="0.00"
                                class="w-full px-4 py-3 border border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all {errors.price
                                    ? 'border-red-500'
                                    : ''}"
                            />
                            {#if errors.price}
                                <p class="text-sm text-red-600 mt-2">{errors.price}</p>
                            {/if}
                        </div>
                    {/if}

                    <!-- Image URL -->
                    <div>
                        <span class="block text-sm font-bold text-gray-800 mb-3">{getLabels().image}</span>
                        <input
                            type="url"
                            bind:value={formData.image}
                            maxlength="200"
                            placeholder="https://example.com/image.jpg"
                            class="w-full px-4 py-3 border border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all {errors.image
                                ? 'border-red-500'
                                : ''}"
                        />
                        {#if errors.image}
                            <p class="text-sm text-red-600 mt-2">{errors.image}</p>
                        {/if}
                    </div>
                </div>

                <!-- Preview Image -->
                <!-- {#if formData.image}
                    <div>
                        <span class="block text-sm font-bold text-gray-800 mb-3">Preview</span>
                        <div
                            class="w-full h-40 bg-gray-50 rounded-xl overflow-hidden border border-gray-200"
                        >
                            <img
                                src={formData.image}
                                alt="Campaign preview"
                                class="w-full h-full object-cover"
                                onerror={() => {
                                    errors.image = 'Invalid image URL';
                                }}
                            />
                        </div>
                    </div>
                {/if} -->

                <!-- Submit Buttons -->
                <div class="flex gap-3 pt-4">
                    <button
                        type="button"
                        onclick={() => {
                            console.log('Campaign creation cancelled');
                            onBack();
                        }}
                        class="cursor-pointer flex-1 px-4 py-3 text-gray-700 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 transition-all font-semibold"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        class="cursor-pointer flex-1 px-4 py-3 text-white rounded-xl transition-all font-semibold shadow-lg disabled:opacity-50 {isSubmitting
                            ? 'bg-gray-400'
                            : 'bg-purple-600 hover:bg-purple-700 hover:shadow-xl'}"
                    >
                        {#if isSubmitting}
                            <div class="flex items-center justify-center gap-2">
                                <div
                                    class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
                                ></div>
                                <span>Creating...</span>
                            </div>
                        {:else}
                            <span>{getButtonText()}</span>
                        {/if}
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
