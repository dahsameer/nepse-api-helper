# nepse-api-helper

Nepse has made it really hard to use their API, you can read more on how to 
this library was implemented in this doc [https://github.com/dahsameer/nepse-api-document](https://github.com/dahsameer/nepse-api-document)

works as of 2022-24-08

you can install from npm using `npm install nepse-api-helper`

```javascript
import { UpdateSecurityBriefs, GetSecurityDetail, GetSecurityBriefs, GetMarketStatus } from "nepse-api-helper";

//at first before anything, call UpdateSecurityBriefs. This is required to get a cache of security id and symbol
await UpdateSecurityBriefs();

//now you can use the functions that you need. for example

const securityLists = await GetSecurityBriefs(); //this will return a list of all securities including active and inactive, with their status.

//get the detials of a security
const securityDetail = await GetSecurityDetail('NIFRA');

//if you want to check if market is open or not, you can use, GetMarketStatus
const marketStatus = await GetMarketStatus();
```

this package is my first and was made rapidly so there might be many bad practices, I am happy to receive constructive criticism and pull requests.

## SSL issue

You might get SSL issue, in which case, you will need to make your runtime ignore 
the SSL error. this can be done in nodejs by exporting this environment variable 

```bash
export NODE_TLS_REJECT_UNAUTHORIZED='0'
```
