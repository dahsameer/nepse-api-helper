import { BASE_URL, MAX_RETRIES, REQUEST_TIMEOUT_MS, RETRY_DELAY_MS } from "./constants";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";
import https from "https";

// Create an Axios agent with rejectUnauthorized: false
export const nepseAxios: AxiosInstance = axios.create({
	httpsAgent: new https.Agent({ rejectUnauthorized: false }),
	timeout: REQUEST_TIMEOUT_MS,
});


/**
 * Unified fetch with timeout. Use Axios conventions:
 *   - method: 'GET' | 'POST' | ...
 *   - headers: {...}
 *   - data: request body (for POST/PUT)
 *   - params: query params (for GET)
 * Usage:
 *   fetchWithTimeout(url, { method: 'POST', headers, data })
 */
export async function fetchWithTimeout(
	url: string,
	config: AxiosRequestConfig = {},
	timeout = REQUEST_TIMEOUT_MS
): Promise<any> {
	try {
		const response = await nepseAxios.request({ url, ...config, timeout });
		return response;
	} catch (error) {
		throw error;
	}
}


export async function fetchWithRetry(
	url: string,
	config: AxiosRequestConfig = {},
	retries = MAX_RETRIES,
	delay = RETRY_DELAY_MS
): Promise<any> {
	try {
		return await fetchWithTimeout(url, config);
	} catch (error: any) {
		if (retries <= 0) throw error;
		if (error.isAxiosError || error instanceof AxiosError) {
			await new Promise(resolve => setTimeout(resolve, delay));
			return fetchWithRetry(url, config, retries - 1, delay * 2);
		}
		throw error;
	}
}

export type HeadersMap = Readonly<Record<string, string>>;

// The following function is the correct implementation of createHeaders
export function createHeaders(
	token?: string,
	options?: { omitAuthorization?: boolean }
): HeadersMap {
	const baseHeaders: Record<string, string> = {
		"User-Agent": "Mozilla/5.0",
		"Accept": "application/json, text/plain, */*",
		"Accept-Encoding": "gzip, deflate, br",
		"Accept-Language": "en-US,en;q=0.9",
		"Connection": "keep-alive",
		"Referer": `${BASE_URL}/`,
		"Content-Type": "application/json"
	};
	if (!options?.omitAuthorization && token) {
		baseHeaders["Authorization"] = `Salter ${token}`;
	}
	return baseHeaders as HeadersMap;
}