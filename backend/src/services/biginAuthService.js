import axios from "axios";
import { env } from "../config/env.js";

let cachedToken = null;
let tokenExpiry = null;

/**
 * @desc    Get Zoho Bigin Access Token using Refresh Token (with memory caching)
 * @returns {Promise<string>} Access Token
 */
export const getBiginAccessToken = async () => {
  try {
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
      console.log("✅ Using cached Zoho Bigin access token");
      return cachedToken;
    }

    const params = new URLSearchParams({
      refresh_token: env.ZOHO_REFRESH_TOKEN,
      client_id: env.ZOHO_CLIENT_ID,
      client_secret: env.ZOHO_CLIENT_SECRET,
      grant_type: "refresh_token"
    });

    const response = await axios.post(
      "https://accounts.zoho.in/oauth/v2/token",
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    cachedToken = response.data.access_token;
    tokenExpiry = Date.now() + 55 * 60 * 1000; // Cache for 55 minutes

    return cachedToken;
  } catch (error) {
    console.error(
      "Bigin Token Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};
