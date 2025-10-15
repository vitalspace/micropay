import { writable } from 'svelte/store';

export const activeTab = writable(0);
export const showNewServiceModal = writable(false);
