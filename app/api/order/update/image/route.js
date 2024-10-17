import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("image");
    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "images");
    await fs.mkdir(uploadsDir, { recursive: true });

    const uniqueFilename = await generateUniqueFilename(uploadsDir, file.name);
    const filePath = path.join(uploadsDir, uniqueFilename);

    await fs.writeFile(filePath, buffer);
    console.log("uniqueFilename", uniqueFilename);
    console.log("filePath", filePath);

    return NextResponse.json({
      success: true,
      data: uniqueFilename,
      message:
        file.name !== uniqueFilename
          ? "File renamed to avoid overwriting"
          : "File uploaded successfully",
    });
  } catch (e) {
    console.error("Error in image upload:", e);
    return NextResponse.json(
      { success: false, message: e.message },
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
