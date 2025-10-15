import { Context } from "elysia";
import Message from "../models/message.model";
import User from "../models/user.model";
import { IMessageData } from "../types/types";

export const createMessage = async (ctx: Context) => {
  try {
    const { sender_address, receiver_address, service_id, message, subject } =
      ctx.body as IMessageData;

    if (!sender_address || !receiver_address || !message) {
      ctx.set.status = 400;
      return { message: "Missing required field" };
    }

    if (message.length > 256) {
      ctx.set.status = 400;
      return { message: "Message too long (max 256 characters)" };
    }

    const sender = await User.findOne({ address: sender_address });
    if (!sender) {
      ctx.set.status = 404;
      return { message: "Sender not found" };
    }

    const receiver = await User.findOne({ address: receiver_address });
    if (!receiver) {
      ctx.set.status = 404;
      return { message: "Receiver not found" };
    }

    if (sender_address === receiver_address) {
      ctx.set.status = 400;
      return { message: "Cannot send message to yourself" };
    }

    const participants = [sender_address, receiver_address].sort();

    let conversation = await Message.findOne({
      participants,
      service_id,
    });

    if (!conversation) {
      conversation = new Message({
        participants,
        messages: [],
        service_id,
        lastMessageAt: new Date(),
      });
    }

    const newMessage = {
      sender_address,
      receiver_address,
      message,
      subject,
      createdAt: new Date(),
      updatedAt: new Date(),
      isRead: false,
      service_id,
    };

    conversation.messages.push(newMessage);
    conversation.lastMessageAt = new Date();

    await conversation.save();

    ctx.set.status = 201;
    return { message: "Message sent successfully", data: newMessage };
  } catch (error) {
    ctx.set.status = 500;
    return { message: "Internal server error", error };
  }
};

export const getUserMessages = async (ctx: Context) => {
  try {
    const { address } = ctx.query as { address: string };
    const { page = 1, limit = 10 } = ctx.query as {
      address: string;
      page?: string;
      limit?: string;
    };

    if (!address) {
      ctx.set.status = 400;
      return { message: "User address is required" };
    }

    const pageNum = typeof page === "string" ? parseInt(page, 10) : page;
    const limitNum = typeof limit === "string" ? parseInt(limit, 10) : limit;

    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      ctx.set.status = 400;
      return { message: "Invalid pagination parameters" };
    }

    const skip = (pageNum - 1) * limitNum;

    // Get all conversations where the user is a participant
    const conversations = await Message.find({
      participants: address,
    }).sort({ lastMessageAt: -1 });

    // Flatten all messages from conversations
    let allMessages: any[] = [];
    conversations.forEach((conv) => {
      allMessages.push(
        ...conv.messages.map((msg) => ({
          _id: (msg as any)._id,
          sender_address: msg.sender_address,
          receiver_address: msg.receiver_address,
          message: msg.message,
          subject: msg.subject,
          createdAt: msg.createdAt,
          updatedAt: msg.updatedAt || msg.createdAt,
          isRead: msg.isRead,
          campaign_id: msg.service_id,
        }))
      );
    });

    // Sort by createdAt descending
    allMessages.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const total = allMessages.length;
    const messages = allMessages.slice(skip, skip + limitNum);

    const totalPages = Math.ceil(total / limitNum);
    const hasNext = pageNum < totalPages;
    const hasPrev = pageNum > 1;

    return {
      messages,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: total,
        itemsPerPage: limitNum,
        hasNext,
        hasPrev,
      },
    };
  } catch (error) {
    ctx.set.status = 500;
    return { message: "Internal server error", error };
  }
};

export const getConversation = async (ctx: Context) => {
  try {
    const { userAddress, otherAddress } = ctx.params as {
      userAddress: string;
      otherAddress: string;
    };
    const {
      page = 1,
      limit = 20,
      campaign_id,
    } = ctx.query as {
      page?: string;
      limit?: string;
      campaign_id?: string;
    };

    if (!userAddress || !otherAddress) {
      ctx.set.status = 400;
      return { message: "Both user addresses are required" };
    }

    const pageNum = typeof page === "string" ? parseInt(page, 10) : page;
    const limitNum = typeof limit === "string" ? parseInt(limit, 10) : limit;

    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      ctx.set.status = 400;
      return { message: "Invalid pagination parameters" };
    }

    const participants = [userAddress, otherAddress].sort();
    const campaignIdNum = campaign_id ? parseInt(campaign_id, 10) : null;

    // Find the conversation (per campaign)
    const conversation = await Message.findOne({
      participants,
      service_id: campaignIdNum,
    });

    if (!conversation) {
      return {
        messages: [],
        pagination: {
          currentPage: pageNum,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: limitNum,
          hasNext: false,
          hasPrev: false,
        },
      };
    }

    // Paginate messages (they are in chronological order)
    const total = conversation.messages.length;
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedMessages = conversation.messages
      .slice(startIndex, endIndex)
      .map((msg) => ({
        _id: (msg as any)._id,
        sender_address: msg.sender_address,
        receiver_address: msg.receiver_address,
        message: msg.message,
        subject: msg.subject,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt || msg.createdAt,
        isRead: msg.isRead,
        campaign_id: msg.service_id,
      })); // Keep chronological order

    // Mark messages as read (messages received by current user)
    const messagesToMarkRead = conversation.messages.filter(
      (msg) => msg.sender_address === otherAddress && !msg.isRead
    );

    if (messagesToMarkRead.length > 0) {
      // Update in memory
      conversation.messages.forEach((msg) => {
        if (msg.sender_address === otherAddress && !msg.isRead) {
          msg.isRead = true;
        }
      });
      await conversation.save();
    }

    const totalPages = Math.ceil(total / limitNum);
    const hasNext = pageNum < totalPages;
    const hasPrev = pageNum > 1;

    return {
      messages: paginatedMessages,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: total,
        itemsPerPage: limitNum,
        hasNext,
        hasPrev,
      },
    };
  } catch (error) {
    ctx.set.status = 500;
    return { message: "Internal server error", error };
  }
};
