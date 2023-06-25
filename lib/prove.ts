interface Prove {
	accessToken: string;
	refreshToken: string;
	salt: string;
	salt1: number;
	salt2: number;
	salt3: number;
	salt4: number;
	salt5: number;
	serverTime: number;
	tokenType: string | null;
	isDisplayActive: boolean;
	popupDocFor: string;
}

interface ProveExtra {
	serverTime: number;
	clientTime: number;
	validAccessToken: string;
}

export { Prove, ProveExtra };
