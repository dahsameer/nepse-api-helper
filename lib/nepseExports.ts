import { NepseExports } from "./types";

const LOOKUP_TABLE = [
	5, 8, 4, 7, 9, 4, 6, 9, 5, 5,
	6, 5, 3, 5, 4, 4, 9, 6, 6, 8,
	8, 6, 8, 6, 5, 8, 4, 9, 5, 9,
	8, 5, 3, 4, 7, 7, 4, 7, 3, 9
];

export function getHardCodedNepseExports(): NepseExports {
	return {
		cdx: (var0: number, var1: number, var2: number, var3: number, var4: number): number => {
			const ones = var1 % 10;
			const tens = Math.floor(var1 / 10) % 10;
			const hundreds = Math.floor(var1 / 100) % 10;
			const index = ones + tens + hundreds;
			return LOOKUP_TABLE[index] + 22;
		},

		rdx: (var0: number, var1: number, var2: number, var3: number, var4: number): number => {
			const ones = var1 % 10;
			const tens = Math.floor(var1 / 10) % 10;
			const hundreds = Math.floor(var1 / 100) % 10;
			var0 = tens + hundreds;
			const lookupIndex = var0 + ones;
			return var0 + LOOKUP_TABLE[lookupIndex] + 32;
		},

		bdx: (var0: number, var1: number, var2: number, var3: number, var4: number): number => {
			const ones = var1 % 10;
			const tens = Math.floor(var1 / 10) % 10;
			const hundreds = Math.floor(var1 / 100) % 10;
			var0 = tens + hundreds;
			const lookupIndex = var0 + ones;
			return var0 + LOOKUP_TABLE[lookupIndex] + 60;
		},

		ndx: (var0: number, var1: number, var2: number, var3: number, var4: number): number => {
			const ones = var1 % 10;
			const tens = Math.floor(var1 / 10) % 10;
			const hundreds = Math.floor(var1 / 100) % 10;
			const lookupIndex = tens + ones + hundreds; // Fixed: removed the 2*
			return tens + LOOKUP_TABLE[lookupIndex] + 88;
		},

		mdx: (var0: number, var1: number, var2: number, var3: number, var4: number): number => {
			const ones = var1 % 10;
			const tens = Math.floor(var1 / 10) % 10;
			const hundreds = Math.floor(var1 / 100) % 10;
			const lookupIndex = hundreds + tens + ones; // Fixed: removed the 2*
			return hundreds + LOOKUP_TABLE[lookupIndex] + 110;
		}
	};
}