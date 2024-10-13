import { Schema, model, models } from "mongoose";

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

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
  sort: {
    type: Number,
    default: 999,
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
    enum: ["Disel", "Petrol", "Natural Gas"],
  },
  seats: {
    type: Number,
    default: 5,
    required: true,
  },
  registration: {
    type: Number,
    default: 2016,
  },
  regNumber: {
    type: String,
    default: "NKT 123",
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
  engine: {
    type: String,
    default: "1.500",
  },
  pricingTiers: {
    type: Object,
    of: {
      days: {
        type: Object, // Each season will have an object mapping days to price
        required: true,
      },
    },
    required: true,
  },
  orders: [
    {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
});

// Helper function to determine the season based on the date using dayjs
CarSchema.methods.getSeason = function (date) {
  const year = dayjs(date).year();

  const noSeason = {
    start: dayjs(`${year}-10-01`),
    end: dayjs(`${year + 1}-05-24`),
  };
  const lowSeason = {
    start: dayjs(`${year}-05-25`),
    end: dayjs(`${year}-06-30`),
  };
  const lowUpSeason = {
    start: dayjs(`${year}-09-01`),
    end: dayjs(`${year}-09-30`),
  };
  const middleSeason = {
    start: dayjs(`${year}-07-01`),
    end: dayjs(`${year}-07-31`),
  };
  const highSeason = {
    start: dayjs(`${year}-08-01`),
    end: dayjs(`${year}-08-31`),
  };

  // Use dayjs.isBetween to determine the season
  if (dayjs(date).isBetween(highSeason.start, highSeason.end, null, "[]")) {
    return "HighSeason";
  }
  if (dayjs(date).isBetween(middleSeason.start, middleSeason.end, null, "[]")) {
    return "MiddleSeason";
  }
  if (dayjs(date).isBetween(lowUpSeason.start, lowUpSeason.end, null, "[]")) {
    return "LowUpSeason";
  }
  if (dayjs(date).isBetween(lowSeason.start, lowSeason.end, null, "[]")) {
    return "LowSeason";
  }
  return "NoSeason";
};

// Method to calculate price based on days and current season
CarSchema.methods.calculatePrice = function (days, date = dayjs()) {
  const season = this.getSeason(date); // Determine the current season
  const tiers = Object.keys(this.pricingTiers[season].days)
    .map(Number)
    .sort((a, b) => b - a);

  for (let tier of tiers) {
    if (days <= tier) {
      return this.pricingTiers[season].days[tier];
    }
  }
  // Return the price for the highest tier if no match found
  return this.pricingTiers[season].days[tiers[tiers.length - 1]];
};

const Car = models.Car || model("Car", CarSchema);

export { CarSchema, Car };
