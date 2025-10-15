import mongoose, { type Document, Schema } from "mongoose";

interface IConversation extends Document {
  participants: [string, string]; // Sorted array of two addresses
  service_id: number | null; // Campaign ID for per-campaign conversations
  messages: Array<{
    sender_address: string;
    receiver_address: string;
    message: string;
    subject?: string; // Subject for contextual information
    createdAt: Date;
    updatedAt: Date;
    isRead: boolean;
    service_id?: number; // Optional, for campaign-related messages
  }>;
  lastMessageAt: Date;
}

const ConversationSchema: Schema = new Schema(
  {
    participants: {
      type: [String],
      required: true,
      validate: {
        validator: function (arr: string[]) {
          return arr.length === 2 && arr[0] < arr[1]; // Ensure sorted and unique
        },
        message:
          "Participants must be exactly two unique addresses, sorted alphabetically.",
      },
    },
    service_id: { type: Number, default: null }, // Campaign ID for per-campaign conversations
    messages: [
      {
        sender_address: { type: String, required: true },
        receiver_address: { type: String, required: true },
        message: { type: String, required: true, maxlength: 1000 },
        subject: { type: String }, // Subject for contextual information
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
        isRead: { type: Boolean, required: true, default: false },
        service_id: { type: Number }, // Optional, for campaign-related messages
      },
    ],
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Message = mongoose.model<IConversation>(
  "Conversation",
  ConversationSchema
);

export default Message;
