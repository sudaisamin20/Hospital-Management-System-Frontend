import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loadUser } from "../features/auth/authSlice";
import { type User } from "../features/auth/authTypes";

export const useLoadUser = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("authToken");

    if (savedUser && savedToken) {
      try {
        const user: User = JSON.parse(savedUser);
        // Add token back to user object
        user.token = savedToken;
        dispatch(loadUser(user));
      } catch (error) {
        console.error("Failed to load user from localStorage:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
      }
    }
  }, [dispatch]);
};
