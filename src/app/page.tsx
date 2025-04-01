"use client";

import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";

interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code: string;
  is_premium?: boolean;
}

export default function Home() {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const user = WebApp.initDataUnsafe?.user;

    if (user) {
      setUserData(user as UserData);
    }
  }, []);

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-4xl font-bold mb-4">Debonk Telegram Bot</h1>
        {userData ? (
          <div>
            <p className="text-lg">
              Welcome, {userData.first_name} {userData.last_name}
            </p>
            <p className="text-sm text-gray-500">{userData.username}</p>
            <p className="text-sm text-gray-500">{userData.id}</p>
            <p className="text-sm text-gray-500">{userData.language_code}</p>
            <p className="text-sm text-gray-500">
              {userData.is_premium ? "Yes" : "No"}
            </p>
          </div>
        ) : (
          <p className="text-lg">Loading user data...</p>
        )}
      </div>
    </>
  );
}
