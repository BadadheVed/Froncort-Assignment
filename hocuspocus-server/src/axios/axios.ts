import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";
export const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
