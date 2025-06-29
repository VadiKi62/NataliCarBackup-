// app/api/send-email/route.js
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS,
  },
});

transporter.verify(function (error, success) {
  if (error) {
    console.error("Email server error:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, emailCompany, title, message } = body;

    if (!email || !emailCompany || !title || !message) {
      return NextResponse.json(
        { error: "Missing email data." },
        { status: 400 }
      );
    }

    const mailOptions = {
      from: `"Diana Lux Car Rentals" <${process.env.GMAIL_USER}>`,
      to: [email, emailCompany],
      subject: title,
      text: message,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent:", info.response);

    return NextResponse.json(
      { status: "Email sent", messageId: info.messageId },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending email:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
