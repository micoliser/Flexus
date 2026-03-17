import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: false,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    image: {
      type: String,
      required: false,
      trim: true,
    },
    otherImages: {
      type: [String],
      required: false,
      default: [],
    },
    longDescription: {
      type: String,
      required: false,
      trim: true,
    },
    origin: {
      type: String,
      required: false,
      trim: true,
    },
    grade: {
      type: String,
      required: false,
      trim: true,
    },
    moisture: {
      type: String,
      required: false,
      trim: true,
    },
    minOrder: {
      type: String,
      required: false,
      trim: true,
    },
    packaging: {
      type: String,
      required: false,
      trim: true,
    },
    shelfLife: {
      type: String,
      required: false,
      trim: true,
    },
    certifications: {
      type: [String],
      required: false,
      default: [],
    },
    exportMarkets: {
      type: [String],
      required: false,
      default: [],
    },
    availability: {
      type: String,
      required: false,
      trim: true,
    },
    tags: {
      type: [String],
      required: false,
      default: [],
    },
    isFeatured: {
      type: Boolean,
      default: false,
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
