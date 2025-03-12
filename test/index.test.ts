import { it, expect, describe, beforeAll, afterAll } from "vitest";
import { nepseClient } from '../lib';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

describe("security functions tests", async () => {
	await nepseClient.initialize();

	it("getting token", async () => {
		const token = await nepseClient.getToken();
		const isToken = token.startsWith("ey");
		expect(isToken, "invalid token").toBeTruthy();
	});

	it("getting market status", async () => {
		const marketStatus = await nepseClient.getMarketStatus();
		expect(marketStatus?.id, "market status does not have id").toBeGreaterThan(0);
	});

	it("getting security detail", async () => {
		const security = await nepseClient.getSecurityDetail("NIFRA");
		expect(security?.id, "invalid security").toBeGreaterThan(0);
	});

	it("getting all securities", async () => {
		const securities = await nepseClient.getSecurities();
		expect(securities.length, "no securities found").toBeGreaterThan(0);
	});

	it("getting nepse index", async () => {
		const nepseIndexDetails = await nepseClient.getNepseIndex();
		expect(nepseIndexDetails.length, "no securities found").toBeGreaterThan(0);
	});
});
