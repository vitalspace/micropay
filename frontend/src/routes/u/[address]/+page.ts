// src/routes/c/[address]/[id]/+page.ts

import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	return {
		address: params.address,
		id: params.id
	};
};
