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
      const res = await fetch(
        `/api/telegram/referral?telegramId=${telegramData?.id}`
      );
      const data = await res.json();

      setReferralInfo(data);
      console.log(data);

      console.log(referralInfo);
    };

    getReferralDetails();
  }, [referralInfo, telegramData?.id]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      setPageLoading(true);
      const res = await fetch("/api/telegram/start-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          telegramId: `${telegramData?.id}`,
        }),
      });

      const data = await res.json();

      setUserData(data);
      console.log(data);
      setPageLoading(false);
    };

    fetchUserInfo();
  }, [successfull, telegramData?.id]);

  useEffect(() => {
    const fetchSimulationPositionsInfo = async () => {
      try {
        const res = await fetch(
          `/api/telegram/simulation/positions?telegramId=${telegramData?.id}`
        );

        // Log the raw response text
        const rawResponse = await res.text();
        console.log("Raw response:", rawResponse);

        const data = JSON.parse(rawResponse);
        console.log("Parsed data:", data);

        if (data.positions && data.positions.length > 0) {
          setPositions(data.positions);
          console.log(data.positions);
        } else {
          console.warn("No positions found in response");
        }
      } catch (error) {
        console.error("Error fetching positions:", error);
      }
    };

    fetchSimulationPositionsInfo();
  }, [telegramData?.id]);
  useEffect(() => {
    const fetchPositionsInfo = async () => {
      try {
        const res = await fetch(
          `/api/telegram/positions?telegramId=${telegramData?.id}`
        );

        // Log the raw response text
        const rawResponse = await res.text();
        console.log("Raw response:", rawResponse);

        const data = JSON.parse(rawResponse);
        console.log("Parsed data:", data);
        setRealPositions(data);
      } catch (error) {
        console.error("Error fetching positions:", error);
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
    throw new Error("useUserWallet must be used within a UserWalletProvider");
  }

  return context;
};

export { useUserData };
export default UserDataProvider;
