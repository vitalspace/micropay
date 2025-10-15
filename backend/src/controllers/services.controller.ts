import { Context } from "elysia";
import Service from "../models/services.model";
import User from "../models/user.model";
import { IService } from "../types/types";

export const createService = async (ctx: Context) => {
  try {
    const { type, name, description, goal, price, image, createdBy } =
      ctx.body as IService;

    if (!type || !name || !description || !image || !createdBy) {
      ctx.set.status = 400;
      return { message: "Missing required fields" };
    }

    if (!["donation", "business", "product"].includes(type)) {
      ctx.set.status = 400;
      return { message: "Invalid service type" };
    }

    const user = await User.findOne({ address: createdBy });

    if (!user) {
      ctx.set.status = 404;
      return { message: "User not found" };
    }

    const service = new Service({
      type,
      name,
      description,
      goal,
      price,
      image,
      createdBy: user._id,
    });

    await service.save();

    ctx.set.status = 201;
    return { message: "Service created successfully", service };
  } catch (error) {
    ctx.set.status = 500;
    return { message: "internal server error" };
  }
};
