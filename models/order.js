import { Schema, model, models } from "mongoose";
import { Car } from "./car";

const OrderSchema = new Schema({
  customerName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  rentalStartDate: {
    type: Date,
    required: true,
  },
  rentalEndDate: {
    type: Date,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  car: {
    type: Schema.Types.ObjectId,
    ref: "Car",
    required: true,
  },
});

OrderSchema.pre("save", async function (next) {
  if (
    this.isModified("rentalStartDate") ||
    this.isModified("rentalEndDate") ||
    this.isModified("car")
  ) {
    const car = await this.model("Car").findById(this.car);
    if (!car) {
      return next(new Error("Car not found"));
    }

    const days = Math.ceil(
      (this.rentalEndDate - this.rentalStartDate) / (1000 * 60 * 60 * 24)
    );
    this.pricePerDay = car.calculatePrice(days);
    this.totalPrice = this.pricePerDay * days;
  }
  next();
});

const Order = models.Order || model("Order", OrderSchema);

export { OrderSchema, Order };
