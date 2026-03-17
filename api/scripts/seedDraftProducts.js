import dotenv from "dotenv";
import mongoose from "mongoose";
import toJSONPlugin from "../utils/toJSON.plugin.js";

dotenv.config();
mongoose.plugin(toJSONPlugin);

const { default: Product } = await import("../models/Product.js");

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error("MONGODB_URI is not defined in .env");
  process.exit(1);
}

const draftProducts = [
  {
    name: "Cashew Nuts",
    description: "Premium cashew nuts with excellent flavor and texture.",
    longDescription:
      "Our export-grade cashew nuts are carefully selected, naturally dried, and packed to preserve freshness and crunch. Ideal for snack brands, food processors, and wholesale buyers.",
    origin: "Kogi, Nigeria",
    grade: "W320",
    moisture: "Max 5%",
    minOrder: "10 MT",
    packaging: "Vacuum packs in 25kg cartons",
    shelfLife: "12 months",
    certifications: ["Phytosanitary", "Fumigation", "Quality Inspection"],
    exportMarkets: ["UAE", "India", "Netherlands"],
    availability: "Year-round",
  },
  {
    name: "Cocoa Beans",
    description: "Rich cocoa beans for chocolate production.",
    longDescription:
      "Fermented and sun-dried cocoa beans with consistent flavor profile and low impurity levels. Sourced from trusted farming communities and prepared for international buyers.",
    origin: "Ondo, Nigeria",
    grade: "Export Standard",
    moisture: "Max 7.5%",
    minOrder: "18 MT",
    packaging: "Jute bags, 64kg",
    shelfLife: "18 months",
    certifications: ["Phytosanitary", "Moisture Test Report", "SGS on Request"],
    exportMarkets: ["Belgium", "Germany", "Malaysia"],
    availability: "Main crop and mid crop",
  },
  {
    name: "Corn",
    description: "Quality corn sourced from trusted farmers, ideal for any use",
    longDescription:
      "Yellow maize processed to export standards for feed mills and food manufacturers. Cleaned, graded, and bagged with strict quality checks.",
    origin: "Kaduna, Nigeria",
    grade: "Yellow Maize Grade A",
    moisture: "Max 13%",
    minOrder: "20 MT",
    packaging: "PP bags, 50kg",
    shelfLife: "9 months",
    certifications: ["Phytosanitary", "Aflatoxin Test Report"],
    exportMarkets: ["Ghana", "Senegal", "Turkey"],
    availability: "Seasonal with contract supply",
  },
  {
    name: "Tumeric",
    description:
      "Bright yellow turmeric with strong flavor and aroma, perfect for culinary and medicinal use.",
    longDescription:
      "Premium dried turmeric fingers with deep color intensity and strong aroma. Suitable for spice processors, extractors, and wholesale distribution.",
    origin: "Nasarawa, Nigeria",
    grade: "Polished Dried Fingers",
    moisture: "Max 10%",
    minOrder: "8 MT",
    packaging: "PP bags, 25kg",
    shelfLife: "18 months",
    certifications: ["Phytosanitary", "Quality Inspection"],
    exportMarkets: ["India", "UAE", "UK"],
    availability: "Year-round",
  },
  {
    name: "Coconut",
    description:
      "Fresh coconuts with sweet water and creamy meat,for cooking and beverages.",
    longDescription:
      "Fresh mature coconuts selected for export with uniform size and quality. Great for food processing, retail distribution, and coconut water production.",
    origin: "Lagos, Nigeria",
    grade: "Mature Whole Nuts",
    moisture: "Naturally preserved",
    minOrder: "1 x 40ft container",
    packaging: "Mesh sacks / bulk container load",
    shelfLife: "45-60 days",
    certifications: ["Phytosanitary", "Fumigation"],
    exportMarkets: ["Qatar", "Saudi Arabia", "Kuwait"],
    availability: "Year-round",
  },
  {
    name: "Sheanut",
    description:
      "Sheanut with high oil content, really good for skincare products.",
    longDescription:
      "High-oil shea nuts sourced from premium collection zones, suitable for cosmetic and food-grade processing. Cleaned and dried to maintain quality.",
    origin: "Niger, Nigeria",
    grade: "Premium Export",
    moisture: "Max 8%",
    minOrder: "12 MT",
    packaging: "Jute bags, 80kg",
    shelfLife: "12 months",
    certifications: ["Phytosanitary", "Quality Inspection"],
    exportMarkets: ["France", "USA", "China"],
    availability: "Seasonal",
  },
  {
    name: "Ginger",
    description:
      "Fresh ginger with a spicy kick and aromatic flavor, ideal for cooking and health remedies.",
    longDescription:
      "Fresh and dried ginger options available for exporters and manufacturers. Strong pungency, bright skin, and uniform roots from verified suppliers.",
    origin: "Kaduna, Nigeria",
    grade: "Fresh Split / Dried",
    moisture: "Max 12% (dried)",
    minOrder: "14 MT",
    packaging: "Mesh bags / cartons",
    shelfLife: "Fresh: 30 days, Dried: 12 months",
    certifications: ["Phytosanitary", "Residue Test on Request"],
    exportMarkets: ["Morocco", "Netherlands", "UAE"],
    availability: "Year-round",
  },
  {
    name: "Bitter Kola",
    description:
      "Bitter kola with a distinct bitter taste and potential health benefits, commonly used in traditional medicine.",
    longDescription:
      "Carefully sorted bitter kola nuts with consistent quality and freshness. Suitable for herbal markets, specialty stores, and export distributors.",
    origin: "Cross River, Nigeria",
    grade: "Sorted Whole Nuts",
    moisture: "Controlled for freshness",
    minOrder: "5 MT",
    packaging: "Ventilated sacks / cartons",
    shelfLife: "6 months",
    certifications: ["Phytosanitary", "Fumigation"],
    exportMarkets: ["UK", "Canada", "South Africa"],
    availability: "Year-round",
  },
];

const toDraftPayload = (item) => ({
  name: item.name,
  description: item.description,
  longDescription: item.longDescription,
  origin: item.origin,
  grade: item.grade,
  moisture: item.moisture,
  minOrder: item.minOrder,
  packaging: item.packaging,
  shelfLife: item.shelfLife,
  certifications: item.certifications,
  exportMarkets: item.exportMarkets,
  availability: item.availability,
  image: "",
  otherImages: [],
  isPublished: false,
  isFeatured: false,
  tags: [],
});

console.log("Connecting to MongoDB...");
await mongoose.connect(mongoUri);
console.log("Connected.");

try {
  let created = 0;
  let updated = 0;

  for (const product of draftProducts) {
    const payload = toDraftPayload(product);

    const result = await Product.updateOne(
      { name: payload.name },
      { $set: payload },
      { upsert: true },
    );

    if (result.upsertedCount > 0) {
      created += 1;
    } else {
      updated += 1;
    }
  }

  console.log(
    `Draft products seeded. Created: ${created}, Updated: ${updated}`,
  );
} finally {
  await mongoose.disconnect();
  console.log("Done.");
}
