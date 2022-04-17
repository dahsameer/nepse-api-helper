import { Prove } from "./prove";
import { BASE_URL } from "./constants";
import { SecurityBrief } from "./securityBrief";
import { SecurityDetail, SecurityDetailResponse } from "./securityDetail";
import { MarketStatus } from "./marketStatus";

let securityBriefList: SecurityBrief[] = [];

function decode1(saltNum: number, data: number[]): number {
  return data[((Math.floor(saltNum / 10) % 10) + (saltNum - (Math.floor(saltNum / 10) * 10)) + (Math.floor(saltNum / 100) % 10))] + 22;
}

function decode2(saltNum: number, data: number[]): number {
  const index: number = (((Math.floor(saltNum / 10) % 10) + (Math.floor(saltNum / 100) % 10)) + (saltNum - (Math.floor(saltNum / 10) * 10)))
  return data[index] + (Math.floor(saltNum / 10) % 10) + (Math.floor(saltNum / 100) % 10) + 22;
}

function GetValidToken(proveObj: Prove): string {
  const dataArr: number[] = [9, 8, 4, 1, 2, 3, 2, 5, 8, 7, 9, 8, 0, 3, 1, 2, 2, 4, 3, 0, 1, 9, 5, 4, 6, 3, 7, 2, 1, 6, 9, 8, 4, 1, 2, 2, 3, 3, 4, 4];
  const num1: number = decode1(proveObj.salt2, dataArr);
  const num2: number = decode2(proveObj.salt2, dataArr);
  //const num3: number = decode1(proveObj.salt1, dataArr);
  //const num4: number = decode2(proveObj.salt1, dataArr);

  return proveObj.accessToken.slice(0, num1) + proveObj.accessToken.slice(num1 + 1, num2) + proveObj.accessToken.slice(num2 + 1);
  //return proveObj.refreshToken.slice(0, num3) + proveObj.refreshToken.slice(num3 + 1, num4) + proveObj.refreshToken.slice(num4 + 1);
}

async function GetAccessToken(): Promise<string | null> {
  const proveResponse: Prove | null = await fetch(`${BASE_URL}/authenticate/prove`)
    .then(response => {
      return response.json() as Promise<Prove>;
    })
    .then((data: Prove) => data)
    .catch(err => {
      console.error(err)
      return null;
    });

  if (proveResponse !== null) {

    return GetValidToken(proveResponse);
  }
  return null;
}

async function GetMarketStatus(): Promise<MarketStatus | null> {
  const token = await GetAccessToken();
  return await fetch(`${BASE_URL}/nots/nepse-data/market-open`, {
    headers: {
      authorization: `Salter ${token}`,
    },
    body: null,
    method: "GET",
    credentials: "include"
  })
    .then(resp => resp.json() as Promise<MarketStatus>)
    .then((data: MarketStatus) => data)
    .catch(err => {
      console.error(err);
      return null;
    });
}

async function GetSecurityBriefs(): Promise<SecurityBrief[]> {
  const token = await GetAccessToken();
  const securityBriefDetails = await fetch(`${BASE_URL}/nots/security?nonDelisted=false`, {
    headers: {
      authorization: `Salter ${token}`
    },
    body: null,
    method: 'GET'
  })
    .then(response => response.json() as Promise<SecurityBrief[]>)
    .then((data: SecurityBrief[]) => data)
    .catch(err => {
      console.error(err)
      return [] as SecurityBrief[];
    });
  return securityBriefDetails;
}

async function UpdateSecurityBriefs() {
  securityBriefList = await GetSecurityBriefs();
}

async function GetSecurityDetail(symbol: string): Promise<SecurityDetail | null> {
  const security = securityBriefList.find(s => s.symbol.toLowerCase() === symbol.toLowerCase());
  if (!security) {
    return null;
  }
  const marketStatus = await GetMarketStatus();
  const token = await GetAccessToken();
  const securityDetail: SecurityDetail | null = await fetch(`${BASE_URL}/nots/security/${security.id}`, {
    headers: {
      authorization: `Salter ${token}`,
      "content-type": "application/json",
    },
    body: `{"id": ${marketStatus?.id}}`,
    method: "POST",
  })
    .then(resp => resp.json() as Promise<SecurityDetailResponse>)
    .then((sec: SecurityDetailResponse) => {
      let securityDetail: SecurityDetail = {
        id: sec.security.id,
        activeStatus: sec.security.activeStatus,
        businessDate: sec.securityDailyTradeDto.businessDate,
        closePrice: sec.securityDailyTradeDto.closePrice,
        fiftyTwoWeekHigh: sec.securityDailyTradeDto.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: sec.securityDailyTradeDto.fiftyTwoWeekLow,
        lastTradePrice: sec.securityDailyTradeDto.lastTradedPrice,
        listingDate: sec.security.listingDate,
        name: sec.security.securityName,
        symbol: sec.security.symbol
      };
      return securityDetail;
    })
    .catch(err => {
      console.error(err);
      return null;
    });
  return securityDetail;
}

export {
  UpdateSecurityBriefs,
  GetSecurityDetail,
  GetSecurityBriefs,
  GetMarketStatus
}