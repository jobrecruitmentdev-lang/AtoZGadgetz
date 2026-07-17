import dotenv from "dotenv";

dotenv.config();

if (!process.env.SECRET_KEY) {
  throw new Error("FATAL ERROR: SECRET_KEY is not defined in environment variables.");
}

export const config = {
  jwtSecret: process.env.SECRET_KEY,
};
