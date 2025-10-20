import { getAccessToken } from "./auth";
import { createNepseError, NepseError } from "./errors";
import { createHeaders } from "./http";
import { getHardCodedNepseExports } from "./nepseExports";
import { fetchMarketStatus, fetchNepseIndex, fetchSecurityBriefs, fetchSecurityDetail } from "./security";
import { loadWasmModule } from "./wasm";
import type { ClientState, IndexDetail, InitializeOptions, Logger, MarketStatus, NepseExports, SecurityBrief, SecurityDetail } from './types';
export * from './types';
export { createNepseError, NepseError };
export { createHeaders };
export { nepseAxios } from './http';
export { BASE_URL } from './constants';
export { getHardCodedNepseExports, loadWasmModule };

export function createInitialState(logger?: Logger): ClientState {
	return {
		nepseExports: null,
		token: {
			value: null,
			expiry: 0
		},
		caches: {
			securityBriefs: {}
		},
		isInitialized: false,
		logger: logger ?? defaultLogger
	};
}

const defaultLogger = {
	info: (msg: string, ...args: unknown[]) => { console.log(`INFO: ${msg}`, ...args); },
	warn: (msg: string, ...args: unknown[]) => { console.warn(`WARN: ${msg}`, ...args); },
	error: (msg: string, ...args: unknown[]) => { console.error(`ERROR: ${msg}`, ...args); }
};

let globalState = createInitialState();

function initializationGuard() {
	if (!globalState.isInitialized) {
		throw createNepseError(
			'Library not initialized. Call initialize() first',
			'NOT_INITIALIZED'
		);
	}
}

export async function initialize(options: InitializeOptions = {}): Promise<void> {
	const { useWasm = true, logger } = options;
	if (globalState.isInitialized) {
		return;
	}

	// Set logger if provided
	if (logger) {
		globalState.logger = logger;
	} else if (!globalState.logger) {
		globalState.logger = defaultLogger;
	}

	let nepseExports: NepseExports;
	const log = globalState.logger ?? defaultLogger;

	if (useWasm) {
		try {
			nepseExports = await loadWasmModule();
			log.info('Initialized with WASM module');
		} catch (error) {
			log.warn('Failed to load WASM, falling back to TypeScript implementation', error);
			nepseExports = getHardCodedNepseExports();
		}
	} else {
		nepseExports = getHardCodedNepseExports();
		log.info('Initialized with TypeScript implementation');
	}

	globalState = {
		...globalState,
		nepseExports,
		isInitialized: true,
	};

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

export default nepseClient;