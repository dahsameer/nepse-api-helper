import { Cache } from "./types";

export function getCacheItem<T>(
	cache: Cache<T>,
	key: string
): T | null {
	const item = cache[key];

	if (!item) {
		return null;
	}

	if (Date.now() > item.expiry) {
		return null;
	}

	return item.data;
}

export function setCacheItem<T>(
	cache: Cache<T>,
	key: string,
	data: T,
	ttlMs: number
): Cache<T> {
	return {
		...cache,
		[key]: {
			data,
			expiry: Date.now() + ttlMs
		}
	};
}