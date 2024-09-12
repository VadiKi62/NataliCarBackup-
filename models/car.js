import { Schema, model, models } from "mongoose";

const CarSchema = new Schema({
  carNumber: {
    type: String,
    required: true,
    unique: true,
  },
  model: {
    type: String,
    required: true,
  },
  photoUrl: {
    type: String,
    required: false,
  },
  class: {
    type: String,
    enum: [
      "Economy",
      "Premium",
      "MiniBus",
      "Crossover",
      "Limousine",
      "Compact",
      "Convertible",
    ],
    required: true,
  },
  transmission: {
    type: String,
    enum: ["Automatic", "Manual"],
    required: true,
  },
  fueltype: {
    type: String,
  },
  color: {
    type: String,
  },
  numberOfDoors: {
    type: Number,
    min: 2,
    max: 6,
    required: true,
  },
  airConditioning: {
    type: Boolean,
    required: true,
  },
  enginePower: {
    type: Number,
    required: true,
  },
  pricingTiers: {
    type: Object,
    of: Number,
    required: true,
  },
  orders: [
    {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
});

CarSchema.methods.calculatePrice = function (days) {
  const tiers = Object.keys(this.pricingTiers)
    .map(Number)
    .sort((a, b) => b - a);

  for (let tier of tiers) {
    if (days <= tier) {
      return this.pricingTiers[tier];
    }
  }
  return this.pricingTiers[tiers[tiers.length - 1]];
};

const Car = models.Car || model("Car", CarSchema);

export { CarSchema, Car };
