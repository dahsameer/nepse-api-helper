# nepse-api-helper

Nepse has made it really hard to use their API, this library just makes it easier to do stuff i guess

works as of 2023-06-25

you can install from npm using `npm install nepse-api-helper`

```javascript
import { get_access_token, get_valid_token, get_market_status, instantiate_nepse_helper, get_security_detail, get_security_briefs } from "nepse-api-helper";

//at first before anything, call instantiate_nepse_helper(). This is required to get the deobsfucation logic for token. 
await instantiate_nepse_helper();

//now you can use the functions that you need. for example

const securityLists = await get_security_briefs(); //this will return a list of all securities including active and inactive, with their status.

//get the detials of a security
const securityDetail = await get_security_detail('NIFRA');

//if you want to check if market is open or not, you can use, GetMarketStatus
const marketStatus = await get_market_status();
```

this package is my first and was made rapidly so there might be many bad practices, I am happy to receive constructive criticism and pull requests.

## SSL issue

You might get SSL issue, in which case, you will need to make your runtime ignore 
the SSL error. this can be done in nodejs by exporting this environment variable 

```bash
export NODE_TLS_REJECT_UNAUTHORIZED='0'
```

have a look at tests to get basic understanding of how it works