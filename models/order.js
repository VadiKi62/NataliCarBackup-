import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  timeIn: {
    type: Date,
    default: function () {
      if (this.rentalStartDate) {
        const time = new Date(this.rentalStartDate);
        time.setHours(0, 16, 0, 0);
        return time;
      }
      return null;
    },
  },
  timeOut: {
    type: Date,
    default: function () {
      if (this.rentalEndDate) {
        const time = new Date(this.rentalEndDate);
        time.setHours(0, 8, 0, 0);
        return time;
      }
      return null;
    },
  },
  placeIn: {
    type: String,
    default: "Nea Kallikratia",
  },
  placeOut: {
    type: String,
    default: "Nea Kallikratia",
  },
  customerName: {
    type: String,
    required: true,
  },
  carNumber: {
    type: String,
    required: true,
  },
  confirmed: {
    type: Boolean,
    default: false,
  },
  hasConflictDates: {
    type: Boolean,
    default: false,
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
  numberOfDays: {
    type: Number,
  },
  totalPrice: {
    type: Number,
  },
  carModel: {
    type: String,
    required: true,
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Car",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save middleware to calculate the number of days and total price
OrderSchema.pre("save", async function (next) {
  const rentalStart = new Date(this.rentalStartDate);
  const rentalEnd = new Date(this.rentalEndDate);

  // Calculate the number of days
  const timeDiff = rentalEnd.getTime() - rentalStart.getTime();
  const numberOfDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  this.numberOfDays = numberOfDays;

  // Fetch car details and calculate price based on the number of days
  const Car = mongoose.model("Car"); // Make sure the Car model is registered
  const car = await Car.findById(this.car);

  if (car) {
    this.carNumber = car.carNumber;
    this.carModel = car.model;

    // Calculate total price using the car's pricing tiers
    const pricePerDay = car.calculatePrice(numberOfDays);
    this.totalPrice = pricePerDay * numberOfDays;
  }

  next();
});

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

export { OrderSchema, Order };

// OrderSchema.pre("save", async function (next) {
//   if (
//     this.isModified("rentalStartDate") ||
//     this.isModified("rentalEndDate") ||
//     this.isModified("car")
//   ) {
//     const car = await this.model("Car").findById(this.car);
//     if (!car) {
//       return next(new Error("Car not found"));
//     }

//     const days = Math.ceil(
//       (this.rentalEndDate - this.rentalStartDate) / (1000 * 60 * 60 * 24)
//     );
//     this.pricePerDay = car.calculatePrice(days);
//     this.totalPrice = this.pricePerDay * days;
//   }
//   next();
// });

// const Order = models.Order || model("Order", OrderSchema);

// export { OrderSchema, Order };
