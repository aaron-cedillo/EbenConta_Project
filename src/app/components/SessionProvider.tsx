"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { logoutUser } from "../services/authService"; 

interface SessionProviderProps {
  children: React.ReactNode;
}

const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const router = useRouter();

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        logoutUser();
        router.push("/login"); 
      }, 60 * 60 * 1000); // 1 hora de inactividad la app te lleva al login
    };

    document.addEventListener("mousemove", resetTimer);
    document.addEventListener("keydown", resetTimer);

    resetTimer();

    return () => {
      document.removeEventListener("mousemove", resetTimer);
      document.removeEventListener("keydown", resetTimer);
      clearTimeout(timeout);
    };
  }, [router]);

  return <>{children}</>;
};

export default SessionProvider;
