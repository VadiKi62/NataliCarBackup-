import { Schema, model, models } from "mongoose";
import { Car } from "./car";

const orderItemSchema = new Schema({
  orderNumber: { type: Number, required: true },
  image: { type: String },
  title: { type: String, required: true },
  price: { type: String },
  category: { type: String, required: true },
  subCategory: { type: String, default: null },
  ingredients: { type: String },
  weight: { type: String, default: null },
  per: { type: String, default: null },
  isActive: { type: Boolean, default: true },
});

const itemsSchema = new Schema({
  langKey: { type: String },
  items: [orderItemSchema],
});

const OrderSchema = new Schema({
  order: [itemsSchema],
  restId: { type: Schema.Types.ObjectId, ref: "Car", required: true },
});

const order = models.order || model("order", OrderSchema);

export { OrderSchema, order };
