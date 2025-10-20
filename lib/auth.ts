import { BASE_URL, TOKEN_TTL_MS } from "./constants";
import { createNepseError } from "./errors";
import { nepseAxios } from "./http";
import { ClientState, NepseError, NepseExports, Prove } from "./types";

export async function getProveObject(): Promise<Prove> {
	try {
		const response = await nepseAxios.get(`${BASE_URL}/api/authenticate/prove`, {
			headers: {
				"User-Agent": "Mozilla/5.0",
				"Referer": BASE_URL
			}
		});

		if (response.status !== 200) {
			throw createNepseError(
				`Failed to get prove object: ${response.status} ${response.statusText}`,
				'PROVE_FETCH_ERROR'
			);
		}

		return response.data as Prove;
	} catch (error) {
		if ((error as NepseError).code) {
			throw error;
		}
		throw createNepseError(
			'Failed to get prove object',
			'PROVE_FETCH_ERROR',
			error
		);
	}
}

export function generateValidToken(proveObj: Prove, nepseExports: NepseExports): string {
	const { accessToken, salt1, salt2, salt3, salt4, salt5 } = proveObj;
	const { cdx, rdx, bdx, ndx, mdx } = nepseExports;

	const c = cdx(salt1, salt2, salt3, salt4, salt5);
	const r = rdx(salt1, salt2, salt4, salt3, salt5);
	const b = bdx(salt1, salt2, salt4, salt3, salt5);
	const n = ndx(salt1, salt2, salt4, salt3, salt5);
	const m = mdx(salt1, salt2, salt4, salt3, salt5);

	return accessToken.slice(0, c) +
		accessToken.slice(c + 1, r) +
		accessToken.slice(r + 1, b) +
		accessToken.slice(b + 1, n) +
		accessToken.slice(n + 1, m) +
		accessToken.slice(m + 1);
}

export async function getAccessToken(state: ClientState): Promise<[ClientState, string]> {
	const now = Date.now();

	if (state.token.value && now < state.token.expiry) {
		return [state, state.token.value];
	}

	if (!state.nepseExports) {
		if (state.logger) {
			state.logger.error('WASM module not instantiated');
		}
		throw createNepseError(
			'WASM module not instantiated',
			'WASM_NOT_INSTANTIATED'
		);
	}

	try {
		const proveObj = await getProveObject();
		const token = generateValidToken(proveObj, state.nepseExports);

		const newState = {
			...state,
			token: {
				value: token,
				expiry: now + TOKEN_TTL_MS
			}
		};

		return [newState, token];
	} catch (error) {
		if (state.logger) {
			state.logger.error('Failed to get access token', error);
		}
		throw createNepseError(
			'Failed to get access token',
			'TOKEN_ACQUISITION_ERROR',
			error
		);
	}
}