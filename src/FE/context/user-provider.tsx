"use client";

import { useWithdrawStore } from "@/stores/useWithdrawStore";
import { UserData } from "@/types/telegram";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface startData {
  address: string;
  balance: number;
  solUsdBalance: number;
  simulationBalance: number;
  simulationUsd: number;
  solUsdPrice: number;
  explorerUrl: string;
}

export interface UserPositionSummary {
  tokenAddress: string;
  tokenTicker: string;
  amountHeld: number;
  currentPriceUsd: number;
  currentPriceSol: number;
  tokenMC?: number;
  tokenSymbol: string;
  tokenLiquidity: number;
  PNL_usd: number;
  PNL_sol: number;
  PNL_Sol_percent: number;
}

interface ProfitSummary {
  telegramId: string;
  profit: string;
  usdValue: string;
  referralCountDirect: number;
  referralCountIndirect: number;
}

export interface referralProps {
  userId: number;
  referralLink: string;
  profitSummary: ProfitSummary;
}

interface actualReferral {
  status: boolean;
  data: referralProps;
}

type ContentType = {
  userData: startData | undefined;
  isSimulation: boolean;
  handleSetSimulation: () => void;
  positions: UserPositionSummary[];
  pageLoading: boolean;
  referralInfo: actualReferral | undefined;
  realPositions: UserPositionSummary[];
  telegramData: UserData | null;
};

const userDataDetails = createContext<ContentType | null>(null);

const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const { successfull } = useWithdrawStore();
  const [userData, setUserData] = useState<startData>();
  const [telegramData, setTelegramData] = useState<UserData | null>(null);
  const [isSimulation, setSimulation] = useState<boolean>(false);
  const [positions, setPositions] = useState<UserPositionSummary[]>([]);
  const [realPositions, setRealPositions] = useState<UserPositionSummary[]>([]);
  const [referralInfo, setReferralInfo] = useState<actualReferral>();
  const [pageLoading, setPageLoading] = useState<boolean>(false);

  useEffect(() => {
    import("@twa-dev/sdk").then((WebApp) => {
      const user = WebApp.default.initDataUnsafe?.user;
      if (user) {
        setTelegramData(user as UserData);
      }
    });
  }, []);

  useEffect(() => {
    const getReferralDetails = async () => {
      if (!telegramData?.id) return;

      const res = await fetch(
        `/api/telegram/referral?telegramId=${telegramData.id}`
      );
      const data = await res.json();
      setReferralInfo(data);
    };

    getReferralDetails();
  }, [telegramData?.id]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!telegramData?.id) return;

      setPageLoading(true);

      const res = await fetch("/api/telegram/start-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          telegramId: `${telegramData.id}`,
        }),
      });

      const data = await res.json();
      setUserData(data);
      setPageLoading(false);
    };

    fetchUserInfo();
  }, [telegramData?.id, successfull]);

  useEffect(() => {
    const fetchSimulationPositionsInfo = async () => {
      if (!telegramData?.id) return;

      try {
        const res = await fetch(
          `/api/telegram/simulation/positions?telegramId=${telegramData.id}`
        );
        const rawResponse = await res.text();
        const data = JSON.parse(rawResponse);

        if (data.positions && data.positions.length > 0) {
          setPositions(data.positions);
        }
      } catch (error) {
        console.error("Error fetching simulation positions:", error);
      }
    };

    fetchSimulationPositionsInfo();
  }, [telegramData?.id]);

  useEffect(() => {
    const fetchPositionsInfo = async () => {
      if (!telegramData?.id) return;

      try {
        const res = await fetch(
          `/api/telegram/positions?telegramId=${telegramData.id}`
        );
        const rawResponse = await res.text();
        const data = JSON.parse(rawResponse);
        setRealPositions(data);
      } catch (error) {
        console.error("Error fetching real positions:", error);
      }
    };

    fetchPositionsInfo();
  }, [telegramData?.id]);

  const handleSetSimulation = useCallback(
    () => setSimulation((prev) => !prev),
    []
  );

  const value = {
    userData,
    isSimulation,
    handleSetSimulation,
    positions,
    pageLoading,
    referralInfo,
    realPositions,
    telegramData,
  };

  return (
    <userDataDetails.Provider value={value}>
      {children}
    </userDataDetails.Provider>
  );
};

const useUserData = () => {
  const context = useContext(userDataDetails);
  if (!context) {
    throw new Error("useUserData must be used within a UserDataProvider");
  }
  return context;
};

export { useUserData };
export default UserDataProvider;
