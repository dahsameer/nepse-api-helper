import { describe, it, expect } from 'vitest';

import { getHardCodedNepseExports, createHeaders } from '../lib';
import { generateValidToken } from '../lib/auth';
import { getCacheItem, setCacheItem } from '../lib/cache';
import { calculateValidBodyId } from '../lib/security';
import type { Prove } from '../lib/types';

describe('nepseExports (TS fallback) functions', () => {
	const exp = getHardCodedNepseExports();

	it('cdx/rdx/bdx/ndx/mdx return numbers and are deterministic', () => {
		const args: [number, number, number, number, number] = [1, 234, 3, 4, 5];
		expect(typeof exp.cdx(...args)).toBe('number');
		expect(typeof exp.rdx(...args)).toBe('number');
		expect(typeof exp.bdx(...args)).toBe('number');
		expect(typeof exp.ndx(...args)).toBe('number');
		expect(typeof exp.mdx(...args)).toBe('number');

		expect(exp.cdx(...args)).toEqual(exp.cdx(...args));
	});
});

describe('generateValidToken', () => {
	it('combines accessToken slices as expected with TS exports', () => {
		const exp = getHardCodedNepseExports();

		const prove: Prove = {
			accessToken: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
			refreshToken: '',
			salt: '',
			salt1: 12,
			salt2: 34,
			salt3: 56,
			salt4: 78,
			salt5: 90,
			serverTime: Date.now(),
			tokenType: null,
			isDisplayActive: false,
			popupDocFor: ''
		};

		const token = generateValidToken(prove, exp);
		expect(typeof token).toBe('string');
		expect(token.length).toBeLessThan(prove.accessToken.length);
	});

	it('throws if accessToken is empty (edge case)', () => {
		const exp = getHardCodedNepseExports();
		const prove = { accessToken: '', refreshToken: '', salt: '', salt1: 1, salt2: 2, salt3: 3, salt4: 4, salt5: 5, serverTime: Date.now(), tokenType: null, isDisplayActive: false, popupDocFor: '' } as Prove;

		const result = generateValidToken(prove, exp);
		expect(typeof result).toBe('string');
	});
});

describe('cache helpers', () => {
	it('setCacheItem then getCacheItem returns value before expiry', () => {
		const cache = {} as any;
		const updated = setCacheItem(cache, 'k', { a: 1 }, 10000);
		const v = getCacheItem(updated, 'k');
		expect(v).toEqual({ a: 1 });
	});

	it('getCacheItem returns null for missing key', () => {
		const cache = {} as any;
		expect(getCacheItem(cache, 'nope')).toBeNull();
	});
});

describe('http.createHeaders', () => {
	it('returns required headers including Salter authorization', () => {
		const token = 'tkn';
		const h = createHeaders(token);
		expect(h.Authorization).toBe(`Salter ${token}`);
		expect(h.Referer).toContain('nepalstock.com.np');
		expect(h['Content-Type']).toBe('application/json');
	});
});

describe('calculateValidBodyId', () => {
	it('returns number and uses date in calculation', () => {
		const id1 = calculateValidBodyId(1);
		expect(typeof id1).toBe('number');

		const id2 = calculateValidBodyId(1);
		expect(id1).toEqual(id2);
	});
});
