export type ServiceType = "donation" | "business" | "product";

export interface IUser {
  address: string;
  avatar: string;
  nickname: string;
}

export interface IService {
  type: ServiceType;
  name: string;
  description: string;
  goal?: number;
  price?: number;
  image: string;
  createdBy: string;
}

export interface IMessageData {
  sender_address: string;
  receiver_address: string;
  service_id?: number;
  message: string;
  subject?: string;
}
