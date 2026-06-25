import { AuthContextHook } from "./AuthProvider";

export const useAuth = () => {
  return AuthContextHook();
};
