import { getAccessToken } from "./auth";
import { createNepseError } from "./errors";
import { createHeaders } from "./http";
import { fetchMarketStatus, fetchNepseIndex, fetchSecurityBriefs, fetchSecurityDetail } from "./security";
import { ClientState, IndexDetail, MarketStatus, SecurityBrief, SecurityDetail } from "./types";
import { loadWasmModule } from "./wasm";

export function createInitialState(): ClientState {
	return {
		wasmExports: null,
		token: {
			value: null,
			expiry: 0
		},
		caches: {
			securityBriefs: {}
		},
		isInitialized: false
	};
}

let globalState = createInitialState();

function initializationGuard() {
	if (!globalState.isInitialized) {
		throw createNepseError(
			'Library not initialized. Call initialize() first',
			'NOT_INITIALIZED'
		);
	}
}

export async function initialize(): Promise<void> {
	if (globalState.isInitialized) {
		return;
	}

	// Load WASM module
	const wasmExports = await loadWasmModule();

	// Update global state
	globalState = {
		...globalState,
		wasmExports,
		isInitialized: true,
	};

	// Pre-fetch security briefs
	const [newState] = await fetchSecurityBriefs(globalState);
	globalState = newState;
}

export async function getMarketStatus(): Promise<MarketStatus> {
	initializationGuard();

	const [newState, marketStatus] = await fetchMarketStatus(globalState);
	globalState = newState;
	return marketStatus;
}

export async function getSecurities(): Promise<SecurityBrief[]> {
	initializationGuard();

	const [newState, securities] = await fetchSecurityBriefs(globalState);
	globalState = newState;
	return securities;
}

export async function getSecurityDetail(symbol: string): Promise<SecurityDetail> {
	initializationGuard();

	const [newState, securityDetail] = await fetchSecurityDetail(globalState, symbol);
	globalState = newState;
	return securityDetail;
}

export async function getToken(): Promise<string> {
	initializationGuard();

	const [newState, token] = await getAccessToken(globalState);
	globalState = newState;
	return token;
}

export async function getNepseIndex(): Promise<IndexDetail[]> {
	initializationGuard();

	const [newState, indexes] = await fetchNepseIndex(globalState);
	globalState = newState;
	return indexes;
}

export const nepseClient = {
	initialize,
	getMarketStatus,
	getSecurities,
	getSecurityDetail,
	getNepseIndex,
	getToken,
	createHeaders
};