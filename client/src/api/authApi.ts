import axios from "./axiosInstance";

export const loginUser = (email: string, password: string) => {
  return axios.post("/auth/login", {
    email,
    password,
  });
};

export const registerUser = (
  username: string,
  email: string,
  password: string,
) => {
  return axios.post("/auth/register", {
    username,
    email,
    password,
  });
};

export const loginAsGuest = () => {
  return axios.post("/auth/guest");
};
