import { BASE_URL } from "./constants";
import { createNepseError } from "./errors";
import { NepseDecodeFunction, NepseError, NepseExports } from "./types";

export async function loadWasmModule(
	wasmUrl: string = `${BASE_URL}/assets/prod/css.wasm`
): Promise<NepseExports> {
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
			cdx: instance.exports.cdx as NepseDecodeFunction,
			rdx: instance.exports.rdx as NepseDecodeFunction,
			bdx: instance.exports.bdx as NepseDecodeFunction,
			ndx: instance.exports.ndx as NepseDecodeFunction,
			mdx: instance.exports.mdx as NepseDecodeFunction
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