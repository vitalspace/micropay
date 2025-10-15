import mongoose, { type Document, mongo, Schema } from "mongoose";

interface IUser extends Document {
  address: string;
  avatar: string;
  nickname: string;
  bio?: string;
}

const UserSchema = new Schema<IUser>({
  address: {
    type: String,
    required: true,
    unique: true,
  },
  avatar: {
    type: String,
    default: "",
  },
  nickname: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
    default: "",
  },
});

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
