import axios from "axios";
import { logger } from "./logger.js";

export const sendOtpSms = async (mobile: string, otp: string) => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (!sid || !token || !from) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMS provider is not configured");
    }
    logger.warn("Twilio not configured. OTP SMS not delivered in non-production.");
    return;
  }

  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  const body = new URLSearchParams({
    From: from,
    To: mobile,
    Body: `Your AtoZ Gadgetz OTP is ${otp}. It expires in 10 minutes.`,
  });

  await axios.post(endpoint, body.toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    auth: {
      username: sid,
      password: token,
    },
  });
};
