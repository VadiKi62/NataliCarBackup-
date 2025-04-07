import { Schema, model, models } from "mongoose";
import { seasons } from "@utils/companyData";
import { CAR_CLASSES, TRANSMISSION_TYPES, FUEL_TYPES } from "./enums";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

const pricingTierSchema = new Schema({
  days: {
    type: Map,
    of: Number,
    required: true,
  },
});

const createEnumValidator = (enumObject) => ({
  values: Object.values(enumObject),
  message: `{VALUE} is not a valid option. Valid options are: ${Object.values(
    enumObject
  ).join(", ")}`,
  validate: {
    validator: function (v) {
      return Object.values(enumObject)
        .map((val) => val.toLowerCase())
        .includes(v.toLowerCase());
    },
    message: (props) => `${props.value} is not a valid option`,
  },
});

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
  },
  sort: {
    type: Number,
    default: 999,
  },
  class: {
    type: String,
    enum: createEnumValidator(CAR_CLASSES),
    required: true,
    set: (v) => v.toLowerCase(),
  },
  transmission: {
    type: String,
    enum: createEnumValidator(TRANSMISSION_TYPES),
    required: true,
    set: (v) => v.toLowerCase(),
  },
  fueltype: {
    type: String,
    enum: createEnumValidator(FUEL_TYPES),
    set: (v) => v.toLowerCase(),
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
    type: Map,
    of: pricingTierSchema,
    required: true,
  },
  orders: [
    {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
  dateAddCar: {
    type: Date,
  },
  dateLastModified: {
    type: Date,
  },
});

CarSchema.methods.getSeason = function (date) {
  const today = dayjs(date);
  const currentYear = today.year();

  for (const [season, range] of Object.entries(seasons)) {
    const startDate = dayjs(`${range.start}/${currentYear}`, "DD/MM/YYYY");
    const endDate = dayjs(`${range.end}/${currentYear}`, "DD/MM/YYYY");

    if (today.isBetween(startDate, endDate, null, "[]")) {
      return season;
    }
  }

  return "NoSeason"; // Default return if no season matches
};

// Method to calculate price based on days and current season
CarSchema.methods.calculatePrice = function (days, date = dayjs()) {
  console.log("1. Функция вызвана с параметрами:", { days, date });
  console.log("1a. Функция вызвана с параметрами:", { days });
  const season = this.getSeason(date);
  console.log("2. Определён сезон:", season);

  const pricingTiers = this.pricingTiers.get(season);
  console.log("3. Доступные тарифы:", Array.from(pricingTiers.days.keys()));

  // Группировка дней по заданным правилам
  let targetDays;
  if (days >= 1 && days <= 4) {
    targetDays = 4; // 1-4 дня → тариф за 4 дня
  } else if (days >= 5 && days <= 14) {
    targetDays = 7; // 5-14 дней → тариф за 7 дней
  } else {
    targetDays = 14; // 15+ дней → тариф за 14 дней
  }
  console.log("4. Выбран целевой тариф (targetDays):", targetDays);

  // Проверяем, существует ли такой тариф в pricingTiers
  if (!pricingTiers.days.has(targetDays.toString())) {
    // Если нет — ищем ближайший меньший доступный тариф
    const availableTiers = Array.from(pricingTiers.days.keys())
      .map(Number)
      .sort((a, b) => b - a); // Сортировка по убыванию

    const tiers = Array.from(pricingTiers.days.keys()).map(Number);

    for (let tier of availableTiers) {
      if (targetDays >= tier) {
        targetDays = tier;
        break;
      }
    }
    console.log("5. Используется ближайший меньший тариф:", targetDays);
  }

  const result = pricingTiers.days.get(targetDays.toString());
  console.log("6. Итоговая цена:", result);
  return result;
};

const Car = models.Car || model("Car", CarSchema);
export { CarSchema, Car };
