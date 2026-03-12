import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    longDescription: {
      type: String,
      required: false,
      trim: true,
    },
    origin: {
      type: String,
      required: true,
      trim: true,
    },
    grade: {
      type: String,
      required: true,
      trim: true,
    },
    moisture: {
      type: String,
      required: false,
      trim: true,
    },
    minOrder: {
      type: String,
      required: true,
      trim: true,
    },
    packaging: {
      type: String,
      required: true,
      trim: true,
    },
    shelfLife: {
      type: String,
      required: true,
      trim: true,
    },
    certifications: {
      type: [String],
      required: false,
      default: [],
    },
    exportMarkets: {
      type: [String],
      required: true,
      default: [],
    },
    availability: {
      type: String,
      required: true,
      trim: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Product = models.Product || model("Product", productSchema);

export default Product;
