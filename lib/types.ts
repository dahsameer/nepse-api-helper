export type Logger = {
	info: (msg: string, ...args: unknown[]) => void;
	warn: (msg: string, ...args: unknown[]) => void;
	error: (msg: string, ...args: unknown[]) => void;
};

export type ClientState = {
	nepseExports: NepseExports | null;
	token: {
		value: string | null;
		expiry: number;
	};
	caches: {
		securityBriefs: Cache<SecurityBrief[]>;
	};
	isInitialized: boolean;
	logger?: Logger;
}
export type MarketStatus = {
	isOpen: string;
	asOf: string;
	id: number;
}

export type Prove = {
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

export type ProveExtra = {
	serverTime: number;
	clientTime: number;
	validAccessToken: string;
}

export type SecurityBrief = {
	activeStatus: string;
	id: number;
	name: string;
	securityName: string;
	symbol: string;
}

export type SecurityDetail = {
	id: number,
	symbol: string,
	name: string,
	activeStatus: string,
	listingDate: Date,
	closePrice: number,
	businessDate: Date,
	fiftyTwoWeekHigh: number,
	fiftyTwoWeekLow: number,
	lastTradePrice: number
}

export type SecurityDetailResponse = {
	securityDailyTradeDto: SecurityDailyTradeDto;
	security: Security;
	stockListedShares: number;
	paidUpCapital: number;
	issuedCapital: number;
	marketCapitalization: number;
	publicShares: number;
	publicPercentage: number;
	promoterShares: number;
	promoterPercentage: number;
	updatedDate: Date;
	securityId: number;
}

type Security = {
	id: number;
	symbol: string;
	isin: string;
	permittedToTrade: string;
	listingDate: Date;
	creditRating: null;
	tickSize: number;
	instrumentType: InstrumentType;
	capitalGainBaseDate: Date;
	faceValue: number;
	highRangeDPR: null;
	issuerName: null;
	meInstanceNumber: number;
	parentId: null;
	recordType: number;
	schemeDescription: null;
	schemeName: null;
	secured: null;
	series: null;
	shareGroupId: ShareGroupID;
	activeStatus: string;
	divisor: number;
	cdsStockRefId: number;
	securityName: string;
	tradingStartDate: Date;
	networthBasePrice: number;
	securityTradeCycle: number;
	isPromoter: string;
	companyId: CompanyID;
}

type CompanyID = {
	id: number;
	companyShortName: string;
	companyName: string;
	email: string;
	companyWebsite: string;
	companyContactPerson: string;
	sectorMaster: SectorMaster;
	companyRegistrationNumber: string;
	activeStatus: string;
}

type SectorMaster = {
	id: number;
	sectorDescription: string;
	activeStatus: string;
	regulatoryBody: string;
}

type InstrumentType = {
	id: number;
	code: string;
	description: string;
	activeStatus: string;
}

type ShareGroupID = {
	id: number;
	name: string;
	description: string;
	capitalRangeMin: number;
	modifiedBy: null;
	modifiedDate: null;
	activeStatus: string;
	isDefault: string;
}

type SecurityDailyTradeDto = {
	securityId: string;
	openPrice: number;
	highPrice: number;
	lowPrice: number;
	totalTradeQuantity: number;
	totalTrades: number;
	lastTradedPrice: number;
	previousClose: number;
	businessDate: Date;
	closePrice: number;
	fiftyTwoWeekHigh: number;
	fiftyTwoWeekLow: number;
	lastUpdatedDateTime: Date;
}

export type IndexDetail = {
	id: number;
	auditId: any;
	exchangeIndexId: any;
	generatedTime: string;
	index: string;
	close: number;
	high: number;
	low: number;
	previousClose: number;
	change: number;
	perChange: number;
	fiftyTwoWeekHigh: number;
	fiftyTwoWeekLow: number;
	currentValue: number;
}

export type NepseDecodeFunction = (var0: number, var1: number, var2: number, var3: number, var4: number) => number;

export type NepseExports = {
	cdx: NepseDecodeFunction;
	rdx: NepseDecodeFunction;
	bdx: NepseDecodeFunction;
	ndx: NepseDecodeFunction;
	mdx: NepseDecodeFunction;
}

export type NepseError = Error & {
	code: string;
	originalError?: unknown;
}

export type CacheItem<T> = {
	data: T;
	expiry: number;
}

export type Cache<T> = {
	[key: string]: CacheItem<T>;
}

// ...existing code...

export type InitializeOptions = {
	useWasm?: boolean;
	logger?: Logger;
}