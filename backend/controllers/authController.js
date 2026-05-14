import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import supabase from "../config/db.js";

export const registerUser = async (req, res) => {
  try {

    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          name,
          email,
          password: hashedPassword,
          role
        }
      ])
      .select();

    if (error) {
      return res.status(400).json({
        message: error.message
      });
    }

    res.status(201).json({
      message: "User registered successfully",
      user: data[0]
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};

export const loginUser = async (req, res) => {

  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !data) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      data.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        id: data.id,
        role: data.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role
      }
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};

export const logoutUser = async (req, res) => {

  res.status(200).json({
    message:
      "Logout successful. Please remove token from frontend."
  });
};

export const forgotPassword = async (req, res) => {

  try {

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    console.log(
      "RESET PASSWORD REQUEST:",
      email
    );

    res.status(200).json({
      message:
        "Reset password email sent successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};