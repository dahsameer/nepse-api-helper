import { getAccessToken } from "./auth";
import { getCacheItem, setCacheItem } from "./cache";
import { BASE_URL, SECURITY_BRIEF_TTL_MS } from "./constants";
import { createNepseError } from "./errors";
import { createHeaders, fetchWithRetry } from "./http";
import { ClientState, IndexDetail, MarketStatus, NepseError, SecurityBrief, SecurityDetail, SecurityDetailResponse } from "./types";

export function calculateValidBodyId(marketId: number): number {
	const dummyData = [147, 117, 239, 143, 157, 312, 161, 612, 512, 804, 411, 527, 170, 511, 421, 667, 764, 621, 301, 106, 133, 793, 411, 511, 312, 423, 344, 346, 653, 758, 342, 222, 236, 811, 711, 611, 122, 447, 128, 199, 183, 135, 489, 703, 800, 745, 152, 863, 134, 211, 142, 564, 375, 793, 212, 153, 138, 153, 648, 611, 151, 649, 318, 143, 117, 756, 119, 141, 717, 113, 112, 146, 162, 660, 693, 261, 362, 354, 251, 641, 157, 178, 631, 192, 734, 445, 192, 883, 187, 122, 591, 731, 852, 384, 565, 596, 451, 772, 624, 691];
	const datePart = getNepalDatePart();
	return dummyData[marketId] + marketId + 2 * datePart;
}

function getNepalDatePart() {
	const nepalTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Kathmandu" });
	const nepalDate = new Date(nepalTime);
	return nepalDate.getDate();
}

export async function fetchMarketStatus(state: ClientState): Promise<[ClientState, MarketStatus]> {
	try {
		const [newState, token] = await getAccessToken(state);
		const response = await fetchWithRetry(
			`${BASE_URL}/api/nots/nepse-data/market-open`,
			{
				method: "GET",
				headers: createHeaders(token)
			}
		);
		if (response.status !== 200) {
			if (state.logger) state.logger.error(`Failed to get market status: ${response.status} ${response.statusText}`);
			throw createNepseError(
				`Failed to get market status: ${response.status} ${response.statusText}`,
				'MARKET_STATUS_ERROR'
			);
		}
		const marketStatus = response.data as MarketStatus;
		return [newState, marketStatus];
	} catch (error) {
		if (state.logger) state.logger.error('Failed to get market status', error);
		if ((error as NepseError).code) {
			throw error;
		}
		throw createNepseError(
			'Failed to get market status',
			'MARKET_STATUS_ERROR',
			error
		);
	}
}

export async function fetchSecurityBriefs(state: ClientState): Promise<[ClientState, SecurityBrief[]]> {
	// Check cache first
	const cachedBriefs = getCacheItem(state.caches.securityBriefs, 'all');
	if (cachedBriefs) {
		if (state.logger) state.logger.info('Returning cached security briefs');
		return [state, cachedBriefs];
	}
	// Fetch fresh data
	try {
		const [newState, token] = await getAccessToken(state);
		const response = await fetchWithRetry(
			`${BASE_URL}/api/nots/security?nonDelisted=false`,
			{
				method: "GET",
				headers: createHeaders(token)
			}
		);
		if (response.status !== 200) {
			if (state.logger) state.logger.error(`Failed to get security briefs: ${response.status} ${response.statusText}`);
			throw createNepseError(
				`Failed to get security briefs: ${response.status} ${response.statusText}`,
				'SECURITY_BRIEFS_ERROR'
			);
		}
		const securities = response.data;
		if (!Array.isArray(securities)) {
			if (state.logger) state.logger.error('Security briefs response was not an array', securities);
			throw createNepseError('Security briefs response was not an array', 'SECURITY_BRIEFS_ERROR', securities);
		}
		// Update cache in state
		const updatedState = {
			...newState,
			caches: {
				...newState.caches,
				securityBriefs: setCacheItem(
					newState.caches.securityBriefs,
					'all',
					securities,
					SECURITY_BRIEF_TTL_MS
				)
			}
		};
		if (state.logger) state.logger.info('Fetched and cached security briefs');
		return [updatedState, securities];
	} catch (error) {
		if (state.logger) state.logger.error('Failed to get security briefs', error);
		if ((error as NepseError).code) {
			throw error;
		}
		throw createNepseError(
			'Failed to get security briefs',
			'SECURITY_BRIEFS_ERROR',
			error
		);
	}
}

export async function fetchSecurityDetail(
	state: ClientState,
	symbol: string
): Promise<[ClientState, SecurityDetail]> {
	if (!symbol) {
		throw createNepseError(
			'Invalid security symbol',
			'INVALID_SYMBOL'
		);
	}

	const normalizedSymbol = symbol.toUpperCase();

	try {
		// Get securities list
		const [stateWithSecurities, securities] = await fetchSecurityBriefs(state);
		const security = securities.find(s => s.symbol.toUpperCase() === normalizedSymbol);

		if (!security) {
			if (state.logger) state.logger.error(`Security not found: ${symbol}`);
			throw createNepseError(
				`Security not found: ${symbol}`,
				'SECURITY_NOT_FOUND'
			);
		}

		// Get market status
		const [stateWithMarketStatus, marketStatus] = await fetchMarketStatus(stateWithSecurities);

		// Get access token
		const [newState, token] = await getAccessToken(stateWithMarketStatus);

		const bodyId = calculateValidBodyId(marketStatus?.id ?? 0);

		const response = await fetchWithRetry(
			`${BASE_URL}/api/nots/security/${security.id}`,
			{
				method: "POST",
				headers: createHeaders(token),
				data: { id: bodyId }
			}
		);

		if (response.status !== 200) {
			if (state.logger) state.logger.error(`Failed to get security detail: ${response.status} ${response.statusText}`);
			throw createNepseError(
				`Failed to get security detail: ${response.status} ${response.statusText}`,
				'SECURITY_DETAIL_ERROR'
			);
		}

		const securityDetailResponse = response.data as SecurityDetailResponse;

		const securityDetail: SecurityDetail = {
			id: securityDetailResponse.security.id,
			name: securityDetailResponse.security.securityName,
			symbol: securityDetailResponse.security.symbol,
			activeStatus: securityDetailResponse.security.activeStatus,
			businessDate: securityDetailResponse.securityDailyTradeDto.businessDate,
			closePrice: securityDetailResponse.securityDailyTradeDto.closePrice,
			lastTradePrice: securityDetailResponse.securityDailyTradeDto.lastTradedPrice,
			fiftyTwoWeekHigh: securityDetailResponse.securityDailyTradeDto.fiftyTwoWeekHigh,
			fiftyTwoWeekLow: securityDetailResponse.securityDailyTradeDto.fiftyTwoWeekLow,
			listingDate: securityDetailResponse.security.listingDate
		};
		if (state.logger) state.logger.info(`Fetched security detail for ${symbol}`);
		return [newState, securityDetail];
	} catch (error) {
		if (state.logger) state.logger.error(`Failed to get security detail for ${symbol}`, error);
		if ((error as NepseError).code) {
			throw error;
		}
		throw createNepseError(
			`Failed to get security detail for ${symbol}`,
			'SECURITY_DETAIL_ERROR',
			error
		);
	}
}


export async function fetchNepseIndex(
	state: ClientState,
): Promise<[ClientState, IndexDetail[]]> {

	try {
		// Get access token
		const [newState, token] = await getAccessToken(state);

		const response = await fetchWithRetry(
			`${BASE_URL}/api/nots/nepse-index`,
			{
				method: "GET",
				headers: createHeaders(token)
			}
		);

		if (response.status !== 200) {
			if (state.logger) state.logger.error(`Failed to get index details: ${response.status} ${response.statusText}`);
			throw createNepseError(
				`Failed to get index details: ${response.status} ${response.statusText}`,
				'INDEX_DETAIL_ERROR'
			);
		}

		const indexDetails = response.data as IndexDetail[];
		if (state.logger) state.logger.info('Fetched nepse index details');
		return [newState, indexDetails];
	} catch (error) {
		if (state.logger) state.logger.error('Failed to get nepse index details', error);
		if ((error as NepseError).code) {
			throw error;
		}
		throw createNepseError(
			'Failed to get nepse index details',
			'SECURITY_DETAIL_ERROR',
			error
		);
	}
}