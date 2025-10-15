import mongoose, { type Document, Schema } from "mongoose";
import { ServiceType } from "../types/types";

interface IService extends Document {
  type: ServiceType;
  name: string;
  description: string;
  goal?: number;
  price?: number;
  image: string;
  createdBy: string;
}

const ServiceSchema = new Schema<IService>({
  type: {
    type: String,
    enum: ["donation", "business", "product"],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  goal: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    default: 0,
  },
  image: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
    ref: "User",
  },
});

const Service = mongoose.model<IService>("Service", ServiceSchema);
export default Service;
