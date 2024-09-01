import { Schema, model, models } from "mongoose";


const OrderSchema = new Schema({
  customerName: {
    type: String,
    required: true
  },
  rentalStartDate: {
    type: Date,
    required: true
  },
  rentalEndDate: {
    type: Date,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  }
});

const CarSchema = new Schema({
  carNumber: {
    type: String,
    required: true,
    unique: true
  },
  model: {
    type: String,
    required: true
  },
  photoUrl: {
    type: String,
    required: false
  },
  class: {
    type: String,
    enum: ['Economy', 'Premium', 'MiniBus'],
    required: true
  },
  transmission: {
    type: String,
    enum: ['Automatic', 'Manual'],
    required: true
  },
  numberOfDoors: {
    type: Number,
    min: 2,
    max: 6,
    required: true
  },
  airConditioning: {
    type: Boolean,
    required: true
  },
  enginePower: {
    type: Number,
    required: true
  },
  pricePerDay: {
    type: Number,
    required: true
  },
  orders: [OrderSchema]
});

const Car = models.Car || model("Car", CarSchema);

export { CarSchema, Car };
