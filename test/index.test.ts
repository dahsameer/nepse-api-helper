import { it, expect, describe } from "vitest";
import { get_access_token, get_valid_token, get_market_status, instantiate_nepse_helper, get_security_detail, security_brief_cache } from "../lib";
import { Prove } from "../lib/prove";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

describe("all library tests", async () => {
    await instantiate_nepse_helper();

    it("getting access token", async () => {
        const access_token = await get_access_token();
        const is_token = access_token?.startsWith("ey");
        expect(is_token, "received string is not a token").toBe(true);
    });

    it("getting valid token", async () => {
        var raw_object: Prove = {
            "serverTime": 1687699998000,
            "salt": "O5!Z>1{_a0iO1%\\/`4P=",
            "accessToken": "eyJlbmMiOiJBMTI4Q0JDLUhTMjU2WIiwiYWxnIjoiZGlyIn0c..nL1Y5vBX2Fy7lWfEyWkk2A.RqxCxJWW2D6zbXFi-Nyp-jTx9OqmAvvvkP3CP34m1uDjVECrJXYNaN-cbHkqYhg8BWF771G1ykoXPLrZZb6oSHC-TdoZkF4Ht0K3ULKjNXCQccGGFAMDwuT60MDrA_vYNiEeRQ7fZN-VnnIdA1rSaANsw.J9AiD_43-ch8-QH8b46Dzw",
            "tokenType": "",
            "refreshToken": "eyJlbmMiOiJBMTI4Q0JDLUhTMjU2tIiwiYWxnIjoiZGlyIWn0..LrCh8OiSrVDJafrkdWY6DQ.OQHxknRQi5YuU_L5YP9LfmEG8yv8VTVCL0G0-y7LOmhD_yoYBTSrsMW0d-cz9PkibvlDvfJfEQK5ufo5UDyno4k7cNDoaCgofdvOBkgcIJoUAx4xzGEjiJERQPlDULTisPejtVP1kGhMIN9chR7KTI1lQ.N-1qatEKCM-lMZ1C8zqIJw",
            "salt1": 63629,
            "salt2": 56377,
            "salt3": 62477,
            "salt4": 85843,
            "salt5": 28870,
            "isDisplayActive": false,
            "popupDocFor": "pdf"
        }
        const valid_token = get_valid_token(raw_object);
        expect(valid_token, "token is not valid").toBe("eyJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwiYWxnIjoiZGlyIn0..nL1Y5vBX2Fy7lWfEyWkk2A.RqCxJWW2D6zbXFi-Nyp-jTx9OqAvvvkP3CP34m1uDjVCrJXYNaN-cbHkqYhg8BWF771G1ykoXPLrZZb6oSHC-TdoZkF4Ht0K3ULKjNXCQccGGFAMDwuT60MDrA_vYNiEeRQ7fZN-VnnIdA1rSaANsw.J9AiD_43-ch8-QH8b46Dzw");
    });

    it("getting market status", async () => {
        const market_status = await get_market_status();
        expect(market_status?.id, "market status does not have id").toBeGreaterThan(0);
    });

    it("getting security detail", async ()  => {
        const detail = await get_security_detail('HLI');
        console.log(detail);
        expect(true, "hehe").toBe(true);
    })
});
