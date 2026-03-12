import dotenv from "dotenv";
import mongoose from "mongoose";
import toJSONPlugin from "../utils/toJSON.plugin.js";

dotenv.config();

mongoose.plugin(toJSONPlugin);

// Import User model after plugin is applied
const { default: User } = await import("../models/User.js");

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error("MONGODB_URI is not defined in .env");
  process.exit(1);
}

console.log("Connecting to MongoDB...");
await mongoose.connect(mongoUri);
console.log("Connected.");

console.log("Dropping database...");
await mongoose.connection.dropDatabase();
console.log("Database dropped.");

console.log("Creating admin user...");
const admin = await User.create({
  firstName: "Test",
  lastName: "User",
  emailAddress: "testuser1@gmail.com",
  password: "testuser1pwd",
  isStaff: true,
  isAdmin: true,
});

console.log(`Admin user created: ${admin.emailAddress}`);

await mongoose.disconnect();
console.log("Done. Database reset complete.");
