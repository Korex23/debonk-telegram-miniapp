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
  amountHeldSol: number;
  amountHeld: number;
  currentPriceUsd: number;
  currentPriceSol: number;
  tokenMC?: number;
  tokenSymbol: string;
  tokenLiquidity: number;
  PNL_usd: number;
  PNL_sol: number;
  PNL_Sol_percent: number;
  token5MChange: number | string;
  tokenh1Change: number | string;
  tokenh24Change: number | string;
  twitterUrl: string;
  telegramUrl: string;
  websiteUrl: string;
  volume24h: number;
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
  fetchSimulationPositionsInfo: (telegramId: string) => Promise<void>;
  fetchPositionsInfo: (telegramId: string) => Promise<void>;
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

  const fetchSimulationPositionsInfo = async (telegramId: string) => {
    const telegramUId = telegramData?.id || telegramId;
    if (!telegramUId) return;

    try {
      const res = await fetch(
        `/api/telegram/simulation/positions?telegramId=${telegramUId}`
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

  const fetchPositionsInfo = async (telegramId: string) => {
    const telegramUId = telegramData?.id || telegramId;
    // if (!telegramUId) return;

    try {
      const res = await fetch(
        `/api/telegram/positions?telegramId=${telegramId}`
      );
      const rawResponse = await res.text();
      const data = JSON.parse(rawResponse);
      setRealPositions(data);
      console.log(data);
    } catch (error) {
      console.error("Error fetching real positions:", error);
    }
  };

  useEffect(() => {
    fetchPositionsInfo("7023048964");
  }, [telegramData?.id]);

  useEffect(() => {
    if (telegramData?.id)
      fetchSimulationPositionsInfo(telegramData.id.toString());
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
    fetchPositionsInfo,
    fetchSimulationPositionsInfo,
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
