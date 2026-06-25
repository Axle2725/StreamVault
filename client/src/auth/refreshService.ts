import axios from "axios";
import { tokenService } from "./tokenService";

let refreshInterval: number;

export const refreshAccessToken = async () => {
  const response = await axios.post(
    "/api/auth/refresh",
    {},
    {
      withCredentials: true,
    },
  );

  return response.data;
};

export const startTokenRefresh = () => {
  refreshInterval = window.setInterval(
    async () => {
      try {
        const response = await refreshAccessToken();

        tokenService.setToken(response.accessToken);
      } catch (error) {
        console.error("Refresh failed");
      }
    },
    14 * 60 * 1000, // 14 mins
  );
};

export const stopTokenRefresh = () => {
  clearInterval(refreshInterval);
};
