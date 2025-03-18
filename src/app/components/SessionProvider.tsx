"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { logoutUser, getUser } from "../services/authService";

interface SessionProviderProps {
  children: React.ReactNode;
}

const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const router = useRouter();

  useEffect(() => {
    if (window.location.pathname === "/login") return;

    let timeout: NodeJS.Timeout;
    let renewInterval: NodeJS.Timeout | null = null;

    const renewToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        logoutUser();
        router.push("/login");
        return;
      }

      try {
        const response = await axios.post(
          "http://localhost:3001/api/users/renew-token",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
        }
      } catch (error) {
        console.error("Error al renovar token:", error);
        logoutUser();
        router.push("/login");
      }
    };

    const checkTokenExpiration = async () => {
      const user = getUser();
      if (!user) {
        logoutUser();
        router.push("/login");
        return;
      }

      const tokenExp = user.exp * 1000;
      const now = Date.now();
      const remainingTime = tokenExp - now;

      if (remainingTime <= 5 * 60 * 1000) {
        renewToken();
      }
    };

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        logoutUser();
        router.push("/login");
      }, 60 * 60 * 1000);
    };

    document.addEventListener("mousemove", resetTimer);
    document.addEventListener("keydown", resetTimer);

    resetTimer();
    checkTokenExpiration();
    renewInterval = setInterval(renewToken, 55 * 60 * 1000);

    return () => {
      document.removeEventListener("mousemove", resetTimer);
      document.removeEventListener("keydown", resetTimer);
      clearTimeout(timeout);
      if (renewInterval) clearInterval(renewInterval);
    };
  }, [router]);

  return <>{children}</>;
};

export default SessionProvider;
