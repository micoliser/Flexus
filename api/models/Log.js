import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const logSchema = new Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true,
    },
    entityType: {
      type: String,
      required: true,
      trim: true,
    },
    entityId: {
      type: String,
      required: false,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    actorUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    actorName: {
      type: String,
      required: false,
      trim: true,
    },
    actorEmail: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: ["success", "failure"],
      default: "success",
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

const Log = models.Log || model("Log", logSchema);

export default Log;
