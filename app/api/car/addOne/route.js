import { NextResponse } from "next/server";
import { Car } from "@models/car";
import { connectToDB } from "@utils/database";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import fs from "fs/promises";
import path from "path";

dayjs.extend(isBetween);

export async function POST(req) {
  await connectToDB();

  try {
    const formData = await req.formData();

    // Extract file and carData
    const file = formData.get("image");

    console.log("Received file:", file);
    const carData = {
      carNumber: formData.get("carNumber"),
      model: formData.get("model"),
      class: formData.get("class"),
      transmission: formData.get("transmission"),
      seats: formData.get("seats"),
      numberOfDoors: formData.get("numberOfDoors"),
      airConditioning: formData.get("airConditioning"),
      enginePower: formData.get("enginePower"),
      pricingTiers: JSON.parse(formData.get("pricingTiers")),
    };

    console.log("checking fomrdata", [...formData.entries()]);

    const allowedMimeTypes = ["image/jpeg", "image/png"];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid file type. Only JPEG and PNG are allowed",
        },
        { status: 400 }
      );
    }

    try {
      const pricingTiersString = formData.get("pricingTiers");
      console.log("Received pricingTiers:", pricingTiersString); // Debug log

      if (pricingTiersString) {
        carData.pricingTiers = JSON.parse(pricingTiersString);
      } else {
        // Set default pricing tiers if none provided
        carData.pricingTiers = {
          NoSeason: { days: {} },
          LowSeason: { days: {} },
          LowUpSeason: { days: {} },
          MiddleSeason: { days: {} },
          HighSeason: { days: {} },
        };
      }
    } catch (error) {
      console.error("Error parsing pricingTiers:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Invalid pricing tiers format",
          details: error.message,
        },
        { status: 400 }
      );
    }

    // Validate required fields
    const requiredFields = [
      "carNumber",
      "model",
      "class",
      "transmission",
      "seats",
      "numberOfDoors",
      "airConditioning",
      "enginePower",
      "pricingTiers",
    ];
    for (const field of requiredFields) {
      if (!carData[field]) {
        return NextResponse.json(
          { success: false, message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate enum fields
    const enumFields = {
      class: [
        "Economy",
        "Premium",
        "MiniBus",
        "Crossover",
        "Limousine",
        "Compact",
        "Convertible",
      ],
      transmission: ["Automatic", "Manual"],
      fueltype: [
        "Diesel",
        "Petrol",
        "Natural Gas",
        "Hybrid Diesel",
        "Hybrid Petrol",
      ],
    };

    for (const [field, allowedValues] of Object.entries(enumFields)) {
      if (carData[field] && !allowedValues.includes(carData[field])) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid value for ${field}. Allowed values are: ${allowedValues.join(
              ", "
            )}`,
          },
          { status: 400 }
        );
      }
    }

    // Validate number ranges
    if (carData.numberOfDoors < 2 || carData.numberOfDoors > 6) {
      return NextResponse.json(
        { success: false, message: "Number of doors must be between 2 and 6" },
        { status: 400 }
      );
    }

    // Validate pricingTiers
    const seasons = [
      "NoSeason",
      "LowSeason",
      "LowUpSeason",
      "MiddleSeason",
      "HighSeason",
    ];

    for (const season of seasons) {
      if (
        !carData.pricingTiers[season] ||
        !carData.pricingTiers[season].days ||
        Object.keys(carData.pricingTiers[season].days).length === 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message: `Missing pricing information for ${season}`,
          },
          { status: 400 }
        );
      }
    }

    // Process image file upload if file is provided
    let imagePath = null;
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadsDir = path.join(process.cwd(), "public", "images");
      await fs.mkdir(uploadsDir, { recursive: true });

      const uniqueFilename = await generateUniqueFilename(
        uploadsDir,
        file.name
      );
      const filePath = path.join(uploadsDir, uniqueFilename);

      await fs.writeFile(filePath, buffer);
      console.log("uniqueFilename", uniqueFilename);
      console.log("filePath", filePath);
      console.log("uploadsDir:", uploadsDir);

      imagePath = `/images/${uniqueFilename}`; // Store the image path
    }

    // Add image path to carData if image was uploaded
    if (imagePath) {
      carData.photoUrl = imagePath;
    }

    // Create new car
    const newCar = new Car(carData);

    await newCar.save();

    return NextResponse.json(
      {
        success: true,
        message: `Машина ${newCar.carNumber} добавлена`,
        data: newCar,
        status: 200,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding car:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "A car with this car number already exists",
          status: 409,
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Failed to add car", error: error.message },
      { status: 500 }
    );
  }
}

async function generateUniqueFilename(basePath, originalFilename) {
  const ext = path.extname(originalFilename);
  const nameWithoutExt = path.basename(originalFilename, ext);
  let filename = originalFilename;
  let counter = 1;

  while (
    await fs
      .access(path.join(basePath, filename))
      .then(() => true)
      .catch(() => false)
  ) {
    filename = `${nameWithoutExt}_${counter}${ext}`;
    counter++;
  }

  return filename;
}
