import axios from "../api/axiosInstance";

import { useAuth } from "../auth/useAuth";

export default function LogoutButton() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await axios.post("/auth/logout");

    logout();
  };

  return <button onClick={handleLogout}>Logout</button>;
}
