interface Prove {
  accessToken: string;
  refreshToken: string;
  salt: string;
  salt1: number;
  salt2: number;
  salt3: number;
  salt4: number;
  serverTime: number;
  tokenType: string | null;
}

interface ProveExtra { 
  serverTime: number,
  clientTime: number,
  validAccessToken: string
}

export {
  Prove,
  ProveExtra
} 