import { BASE_URL, MAX_RETRIES, REQUEST_TIMEOUT_MS, RETRY_DELAY_MS } from "./constants";

export async function fetchWithTimeout(
	url: string,
	options: RequestInit,
	timeout = REQUEST_TIMEOUT_MS
): Promise<Response> {
	const controller = new AbortController();
	const id = setTimeout(() => controller.abort(), timeout);

	try {
		const response = await fetch(url, {
			...options,
			signal: controller.signal
		});
		return response;
	} finally {
		clearTimeout(id);
	}
}

export async function fetchWithRetry(
	url: string,
	options: RequestInit,
	retries = MAX_RETRIES,
	delay = RETRY_DELAY_MS
): Promise<Response> {
	try {
		return await fetchWithTimeout(url, options);
	} catch (error) {
		if (retries <= 0) {
			throw error;
		}

		// Only retry on network errors or timeouts
		if (error instanceof TypeError || error instanceof DOMException) {
			await new Promise(resolve => setTimeout(resolve, delay));
			return fetchWithRetry(url, options, retries - 1, delay * 2);
		}

		throw error;
	}
}

export function createHeaders(token: string): Record<string, string> {
	return {
		"User-Agent": "Mozilla/5.0",
		"Accept": "application/json, text/plain, */*",
		"Accept-Encoding": "gzip, deflate, br",
		"Accept-Language": "en-US,en;q=0.9",
		"Connection": "keep-alive",
		"Referer": `${BASE_URL}/`,
		"Authorization": `Salter ${token}`,
		"Content-Type": "application/json"
	};
}