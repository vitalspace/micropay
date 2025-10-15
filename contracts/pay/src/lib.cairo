use starknet::ContractAddress;

/// Enum for service types
#[derive(Drop, Copy, Serde, starknet::Store, PartialEq)]
#[allow(starknet::store_no_default_variant)]
pub enum ServiceType {
    Donation,
    Service,
    Product,
}

/// Struct representing a service entry
#[derive(Drop, Serde, starknet::Store)]
pub struct Service {
    pub owner: ContractAddress,
    pub name: ByteArray,
    pub description: ByteArray,
    pub service_type: ServiceType,
    pub image_url: ByteArray,
    pub amount: u256,
    pub total_raised: u256,
    pub supporter_count: u32,
    pub is_active: bool,
    pub created_at: u64,
    pub updated_at: u64,
}

/// Interface for the Service Contract
#[starknet::interface]
pub trait IServiceContract<TContractState> {
    fn create_service(
        ref self: TContractState,
        name: ByteArray,
        description: ByteArray,
        service_type: ServiceType,
        image_url: ByteArray,
        amount: u256
    ) -> u256;
    
    fn get_service(self: @TContractState, user: ContractAddress, id: u256) -> Service;
    
    fn pay_service(
        ref self: TContractState, 
        user: ContractAddress, 
        id: u256, 
        pay_amount: u256
    );
    
    fn get_user_services(self: @TContractState, user: ContractAddress) -> Array<Service>;
    
    fn withdraw_funds(ref self: TContractState, id: u256);
    
    fn toggle_service_status(ref self: TContractState, id: u256);
    
    fn update_service(
        ref self: TContractState,
        id: u256,
        name: ByteArray,
        description: ByteArray,
        image_url: ByteArray
    );
    
    fn get_strk_token_address(self: @TContractState) -> ContractAddress;
    
    fn can_receive_payment(self: @TContractState, user: ContractAddress, id: u256) -> bool;
    
    fn get_active_services_count(self: @TContractState, user: ContractAddress) -> u32;
    
    fn get_total_revenue(self: @TContractState, user: ContractAddress) -> u256;
    
    fn withdraw_all_funds(ref self: TContractState) -> u256;
    
    fn get_total_supporters(self: @TContractState, user: ContractAddress) -> u32;
    
    fn get_service_supporters(
        self: @TContractState, 
        user: ContractAddress, 
        id: u256
    ) -> Array<ContractAddress>;
}

/// Service contract for managing service entries
#[starknet::contract]
mod ServiceContract {
    use starknet::{get_caller_address, get_contract_address, get_block_timestamp, ContractAddress};
    use starknet::storage::{
        Map, StorageMapReadAccess, StorageMapWriteAccess, Vec, 
        MutableVecTrait, StoragePointerReadAccess,
        StoragePathEntry, VecTrait
    };
    use openzeppelin_token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
    use super::{Service, ServiceType};

    const STRK_TOKEN_ADDRESS: felt252 = 0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d;

    #[storage]
    struct Storage {
        services: Map<(ContractAddress, u256), Service>,
        next_id: Map<ContractAddress, u256>,
        has_supported: Map<(ContractAddress, u256, ContractAddress), bool>,
        supporters: Map<(ContractAddress, u256), Vec<ContractAddress>>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        ServiceCreated: ServiceCreated,
        PaymentReceived: PaymentReceived,
        FundsWithdrawn: FundsWithdrawn,
        ServiceUpdated: ServiceUpdated,
        ServiceStatusToggled: ServiceStatusToggled,
    }

    #[derive(Drop, starknet::Event)]
    struct ServiceCreated {
        #[key]
        owner: ContractAddress,
        #[key]
        service_id: u256,
        service_type: ServiceType,
        amount: u256,
        created_at: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct PaymentReceived {
        #[key]
        service_owner: ContractAddress,
        #[key]
        service_id: u256,
        payer: ContractAddress,
        amount: u256,
        is_new_supporter: bool,
    }

    #[derive(Drop, starknet::Event)]
    struct FundsWithdrawn {
        #[key]
        owner: ContractAddress,
        #[key]
        service_id: u256,
        amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct ServiceUpdated {
        #[key]
        owner: ContractAddress,
        #[key]
        service_id: u256,
        updated_at: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct ServiceStatusToggled {
        #[key]
        owner: ContractAddress,
        #[key]
        service_id: u256,
        is_active: bool,
    }

    #[abi(embed_v0)]
    impl ServiceContractImpl of super::IServiceContract<ContractState> {
        fn create_service(
            ref self: ContractState,
            name: ByteArray,
            description: ByteArray,
            service_type: ServiceType,
            image_url: ByteArray,
            amount: u256
        ) -> u256 {
            assert(amount > 0, 'Amount must be > 0');
            assert(name.len() > 0, 'Name required');
            
            let caller = get_caller_address();
            let id = self.next_id.read(caller);
            let timestamp = get_block_timestamp();
            
            let service = Service {
                owner: caller,
                name,
                description,
                service_type,
                image_url,
                amount,
                total_raised: 0,
                supporter_count: 0,
                is_active: true,
                created_at: timestamp,
                updated_at: timestamp,
            };
            
            self.services.write((caller, id), service);
            self.next_id.write(caller, id + 1);
            
            self.emit(ServiceCreated {
                owner: caller,
                service_id: id,
                service_type,
                amount,
                created_at: timestamp,
            });
            
            id
        }

        fn get_service(self: @ContractState, user: ContractAddress, id: u256) -> Service {
            self.services.read((user, id))
        }

        fn pay_service(
            ref self: ContractState, 
            user: ContractAddress, 
            id: u256, 
            pay_amount: u256
        ) {
            assert(pay_amount > 0, 'Pay amount must be > 0');
            
            let mut service = self.services.read((user, id));
            assert(service.is_active, 'Service is not active');
            
            let caller = get_caller_address();
            let this_contract = get_contract_address();
            
            let mut should_deactivate = false;
            
            if service.service_type == ServiceType::Donation {
                let remaining = service.amount - service.total_raised;
                assert(remaining > 0, 'Goal already reached');
                assert(pay_amount <= remaining, 'Exceeds remaining goal');
                
                if service.total_raised + pay_amount >= service.amount {
                    should_deactivate = true;
                }
            } else {
                assert(pay_amount == service.amount, 'Must pay exact amount');
                assert(service.supporter_count == 0, 'Already purchased');
                should_deactivate = true;
            }
            
            let strk_token = IERC20Dispatcher { 
                contract_address: STRK_TOKEN_ADDRESS.try_into().unwrap() 
            };
            
            let success = strk_token.transfer_from(
                caller,
                this_contract,
                pay_amount
            );
            
            assert(success, 'STRK transfer failed');
            
            let has_supported_before = self.has_supported.read((user, id, caller));
            let is_new_supporter = !has_supported_before;
            
            if is_new_supporter {
                service.supporter_count += 1;
                self.has_supported.write((user, id, caller), true);
                self.supporters.entry((user, id)).push(caller);
            }
            
            service.total_raised += pay_amount;
            service.updated_at = get_block_timestamp();
            
            if should_deactivate {
                service.is_active = false;
            }
            
            self.services.write((user, id), service);
            
            self.emit(PaymentReceived {
                service_owner: user,
                service_id: id,
                payer: caller,
                amount: pay_amount,
                is_new_supporter,
            });
        }

        fn get_user_services(self: @ContractState, user: ContractAddress) -> Array<Service> {
            let mut services = ArrayTrait::new();
            let next_id = self.next_id.read(user);
            let mut i: u256 = 0;
            
            while i < next_id {
                services.append(self.services.read((user, i)));
                i += 1;
            };
            
            services
        }

        fn withdraw_funds(ref self: ContractState, id: u256) {
            let caller = get_caller_address();
            let mut service = self.services.read((caller, id));
            
            assert(service.owner == caller, 'Only owner can withdraw');
            assert(service.total_raised > 0, 'No funds to withdraw');
            
            let strk_token = IERC20Dispatcher { 
                contract_address: STRK_TOKEN_ADDRESS.try_into().unwrap() 
            };
            
            let amount_to_withdraw = service.total_raised;
            let success = strk_token.transfer(caller, amount_to_withdraw);
            assert(success, 'STRK withdrawal failed');
            
            service.total_raised = 0;
            service.updated_at = get_block_timestamp();
            self.services.write((caller, id), service);
            
            self.emit(FundsWithdrawn {
                owner: caller,
                service_id: id,
                amount: amount_to_withdraw,
            });
        }

        fn toggle_service_status(ref self: ContractState, id: u256) {
            let caller = get_caller_address();
            let mut service = self.services.read((caller, id));
            
            assert(service.owner == caller, 'Only owner can toggle');
            
            service.is_active = !service.is_active;
            let new_status = service.is_active;
            service.updated_at = get_block_timestamp();
            
            self.services.write((caller, id), service);
            
            self.emit(ServiceStatusToggled {
                owner: caller,
                service_id: id,
                is_active: new_status,
            });
        }

        fn update_service(
            ref self: ContractState,
            id: u256,
            name: ByteArray,
            description: ByteArray,
            image_url: ByteArray
        ) {
            let caller = get_caller_address();
            let mut service = self.services.read((caller, id));
            
            assert(service.owner == caller, 'Only owner can update');
            assert(name.len() > 0, 'Name required');
            
            service.name = name;
            service.description = description;
            service.image_url = image_url;
            service.updated_at = get_block_timestamp();
            
            let timestamp = service.updated_at;
            self.services.write((caller, id), service);
            
            self.emit(ServiceUpdated {
                owner: caller,
                service_id: id,
                updated_at: timestamp,
            });
        }

        fn get_strk_token_address(self: @ContractState) -> ContractAddress {
            STRK_TOKEN_ADDRESS.try_into().unwrap()
        }
        
        fn can_receive_payment(self: @ContractState, user: ContractAddress, id: u256) -> bool {
            let service = self.services.read((user, id));
            
            if !service.is_active {
                return false;
            }
            
            if service.service_type == ServiceType::Donation {
                return service.total_raised < service.amount;
            } else {
                return service.supporter_count == 0;
            }
        }

        fn get_active_services_count(self: @ContractState, user: ContractAddress) -> u32 {
            let mut active_count: u32 = 0;
            let next_id = self.next_id.read(user);
            let mut i: u256 = 0;
            
            while i < next_id {
                let service = self.services.read((user, i));
                if service.is_active {
                    active_count += 1;
                }
                i += 1;
            };
            
            active_count
        }

        fn get_total_revenue(self: @ContractState, user: ContractAddress) -> u256 {
            let mut total_revenue: u256 = 0;
            let next_id = self.next_id.read(user);
            let mut i: u256 = 0;
            
            while i < next_id {
                let service = self.services.read((user, i));
                if service.total_raised > 0 {
                    total_revenue += service.total_raised;
                }
                i += 1;
            };
            
            total_revenue
        }

        fn withdraw_all_funds(ref self: ContractState) -> u256 {
            let caller = get_caller_address();
            let next_id = self.next_id.read(caller);
            let mut total_withdrawn: u256 = 0;
            let mut i: u256 = 0;
            
            let strk_token = IERC20Dispatcher { 
                contract_address: STRK_TOKEN_ADDRESS.try_into().unwrap() 
            };
            
            while i < next_id {
                let service = self.services.read((caller, i));
                
                if service.owner == caller && service.total_raised > 0 {
                    let amount = service.total_raised;
                    
                    let success = strk_token.transfer(caller, amount);
                    assert(success, 'STRK withdrawal failed');
                    
                    total_withdrawn += amount;
                    
                    let updated_service = Service {
                        owner: service.owner,
                        name: service.name,
                        description: service.description,
                        service_type: service.service_type,
                        image_url: service.image_url,
                        amount: service.amount,
                        total_raised: 0,
                        supporter_count: service.supporter_count,
                        is_active: service.is_active,
                        created_at: service.created_at,
                        updated_at: get_block_timestamp(),
                    };
                    
                    self.services.write((caller, i), updated_service);
                    
                    self.emit(FundsWithdrawn {
                        owner: caller,
                        service_id: i,
                        amount,
                    });
                }
                
                i += 1;
            };
            
            assert(total_withdrawn > 0, 'No funds to withdraw');
            
            total_withdrawn
        }

        fn get_total_supporters(self: @ContractState, user: ContractAddress) -> u32 {
            let mut total_supporters: u32 = 0;
            let next_id = self.next_id.read(user);
            let mut i: u256 = 0;
            
            while i < next_id {
                let service = self.services.read((user, i));
                total_supporters += service.supporter_count;
                i += 1;
            };
            
            total_supporters
        }

        fn get_service_supporters(
            self: @ContractState, 
            user: ContractAddress, 
            id: u256
        ) -> Array<ContractAddress> {
            let mut supporters_array = array![];
            let supporters_vec = self.supporters.entry((user, id));
            let len = supporters_vec.len();
            
            let mut i: u64 = 0;
            while i < len {
                supporters_array.append(supporters_vec.at(i).read());
                i += 1;
            };
            
            supporters_array
        }
    }
}
