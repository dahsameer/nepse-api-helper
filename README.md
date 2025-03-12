# nepse-api-helper

Nepse has made it really hard to use their API, this library just makes it easier to do stuff i guess. made just for *EDUCATIONAL PURPOSE*

works as of 2025-03-12

you can install from npm using `npm install nepse-api-helper`

```javascript
import { nepseClient } from "nepse-api-helper";

//at first before anything, call initialize() on nepseClient. This is required to get the deobsfucation logic for token. 
await nepseClient.initialize();

//now you can use the functions that you need. for example

 //this will return a list of all securities including active and inactive, with their status.
const securities = await nepseClient.getSecurities();

//get the detials of a security
const security = await nepseClient.getSecurityDetail("NIFRA");

//if you want to check if market is open or not, you can use, GetMarketStatus
const marketStatus = await nepseClient.getMarketStatus();

//if you want to make your own custom API call for a function that isn't defined in this library, you can just get the token first
const token = await nepseClient.getToken();
//and then you can use this token to call other APIs that you need to like:
const response = await fetch(
    `${BASE_URL}/api/nots/securityDailyTradeStat/58`,
    {
        method: "GET",
        headers: createHeaders(token)
    }
);

```

this package is my first and was made rapidly so there might be many bad practices, I am happy to receive constructive criticism and pull requests.

## SSL issue

You might get SSL issue, in which case, you will need to make your runtime ignore 
the SSL error. this can be done in nodejs by exporting this environment variable 

```bash
export NODE_TLS_REJECT_UNAUTHORIZED='0'
```

have a look at tests to get basic understanding of how it works
