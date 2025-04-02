"use client";

import { useEffect, useState } from "react";
import { UserData } from "@/types/telegram";

export default function Home() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isClient, setIsClient] = useState(false); // Ensures no SSR mismatch

  useEffect(() => {
    setIsClient(true); // Mark component as mounted

    import("@twa-dev/sdk").then((WebApp) => {
      const user = WebApp.default.initDataUnsafe?.user;
      if (user) {
        setUserData(user as UserData);
      }
    });
  }, []);

  if (!isClient) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    ); // Avoids mismatches
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Debonk Telegram Bot</h1>
      {userData ? (
        <div>
          <p className="text-lg">
            Welcome, {userData.first_name} {userData.last_name}
          </p>
          <p className="text-sm text-gray-500">@{userData.username}</p>
          <p className="text-sm text-gray-500">ID: {userData.id}</p>
          <p className="text-sm text-gray-500">
            Lang: {userData.language_code}
          </p>
          <p className="text-sm text-gray-500">
            Premium: {userData.is_premium ? "Yes" : "No"}
          </p>
        </div>
      ) : (
        <p className="text-lg">User data not found</p>
      )}
    </div>
  );
}
