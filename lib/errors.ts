import { NepseError as NepseErrorType } from "./types";

export class NepseError extends Error implements NepseErrorType {
	public code: string;
	public originalError?: unknown;

	constructor(message: string, code: string, originalError?: unknown) {
		super(message);
		this.name = 'NepseError';
		this.code = code;
		this.originalError = originalError;
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

export function createNepseError(message: string, code: string, originalError?: unknown): NepseError {
	return new NepseError(message, code, originalError);
}

