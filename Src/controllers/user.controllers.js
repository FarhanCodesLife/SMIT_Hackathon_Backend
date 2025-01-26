import userModels from "../models/user.models.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";  // Required for generating random passwords

// Helper functions for token generation
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.SECRET_KEY,
    { expiresIn: "1d" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.SECRET_KEY,
    { expiresIn: "7d" }
  );
};

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // Use true for 465 port, otherwise false
  auth: {
    user: "jettie.douglas@ethereal.email", // Replace with environment variable for better security
    pass:  "PrzSkyZdqPtzPBVEaX", // Use environment variable
  },
});
// process.env.EMAIL_USER || 
// process.env.EMAIL_PASS ||
// Generate a random password function
const generateRandomPassword = () => {
  return crypto.randomBytes(8).toString("hex"); // Generates an 8-byte hexadecimal password
};

// Send Email function
const sendEmail = async (email, name, randomPassword) => {
  return transporter.sendMail({
    from: '"Your Name" <your-email@example.com>',
    to: email, // The recipient email from the user request
    subject: "Welcome to the platform!",
    text: `Hello ${name}, your password is: ${randomPassword}`,
    html: `<b>Hello ${name}, your password is: ${randomPassword}</b>`,
  });
};

// Create user function
export const createUser = async (req, res) => {
  const { name, email, cnic } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  if (!cnic) {
    return res.status(400).json({ message: "CNIC is required" });
  }

  try {
    // Check if the user already exists
    const existingUser = await userModels.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate a random password for the user
    const randomPassword = generateRandomPassword();

    // Hash the password
    const hashPassword = await bcryptjs.hash(randomPassword, 10);

    // Create new user
    const user = await userModels.create({
      name,
      email,
      password: hashPassword,
      cnic,
    });

    // Send email with the random password
    const info = await sendEmail(email, name, randomPassword);

    console.log("Message sent: %s", info.messageId);

    res.status(201).json({
      emailSent: true,
      emailId: info.messageId,
      message: "User created successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset password function
export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ message: "new password are required" });
  }

  try {
    // Find the user by email
    const user = await userModels.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the new password
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    // Update the user's password with the new hashed password
    user.password = hashedPassword;
    await user.save();

    // Send a response to the user
    res.status(200).json({
      message: "Password reset successfully. You can now log in with the new password.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Log in user function
export const logInUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Find the user by email
    const user = await userModels.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify password
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set refresh token as a cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ message: "Login successful", user, accessToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Refresh token function
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = jwt.verify(refreshToken, process.env.SECRET_KEY);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Generate new tokens
    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Update refresh token cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Token refreshed successfully", accessToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Logout function
export const logoutUser = async (req, res) => {
  try {
    // Clear the refresh token cookie with matching options
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure only in production
      sameSite: "strict",
    });
    res.json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users function
export const getAllUsers = async (req, res) => {
  try {
    const users = await userModels.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
