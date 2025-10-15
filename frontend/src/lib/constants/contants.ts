export const CONTRACT_ABI = [
	{
		type: 'impl',
		name: 'ServiceContractImpl',
		interface_name: 'pay::IServiceContract'
	},
	{
		type: 'struct',
		name: 'core::byte_array::ByteArray',
		members: [
			{
				name: 'data',
				type: 'core::array::Array::<core::bytes_31::bytes31>'
			},
			{ name: 'pending_word', type: 'core::felt252' },
			{ name: 'pending_word_len', type: 'core::integer::u32' }
		]
	},
	{
		type: 'enum',
		name: 'pay::ServiceType',
		variants: [
			{ name: 'Donation', type: '()' },
			{ name: 'Service', type: '()' },
			{ name: 'Product', type: '()' }
		]
	},
	{
		type: 'struct',
		name: 'core::integer::u256',
		members: [
			{ name: 'low', type: 'core::integer::u128' },
			{ name: 'high', type: 'core::integer::u128' }
		]
	},
	{
		type: 'enum',
		name: 'core::bool',
		variants: [
			{ name: 'False', type: '()' },
			{ name: 'True', type: '()' }
		]
	},
	{
		type: 'struct',
		name: 'pay::Service',
		members: [
			{
				name: 'owner',
				type: 'core::starknet::contract_address::ContractAddress'
			},
			{ name: 'name', type: 'core::byte_array::ByteArray' },
			{ name: 'description', type: 'core::byte_array::ByteArray' },
			{ name: 'service_type', type: 'pay::ServiceType' },
			{ name: 'image_url', type: 'core::byte_array::ByteArray' },
			{ name: 'amount', type: 'core::integer::u256' },
			{ name: 'total_raised', type: 'core::integer::u256' },
			{ name: 'supporter_count', type: 'core::integer::u32' },
			{ name: 'is_active', type: 'core::bool' },
			{ name: 'created_at', type: 'core::integer::u64' },
			{ name: 'updated_at', type: 'core::integer::u64' }
		]
	},
	{
		type: 'interface',
		name: 'pay::IServiceContract',
		items: [
			{
				type: 'function',
				name: 'create_service',
				inputs: [
					{ name: 'name', type: 'core::byte_array::ByteArray' },
					{ name: 'description', type: 'core::byte_array::ByteArray' },
					{ name: 'service_type', type: 'pay::ServiceType' },
					{ name: 'image_url', type: 'core::byte_array::ByteArray' },
					{ name: 'amount', type: 'core::integer::u256' }
				],
				outputs: [{ type: 'core::integer::u256' }],
				state_mutability: 'external'
			},
			{
				type: 'function',
				name: 'get_service',
				inputs: [
					{
						name: 'user',
						type: 'core::starknet::contract_address::ContractAddress'
					},
					{ name: 'id', type: 'core::integer::u256' }
				],
				outputs: [{ type: 'pay::Service' }],
				state_mutability: 'view'
			},
			{
				type: 'function',
				name: 'pay_service',
				inputs: [
					{
						name: 'user',
						type: 'core::starknet::contract_address::ContractAddress'
					},
					{ name: 'id', type: 'core::integer::u256' },
					{ name: 'pay_amount', type: 'core::integer::u256' }
				],
				outputs: [],
				state_mutability: 'external'
			},
			{
				type: 'function',
				name: 'get_user_services',
				inputs: [
					{
						name: 'user',
						type: 'core::starknet::contract_address::ContractAddress'
					}
				],
				outputs: [{ type: 'core::array::Array::<pay::Service>' }],
				state_mutability: 'view'
			},
			{
				type: 'function',
				name: 'withdraw_funds',
				inputs: [{ name: 'id', type: 'core::integer::u256' }],
				outputs: [],
				state_mutability: 'external'
			},
			{
				type: 'function',
				name: 'toggle_service_status',
				inputs: [{ name: 'id', type: 'core::integer::u256' }],
				outputs: [],
				state_mutability: 'external'
			},
			{
				type: 'function',
				name: 'update_service',
				inputs: [
					{ name: 'id', type: 'core::integer::u256' },
					{ name: 'name', type: 'core::byte_array::ByteArray' },
					{ name: 'description', type: 'core::byte_array::ByteArray' },
					{ name: 'image_url', type: 'core::byte_array::ByteArray' }
				],
				outputs: [],
				state_mutability: 'external'
			},
			{
				type: 'function',
				name: 'get_strk_token_address',
				inputs: [],
				outputs: [{ type: 'core::starknet::contract_address::ContractAddress' }],
				state_mutability: 'view'
			},
			{
				type: 'function',
				name: 'can_receive_payment',
				inputs: [
					{
						name: 'user',
						type: 'core::starknet::contract_address::ContractAddress'
					},
					{ name: 'id', type: 'core::integer::u256' }
				],
				outputs: [{ type: 'core::bool' }],
				state_mutability: 'view'
			},
			{
				type: 'function',
				name: 'get_active_services_count',
				inputs: [
					{
						name: 'user',
						type: 'core::starknet::contract_address::ContractAddress'
					}
				],
				outputs: [{ type: 'core::integer::u32' }],
				state_mutability: 'view'
			},
			{
				type: 'function',
				name: 'get_total_revenue',
				inputs: [
					{
						name: 'user',
						type: 'core::starknet::contract_address::ContractAddress'
					}
				],
				outputs: [{ type: 'core::integer::u256' }],
				state_mutability: 'view'
			},
			{
				type: 'function',
				name: 'withdraw_all_funds',
				inputs: [],
				outputs: [{ type: 'core::integer::u256' }],
				state_mutability: 'external'
			},
			{
				type: 'function',
				name: 'get_total_supporters',
				inputs: [
					{
						name: 'user',
						type: 'core::starknet::contract_address::ContractAddress'
					}
				],
				outputs: [{ type: 'core::integer::u32' }],
				state_mutability: 'view'
			},
			{
				type: 'function',
				name: 'get_service_supporters',
				inputs: [
					{
						name: 'user',
						type: 'core::starknet::contract_address::ContractAddress'
					},
					{ name: 'id', type: 'core::integer::u256' }
				],
				outputs: [
					{
						type: 'core::array::Array::<core::starknet::contract_address::ContractAddress>'
					}
				],
				state_mutability: 'view'
			}
		]
	},
	{
		type: 'event',
		name: 'pay::ServiceContract::ServiceCreated',
		kind: 'struct',
		members: [
			{
				name: 'owner',
				type: 'core::starknet::contract_address::ContractAddress',
				kind: 'key'
			},
			{ name: 'service_id', type: 'core::integer::u256', kind: 'key' },
			{ name: 'service_type', type: 'pay::ServiceType', kind: 'data' },
			{ name: 'amount', type: 'core::integer::u256', kind: 'data' },
			{ name: 'created_at', type: 'core::integer::u64', kind: 'data' }
		]
	},
	{
		type: 'event',
		name: 'pay::ServiceContract::PaymentReceived',
		kind: 'struct',
		members: [
			{
				name: 'service_owner',
				type: 'core::starknet::contract_address::ContractAddress',
				kind: 'key'
			},
			{ name: 'service_id', type: 'core::integer::u256', kind: 'key' },
			{
				name: 'payer',
				type: 'core::starknet::contract_address::ContractAddress',
				kind: 'data'
			},
			{ name: 'amount', type: 'core::integer::u256', kind: 'data' },
			{ name: 'is_new_supporter', type: 'core::bool', kind: 'data' }
		]
	},
	{
		type: 'event',
		name: 'pay::ServiceContract::FundsWithdrawn',
		kind: 'struct',
		members: [
			{
				name: 'owner',
				type: 'core::starknet::contract_address::ContractAddress',
				kind: 'key'
			},
			{ name: 'service_id', type: 'core::integer::u256', kind: 'key' },
			{ name: 'amount', type: 'core::integer::u256', kind: 'data' }
		]
	},
	{
		type: 'event',
		name: 'pay::ServiceContract::ServiceUpdated',
		kind: 'struct',
		members: [
			{
				name: 'owner',
				type: 'core::starknet::contract_address::ContractAddress',
				kind: 'key'
			},
			{ name: 'service_id', type: 'core::integer::u256', kind: 'key' },
			{ name: 'updated_at', type: 'core::integer::u64', kind: 'data' }
		]
	},
	{
		type: 'event',
		name: 'pay::ServiceContract::ServiceStatusToggled',
		kind: 'struct',
		members: [
			{
				name: 'owner',
				type: 'core::starknet::contract_address::ContractAddress',
				kind: 'key'
			},
			{ name: 'service_id', type: 'core::integer::u256', kind: 'key' },
			{ name: 'is_active', type: 'core::bool', kind: 'data' }
		]
	},
	{
		type: 'event',
		name: 'pay::ServiceContract::Event',
		kind: 'enum',
		variants: [
			{
				name: 'ServiceCreated',
				type: 'pay::ServiceContract::ServiceCreated',
				kind: 'nested'
			},
			{
				name: 'PaymentReceived',
				type: 'pay::ServiceContract::PaymentReceived',
				kind: 'nested'
			},
			{
				name: 'FundsWithdrawn',
				type: 'pay::ServiceContract::FundsWithdrawn',
				kind: 'nested'
			},
			{
				name: 'ServiceUpdated',
				type: 'pay::ServiceContract::ServiceUpdated',
				kind: 'nested'
			},
			{
				name: 'ServiceStatusToggled',
				type: 'pay::ServiceContract::ServiceStatusToggled',
				kind: 'nested'
			}
		]
	}
];
