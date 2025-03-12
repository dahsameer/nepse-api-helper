import { NepseError } from "./types";

// errors.ts - Error creation
export function createNepseError(
	message: string,
	code: string,
	originalError?: unknown
): NepseError {
	const error = new Error(message) as NepseError;
	error.name = 'NepseError';
	error.code = code;
	error.originalError = originalError;
	return error;
}

