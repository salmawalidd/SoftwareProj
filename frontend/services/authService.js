import axios from "axios";

const API_URL = "http://192.168.1.25:8000/api/auth";

export const loginUser = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, {
    email,
    password,
  });

  return response.data;
};

export const registerUser = async (name, email, password, role) => {
  const response = await axios.post(`${API_URL}/register`, {
    name,
    email,
    password,
    role,
  });

  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await axios.post(`${API_URL}/forgot-password`, {
    email,
  });

  return response.data;
};