import { BASE_URL } from "./constants";
import { createNepseError } from "./errors";
import { NepseError, NepseWasmExports } from "./types";

// wasm.ts - WASM-related functions
export async function loadWasmModule(
	wasmUrl: string = `${BASE_URL}/assets/prod/css.wasm`
): Promise<NepseWasmExports> {
	try {
		const response = await fetch(wasmUrl);

		if (!response.ok) {
			throw createNepseError(
				`Failed to fetch WASM module: ${response.status} ${response.statusText}`,
				'WASM_FETCH_ERROR'
			);
		}

		const buffer = await response.arrayBuffer();
		const { instance } = await WebAssembly.instantiate(buffer);

		return {
			cdx: instance.exports.cdx as unknown as NepseWasmExports['cdx'],
			rdx: instance.exports.rdx as unknown as NepseWasmExports['rdx'],
			bdx: instance.exports.bdx as unknown as NepseWasmExports['bdx'],
			ndx: instance.exports.ndx as unknown as NepseWasmExports['ndx'],
			mdx: instance.exports.mdx as unknown as NepseWasmExports['mdx']
		};
	} catch (error) {
		if ((error as NepseError).code) {
			throw error;
		}
		throw createNepseError(
			'Failed to instantiate WASM module',
			'WASM_INSTANTIATE_ERROR',
			error
		);
	}
}