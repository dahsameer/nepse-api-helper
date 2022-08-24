interface SecurityDetail{
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

interface SecurityDetailResponse {
	securityDailyTradeDto: SecurityDailyTradeDto;
	security:              Security;
	stockListedShares:     number;
	paidUpCapital:         number;
	issuedCapital:         number;
	marketCapitalization:  number;
	publicShares:          number;
	publicPercentage:      number;
	promoterShares:        number;
	promoterPercentage:    number;
	updatedDate:           Date;
	securityId:            number;
}

interface Security {
	id:                  number;
	symbol:              string;
	isin:                string;
	permittedToTrade:    string;
	listingDate:         Date;
	creditRating:        null;
	tickSize:            number;
	instrumentType:      InstrumentType;
	capitalGainBaseDate: Date;
	faceValue:           number;
	highRangeDPR:        null;
	issuerName:          null;
	meInstanceNumber:    number;
	parentId:            null;
	recordType:          number;
	schemeDescription:   null;
	schemeName:          null;
	secured:             null;
	series:              null;
	shareGroupId:        ShareGroupID;
	activeStatus:        string;
	divisor:             number;
	cdsStockRefId:       number;
	securityName:        string;
	tradingStartDate:    Date;
	networthBasePrice:   number;
	securityTradeCycle:  number;
	isPromoter:          string;
	companyId:           CompanyID;
}

interface CompanyID {
	id:                        number;
	companyShortName:          string;
	companyName:               string;
	email:                     string;
	companyWebsite:            string;
	companyContactPerson:      string;
	sectorMaster:              SectorMaster;
	companyRegistrationNumber: string;
	activeStatus:              string;
}

interface SectorMaster {
	id:                number;
	sectorDescription: string;
	activeStatus:      string;
	regulatoryBody:    string;
}

interface InstrumentType {
	id:           number;
	code:         string;
	description:  string;
	activeStatus: string;
}

interface ShareGroupID {
	id:              number;
	name:            string;
	description:     string;
	capitalRangeMin: number;
	modifiedBy:      null;
	modifiedDate:    null;
	activeStatus:    string;
	isDefault:       string;
}

interface SecurityDailyTradeDto {
	securityId:          string;
	openPrice:           number;
	highPrice:           number;
	lowPrice:            number;
	totalTradeQuantity:  number;
	totalTrades:         number;
	lastTradedPrice:     number;
	previousClose:       number;
	businessDate:        Date;
	closePrice:          number;
	fiftyTwoWeekHigh:    number;
	fiftyTwoWeekLow:     number;
	lastUpdatedDateTime: Date;
}

export {
	SecurityDetail,
	SecurityDetailResponse
}