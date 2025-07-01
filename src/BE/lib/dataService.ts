import { calculatePercentageChange } from "../utils";
import { DexToolResponse, ResponseObject, TokenDetails } from "./types";

/**
 * Safe fetch that ensures JSON parsing doesn't crash if the response is HTML or non-JSON.
 */
async function safeFetchJson(url: string, options: RequestInit): Promise<any> {
  try {
    const res = await fetch(url, options);

    if (!res.ok) {
      console.error(`[DEXTOOLS] HTTP ${res.status} error for ${url}`);
      return null;
    }

    // Try parsing JSON
    try {
      return await res.json();
    } catch (jsonError) {
      const text = await res.text();
      console.error(
        `[DEXTOOLS] Non-JSON response for ${url}:`,
        text.slice(0, 300)
      );
      return null;
    }
  } catch (fetchError) {
    console.error(`[DEXTOOLS] Fetch failed for ${url}:`, fetchError);
    return null;
  }
}

/**
 * Gets token details from DEXTOOLS.
 */
export const getTokenDetails_DEXTOOLS = async (
  token: string
): Promise<TokenDetails | null> => {
  console.log("DEXTOOLS lookup for:", token);

  const HEADERS = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    Referer: "https://www.dextools.io/",
    "Accept-Language": "en-US,en;q=0.9",
  };

  // === 1. Search endpoint
  const searchUrl = `https://www.dextools.io/shared/search/pair?query=${token}&strict=true`;
  const searchData = await safeFetchJson(searchUrl, {
    method: "GET",
    headers: HEADERS,
  });

  if (!searchData || (!searchData.data && !searchData.results)) {
    console.warn("[DEXTOOLS] No data from search. Aborting.");
    return null;
  }

  let data: DexToolResponse | undefined;
  if (searchData.data && searchData.data.length > 0) {
    data = searchData.data[0];
  } else if (searchData.results && searchData.results.length > 0) {
    data = searchData.results[0];
  }

  if (!data || !data.id?.token) {
    console.warn("[DEXTOOLS] No valid pair data found in search.");
    return null;
  }

  // === 2. Details endpoint fallback
  const detailsUrl = `https://www.dextools.io/shared/data/pair?address=${data.id.token}&chain=solana&audit=false&locks=true`;
  const detailsData = await safeFetchJson(detailsUrl, {
    method: "GET",
    headers: HEADERS,
  });

  if (!detailsData || (!detailsData.data && !detailsData.results)) {
    console.warn("[DEXTOOLS] No data from details endpoint. Aborting.");
    return null;
  }

  if (detailsData.data && detailsData.data.length > 0) {
    data = detailsData.data[0];
  } else if (detailsData.results && detailsData.results.length > 0) {
    data = detailsData.results[0];
  }

  if (!data) {
    console.error("[DEXTOOLS] Completely failed to get any pair data.");
    return null;
  }

  // === 3. Compute priceInSol
  let priceInSol = 0;
  try {
    priceInSol =
      (data.periodStats["1h"].price.chain.last * data.price) /
      data.periodStats["1h"].price.usd.last;
  } catch (err) {
    console.warn("[DEXTOOLS] Failed to compute priceInSol:", err);
  }

  // === 4. Build TokenDetails
  const result: TokenDetails = {
    name: data.name,
    symbol: data.symbol,
    address: data.id.token,
    priceUsd: data.price,
    priceNative: priceInSol,
    mc: data.price * Number(data.token.totalSupply || 0),
    liquidityInUsd: data.metrics?.liquidity || 0,
    telegramUrl: data.token.links?.telegram,
    twitterUrl: data.token.links?.twitter,
    websiteUrl: data.token.links?.website,
    volume: {
      m5: data.periodStats["5m"]?.volume?.buys || 0,
      h1: data.periodStats["1h"]?.volume?.buys || 0,
      h24: data.price24h?.buys || 0,
    },
    change: {
      m5: calculatePercentageChange(
        data.periodStats["5m"].price.usd.last,
        data.price
      ),
      h1: calculatePercentageChange(
        data.periodStats["1h"].price.usd.last,
        data.price
      ),
      h24: calculatePercentageChange(
        data.periodStats["24h"].price.usd.last,
        data.price
      ),
    },
  };

  return result;
};

export const getTokenDetails_DEXSCREENER = async (
  token: string
): Promise<TokenDetails | null> => {
  console.log("DEXSCREENER");
  console.log("token: ", token);
  const res = await fetch(
    `https://api.dexscreener.com/latest/dex/tokens/${token}`,
    {
      method: "GET",
    }
  );
  const data: ResponseObject = await res.json();

  try {
    // console.log("data.pairs: ", data.pairs);
    if (data.pairs) {
      let result: TokenDetails;

      result = {
        name: data.pairs[0].baseToken.name,
        symbol: data.pairs[0].baseToken.symbol,
        address: data.pairs[0].baseToken.address,
        priceUsd: Number(data.pairs[0].priceUsd),
        priceNative: Number(data.pairs[0].priceNative),
        mc: data.pairs[0].marketCap,
        liquidityInUsd: data.pairs[0].liquidity.base,
        telegramUrl:
          data.pairs[0]?.info?.socials.find((s) => s.type === "telegram")
            ?.url ?? "",
        twitterUrl:
          data.pairs[0]?.info?.socials.find((s) => s.type === "twitter")?.url ??
          "",
        websiteUrl: data.pairs[0]?.info?.websites[0]?.url ?? "",

        volume: {
          m5: data.pairs[0].volume.m5,
          h1: data.pairs[0].volume.h1,
          h24: data.pairs[0].volume.h24,
        },
        change: {
          m5: data.pairs[0].priceChange.m5,
          h1: data.pairs[0].priceChange.h1,
          h24: data.pairs[0].priceChange.h24,
        },
      };

      return result;
    }
  } catch (error) {
    console.log("error: ", error);
    return null;
  }
  return null;
};
export const getTokenDetailsByTicker_DEXTOOLS = async (ticker: string) => {
  const res = await fetch(
    `https://www.dextools.io/shared/search/pair?query=${ticker}&strict=true`,
    {
      headers: {
        accept: "application/json",
        "accept-language": "en-GB,en-NG;q=0.9,en-US;q=0.8,en;q=0.7",
        "content-type": "application/json",
        "if-none-match": 'W/"22487-MndiOCuZTGpLaZU8TEPF9EPubY8"',
        priority: "u=1, i",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        cookie:
          "_pk_id.1.b299=7c727f644b8e74ac.1727104557.; _pk_id.5.b299=c7057c46d727efc0.1727104557.; _pk_ref.1.b299=%5B%22%22%2C%22%22%2C1728648326%2C%22https%3A%2F%2Fsolscan.io%2F%22%5D; _pk_ses.1.b299=1; _pk_ref.5.b299=%5B%22%22%2C%22%22%2C1728648326%2C%22https%3A%2F%2Fsolscan.io%2F%22%5D; _pk_ses.5.b299=1; cf_clearance=lolx83Z1.WPd9THxPwvMRTiDzpHU.hE_xL0R04pJvhM-1728649171-1.2.1.1-N0XqVLHO7e8P_wGHUbJztqi6S8z.ykwPbCQEG.9pBLlKfM3EqNnevc1oJHgEjnKyN3MvThVlw.fUv_eZHIBX0I.JMyCL0d_C3kR20aeEswy5gC25gQqd.4XfZwbpsIn2ge_Kls7xsEjDmtdQ7JfoSrwoRyMIr6N5I37QQB5bHzqeiIjUDjXOSdFijf5XAeIDq55jTLmkrOjF1FW_RGGZjrz_bYI5LHMqYOpvZ_judm0veDJxoP4EuMs.zFzIrDCXLCdBaQiefMWiFTu6D60jBU.byJQYG.DeGvYXvxFVtaIrg8.q1t9JF8fj2Gp_I0TTiSkZgd5EwTysbCaZ95jPkIZQXCjtiZkvM2bGHFZRC66X7R8dlZrc1gNLV65LzhCno0yC8LCJwHJSEuXp8YgDy.hFip8sp8.2IwhAGpvZJE0; __cf_bm=JfZj8ezdfNcZkmBldwL6PIWhRJcMY6Zsp_wHjp2ZR1w-1728649181-1.0.1.1-7CWWM1dTHm0v8.YK.mgA.JvY6D5WVvMzwNjYIjM_xWL9xBA1dvyBPGEvdbaRlJXT1Q35JQADSKCT0ei1Rq7qeg",
        Referer:
          "https://www.dextools.io/app/en/solana/pair-explorer/ATpAEZhkBJvDES8BhQy4zQEaVuZHbw2FWrmwixEQpump?t=1728649171680",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: null,
      method: "GET",
    }
  );
  let data: DexToolResponse;
  const _data = await res.json();

  // console.log("_data.data: ", _data.results);
  if (_data.data) {
    data = _data.data.filter(
      (d: DexToolResponse) => d.id.chain.toLowerCase() === "solana"
    )[0];
  } else if (_data.results) {
    data = _data.results.filter(
      (d: DexToolResponse) => d.id.chain.toLowerCase() === "solana"
    )[0];
  } else {
    return null;
  }
  let result: TokenDetails;

  const priceInSol =
    (data.periodStats["1h"].price.chain.last * data.price) /
    data.periodStats["1h"].price.usd.last;

  result = {
    name: data.name,
    symbol: data.symbol,
    address: data.id.token,
    priceUsd: data.price,
    priceNative: priceInSol,
    mc: data.price * Number(data.token.totalSupply),
    liquidityInUsd: data.metrics.liquidity,
    telegramUrl: data.token.links.telegram,
    twitterUrl: data.token.links.twitter,
    websiteUrl: data.token.links.website,
    volume: {
      m5: data.periodStats["5m"].volume?.buys,
      h1: data.periodStats["1h"].volume?.buys,
      h24: data.price24h ? data.price24h?.buys : 0,
    },
    change: {
      m5: calculatePercentageChange(
        data.periodStats["5m"].price.usd.last,
        data.price
      ),
      h1: calculatePercentageChange(
        data.periodStats["1h"].price.usd.last,
        data.price
      ),
      h24: calculatePercentageChange(
        data.periodStats["24h"].price.usd.last,
        data.price
      ),
    },
  };

  return result;
};
