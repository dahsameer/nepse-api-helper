# nepse-api-helper

i haven't actually tested the library but doing something like following should work. 

you can install from npm using `npm install nepse-api-helper`

```javascript
import { UpdateSecurityBriefs, GetSecurityDetail, GetSecurityBriefs, GetMarketStatus } from "nepse-api-helper";

//at first before anything, call UpdateSecurityBriefs. This is required to get a cache of security id and symbol
await UpdateSecurityBriefs();

//now you can use the functions that you need. for example

const securityLists = await GetSecurityBriefs(); //this will return a list of all securities including active and inactive, with thier status.

//get the detials of a security
const securityDetail = await GetSecurityDetail('NIFRA');

//if you want to check if market is open or not, you can use, GetMarketStatus
const marketStatus = await GetMarketStatus();
```

this package is my first and was made rapidly so there might be many bad practices, I am happy to receive constructive criticism and pull requests.
