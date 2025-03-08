import { Prove } from "./prove";
import { BASE_URL } from "./constants";
import { SecurityBrief } from "./securityBrief";
import { SecurityDetail, SecurityDetailResponse } from "./securityDetail";
import { MarketStatus } from "./marketStatus";

let security_brief_cache: SecurityBrief[] = [];

let wasm_instantiated = false;
let cdx: CallableFunction;
let rdx: CallableFunction;
let bdx: CallableFunction;
let ndx: CallableFunction;
let mdx: CallableFunction;

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

async function instantiate_nepse_helper() {
	const response = await fetch(`${BASE_URL}/assets/prod/css.wasm`);
	const buffer = await response.arrayBuffer();
	const wasm = await WebAssembly.instantiate(buffer);
	wasm_instantiated = true;
	cdx = wasm.instance.exports.cdx as CallableFunction;
	rdx = wasm.instance.exports.rdx as CallableFunction;
	bdx = wasm.instance.exports.bdx as CallableFunction;
	ndx = wasm.instance.exports.ndx as CallableFunction;
	mdx = wasm.instance.exports.mdx as CallableFunction;
	security_brief_cache = await get_security_briefs();
}

function get_valid_token(proveObj: Prove): string {
	if (!wasm_instantiated) {
		throw "library not instantiated. please call instantiate method before doing anything";
	}

	return proveObj.accessToken.slice(0, cdx(proveObj.salt1, proveObj.salt2, proveObj.salt3, proveObj.salt4, proveObj.salt5)) +
		proveObj.accessToken.slice(cdx(proveObj.salt1, proveObj.salt2, proveObj.salt3, proveObj.salt4, proveObj.salt5) + 1, rdx(proveObj.salt1, proveObj.salt2, proveObj.salt4, proveObj.salt3, proveObj.salt5)) +
		proveObj.accessToken.slice(rdx(proveObj.salt1, proveObj.salt2, proveObj.salt4, proveObj.salt3, proveObj.salt5) + 1, bdx(proveObj.salt1, proveObj.salt2, proveObj.salt4, proveObj.salt3, proveObj.salt5)) +
		proveObj.accessToken.slice(bdx(proveObj.salt1, proveObj.salt2, proveObj.salt4, proveObj.salt3, proveObj.salt5) + 1, ndx(proveObj.salt1, proveObj.salt2, proveObj.salt4, proveObj.salt3, proveObj.salt5)) +
		proveObj.accessToken.slice(ndx(proveObj.salt1, proveObj.salt2, proveObj.salt4, proveObj.salt3, proveObj.salt5) + 1, mdx(proveObj.salt1, proveObj.salt2, proveObj.salt4, proveObj.salt3, proveObj.salt5)) +
		proveObj.accessToken.slice(mdx(proveObj.salt1, proveObj.salt2, proveObj.salt4, proveObj.salt3, proveObj.salt5) + 1);

}

async function get_raw_access_object(): Promise<Prove | null> {
	const proveResponse: Prove | null = await fetch(`${BASE_URL}/api/authenticate/prove`, {
		headers: {
			"User-Agent": "Mozilla/5.0",
			"Referer": `${BASE_URL}`
		},
		method: "GET"
	})
		.then(response => {
			return response.json() as Promise<Prove>;
		})
		.then((data: Prove) => data)
		.catch(err => {
			console.error(err)
			return null;
		});
	return proveResponse;
}

async function get_access_token(): Promise<string | null> {
	const now = Date.now();

	// Return cached token if it's still valid
	if (cachedToken && now < tokenExpiry) {
		return cachedToken;
	}

	// Fetch new token
	const proveResponse: Prove | null = await get_raw_access_object();
	if (proveResponse !== null) {
		cachedToken = get_valid_token(proveResponse);
		tokenExpiry = now + 5 * 60 * 1000; // Set expiry time to 5 minutes from now
		return cachedToken;
	}

	return null;
}

async function get_market_status(): Promise<MarketStatus | null> {
	const token = await get_access_token();
	return await fetch(`${BASE_URL}/api/nots/nepse-data/market-open`, {
		headers: {
			"User-Agent": "Mozilla/5.0",
			"Accept": "application/json, text/plain, */*",
			"Accept-Encoding": "gzip, deflate, br",
			"Accept-Language": "en-US,en;q=0.9",
			"Connection": "keep-alive",
			"Referer": `${BASE_URL}/`,
			"Authorization": `Salter ${token}`,
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

async function get_security_briefs(): Promise<SecurityBrief[]> {
	const token = await get_access_token();
	const securityBriefDetails = await fetch(`${BASE_URL}/api/nots/security?nonDelisted=false`, {
		headers: {
			"User-Agent": "Mozilla/5.0",
			"Referer": `${BASE_URL}`,
			"Authorization": `Salter ${token}`,
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

function get_valid_body_id(marketId: number) {
	const dummyData = [147, 117, 239, 143, 157, 312, 161, 612, 512, 804, 411, 527, 170, 511, 421, 667, 764, 621, 301, 106, 133, 793, 411, 511, 312, 423, 344, 346, 653, 758, 342, 222, 236, 811, 711, 611, 122, 447, 128, 199, 183, 135, 489, 703, 800, 745, 152, 863, 134, 211, 142, 564, 375, 793, 212, 153, 138, 153, 648, 611, 151, 649, 318, 143, 117, 756, 119, 141, 717, 113, 112, 146, 162, 660, 693, 261, 362, 354, 251, 641, 157, 178, 631, 192, 734, 445, 192, 883, 187, 122, 591, 731, 852, 384, 565, 596, 451, 772, 624, 691];
	const currentDate = new Date();
	const datePart = currentDate.getDate();
	const id = dummyData[marketId] + marketId + 2 * datePart;
	return id;
}

async function get_security_detail(symbol: string): Promise<SecurityDetail | null> {
	const token = await get_access_token();
	const security = security_brief_cache.find(s => s.symbol.toLowerCase() === symbol.toLowerCase());
	if (!security) {
		return null;
	}
	const marketStatus = await get_market_status();
	const bodyId = get_valid_body_id(marketStatus?.id ?? 0);
	const securityDetail: SecurityDetail | null = await fetch(`${BASE_URL}/api/nots/security/${security.id}`, {
		headers: {
			"User-Agent": "Mozilla/5.0",
			"Accept": "application/json, text/plain, */*",
			"Referer": `${BASE_URL}/company/detail/${security.id}`,
			"Authorization": `Salter ${token}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ id: bodyId }),
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
	get_security_detail,
	get_security_briefs,
	get_market_status,
	get_access_token,
	get_raw_access_object,
	get_valid_token,
	instantiate_nepse_helper,
	security_brief_cache
}