import userModels from "../models/user.models.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto"; // Required for generating random passwords

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
    user: process.env.EMAIL_USER || "kyle.glover85@ethereal.email", // Replace with environment variable for better security
    pass: process.env.EMAIL_PASS || "AFwsrJmbW9M1uGQCxZ", // Use environment variable
  },
});

// Generate a random password function
const generateRandomPassword = () => {
  return crypto.randomBytes(8).toString("hex"); // Generates an 8-byte hexadecimal password
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
    const info = await transporter.sendMail({
      from: '"Kyle Glover 👻" <kyle.glover85@ethereal.email>', // sender address
      to: email, // send to the user's email
      subject: "Welcome to the platform!",
      text: `Hi ${name}, welcome to our platform! Your password is: ${randomPassword}`, // Plain text body
      html: `<b>Hi ${name},</b><p>Welcome to our platform! Your password is: <strong>${randomPassword}</strong></p>`, // HTML body
    });

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

// Step 1: Login and check if password matches
export const logInUser = async (req, res) => {
  const { email, cnic, password } = req.body;

  // Validate required fields
  if (!email || !cnic || !password) {
    return res.status(400).json({ message: "All fields are required" });
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

    // Check if the user is using the temporary password
    const isTemporaryPassword = password === user.password;
    if (isTemporaryPassword) {
      // If the password is temporary, prompt the user to reset it
      return res.status(200).json({
        message: "Login successful. Please reset your password.",
        promptChangePassword: true,
        user,
      });
    }

    // If the password is valid and not temporary, generate access and refresh tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set refresh token as a cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "Login successful",
      user,
      accessToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Step 2: Change password after resetting
export const changePassword = async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  // Validate required fields
  if (!email || !currentPassword || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Find the user by email
    const user = await userModels.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify the current password
    const isPasswordValid = await bcryptjs.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash the new password
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    // Update the password in the database
    user.password = hashedPassword;
    await user.save();

    // Now that the password is reset, log the user in with the new password
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set refresh token as a cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "Password reset successfully and logged in",
      user,
      accessToken,
    });
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
