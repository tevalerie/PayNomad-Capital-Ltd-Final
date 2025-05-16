const axios = require("axios");
const nodemailer = require("nodemailer");

exports.handler = async (event, context) => {
  // Set CORS headers for preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  try {
    const data = JSON.parse(event.body);
    const {
      firstName,
      lastName,
      email,
      referralCode,
      otp,
      resend = false,
    } = data;

    // If this is a resend request, we only need email and OTP
    if (resend) {
      if (!email || !otp) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "Email and OTP are required for resend.",
          }),
        };
      }
    } else {
      // Validate required fields for new registration
      if (!firstName || !lastName || !email || !referralCode || !otp) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "All fields are required." }),
        };
      }
    }

    // For demo purposes, we'll just send the OTP via email
    // In production, you would store this in a database

    // Create a transporter using ZOHO SMTP
    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.ZOHO_SMTP_USERNAME,
        pass: process.env.ZOHO_SMTP_PASSWORD,
      },
    });

    // Send email with OTP
    const mailOptions = {
      from: process.env.ZOHO_SMTP_USERNAME,
      to: email,
      subject: resend
        ? "Your New Verification Code - PayNomad Capital"
        : "Welcome to PayNomad Capital - Verify Your Email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="background-color: #2c3e50; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
            <h1 style="color: white; margin: 0;">PayNomad Capital</h1>
          </div>
          <div style="padding: 20px;">
            <h2 style="color: #2c3e50;">Email Verification</h2>
            <p>Hello ${firstName || "there"},</p>
            <p>${resend ? "You requested a new verification code. Here is your new code:" : "Thank you for registering with PayNomad Capital. To verify your email address, please use the following code:"}</p>
            <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
              ${otp}
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you did not request this verification, please ignore this email.</p>
          </div>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 0 0 5px 5px;">
            <p style="margin: 0; color: #666;">© ${new Date().getFullYear()} PayNomad Capital Ltd. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: resend
          ? "New verification code sent successfully."
          : "Registration successful. Verification email sent.",
        email: email,
      }),
    };
  } catch (error) {
    console.error("Error processing registration:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error processing your request.",
        error: error.message,
      }),
    };
  }
};
