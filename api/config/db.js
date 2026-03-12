import mongoose from "mongoose";
import toJSONPlugin from "../utils/toJSON.plugin.js";

// Apply to every schema defined after this line
mongoose.plugin(toJSONPlugin);

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not defined in the environment variables");
  }

  const connection = await mongoose.connect(mongoUri);

  console.log(`MongoDB connected: ${connection.connection.host}`);

  return connection;
};

export default mongoose;
