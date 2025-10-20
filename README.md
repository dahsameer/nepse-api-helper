
# nepse-api-helper

> **A modern TypeScript library for seamless, robust access to the Nepal Stock Exchange (NEPSE) API.**

---

## Why use nepse-api-helper?

- **Handles NEPSE's complex token logic and restrictions for you**
- **Automatic caching and retry logic** for reliability and speed
- **Pluggable logging** for full observability
- **TypeScript-first**: strict types, generics, and DX
- **WASM fallback**: always works, even if NEPSE changes their obfuscation
- **Easy to test and extend**

---

[![npm version](https://img.shields.io/npm/v/nepse-api-helper.svg)](https://www.npmjs.com/package/nepse-api-helper)
[![License: MIT](https://img.shields.io/badge/License-The%20Unlicense-yellow.svg)](https://opensource.org/license/unlicense)

A TypeScript/JavaScript library that simplifies interaction with the NEPSE (Nepal Stock Exchange) API by handling authentication, token management, and API requests.

> **Educational Purpose Only**: This library is created for educational purposes to understand API interactions and is not affiliated with or endorsed by NEPSE.

## Features

- **Automatic Token Management**: Handles token generation and caching automatically
- **Dual Implementation**: Choose between WebAssembly or pure TypeScript implementations
- **Built-in Caching**: Reduces API calls with intelligent caching mechanisms
- **TypeScript Support**: Fully typed for better developer experience
- **Cross-Platform**: Works in Node.js and modern browsers (CORS restrictions may apply)
- **Pluggable Logging**: Inject your own logger for full control
- **Easy to Use**: Simple, intuitive API

---

## Installation

```bash
npm install nepse-api-helper
```

Or with yarn:

```bash
yarn add nepse-api-helper
```

Or with pnpm:

```bash
pnpm install nepse-api-helper
```

## Quick Start (Minimal Example)

```typescript
import { nepseClient } from "nepse-api-helper";

// Initialize the client (required before any API calls)
await nepseClient.initialize();

const securities = await nepseClient.getSecurities();
console.log(securities[0]);
```

## Quick Start (Advanced Example with Logger)

```typescript
import { nepseClient } from "nepse-api-helper";

const logger = {
  info: (msg, ...args) => console.log("INFO:", msg, ...args),
  warn: (msg, ...args) => console.warn("WARN:", msg, ...args),
  error: (msg, ...args) => console.error("ERROR:", msg, ...args),
};

await nepseClient.initialize({ logger });

const marketStatus = await nepseClient.getMarketStatus();
logger.info(`Market is ${marketStatus.isOpen ? "open" : "closed"}`);

const detail = await nepseClient.getSecurityDetail("NIFRA");
logger.info("NIFRA detail:", detail);
```

---


## How it Works (Architecture)

**Flow:**

1. `initialize()` loads WASM or TypeScript fallback for NEPSE's token logic
2. API calls use a short-lived token, auto-refreshed and cached
3. All requests use custom headers (`Salter <token>`) and retry logic
4. Security briefs and details are cached for performance
5. All errors are thrown as `NepseError` with codes for easy handling
6. Logging is pluggable: inject your own logger for full control

**Diagram:**

```
User code
  |
  v
nepseClient.initialize() --+--> WASM/TS loader
                  |
API call (getSecurities) --+--> token logic --> fetchWithRetry --> caching --> logger
```

---

## Initialization Options

The library supports two initialization modes and pluggable logging:

### 1. WebAssembly Mode (Default)

Uses the latest deobfuscation logic from NEPSE's WASM module. **Recommended for production use** to ensure compatibility with the latest NEPSE API.

```typescript
await nepseClient.initialize(); // Uses WASM by default

// Or explicitly:
await nepseClient.initialize({ useWasm: true });

// With a custom logger:
await nepseClient.initialize({ useWasm: true, logger });
```

**Pros:**

- Always up-to-date with latest NEPSE logic
- Most reliable for production

**Cons:**

- Requires WebAssembly support in runtime
- Slightly slower initialization

### 2. Pure TypeScript Mode

Uses a hardcoded TypeScript implementation of the deobfuscation logic.

```typescript
await nepseClient.initialize({ useWasm: false });
```

**Pros:**

- Works in all JavaScript environments
- Faster initialization
- No external dependencies

**Cons:**

- May become outdated if NEPSE changes their logic
- Requires manual updates


---

## API Reference & Types

- [Full TypeScript types](./lib/types.ts)
- [Error codes](./lib/errors.ts)
- [Constants](./lib/constants.ts)

---

### Client Methods

#### `initialize(options?)`

Initializes the client. **Must be called before any other operations.**

```typescript
await nepseClient.initialize({
  useWasm: true, // Optional: Use WebAssembly (default: true)
});
```

#### `getSecurities()`

Fetches all securities (both active and inactive).

```typescript
const securities = await nepseClient.getSecurities();
// Returns: SecurityBrief[]
```

#### `getSecurityDetail(symbol)`

Gets detailed information about a specific security.

```typescript
const security = await nepseClient.getSecurityDetail("NIFRA");
// Returns: SecurityDetail
```

#### `getMarketStatus()`

Checks if the market is currently open.

```typescript
const status = await nepseClient.getMarketStatus();
// Returns: MarketStatus
console.log(status.isOpen); // true or false
```

#### `getToken()`

Retrieves the current authentication token. Useful for making custom API calls.

```typescript
const token = await nepseClient.getToken();
// Returns: string (JWT token)
```

### Making Custom API Calls

For endpoints not covered by the library, you can use the token to make custom requests. Note: the library now exports an Axios instance (`nepseAxios`) and `createHeaders` accepts an optional token and options object.

```typescript
import { nepseClient, createHeaders, nepseAxios, BASE_URL } from "nepse-api-helper";

// Initialize and get token
await nepseClient.initialize();
const token = await nepseClient.getToken();

// Make custom API call using Axios
const response = await nepseAxios.get(`${BASE_URL}/api/nots/securityDailyTradeStat/58`, {
  headers: createHeaders(token)
});

const data = response.data;
```

### Utility Functions

#### `createHeaders(token?, options?)`

Creates headers object for NEPSE API requests. `token` is optional. If you need to omit the Authorization header (e.g. when loading the WASM blob or requesting the prove object), pass `{ omitAuthorization: true }` as the second argument.

```typescript
// With Authorization
const headersWithAuth = createHeaders(token);

// Without Authorization
const headersWithoutAuth = createHeaders(undefined, { omitAuthorization: true });
```

Note: when making POST/PUT requests use Axios' `data` option for request bodies (not `body`), and read results from `response.data`.

## TypeScript Types

The library exports TypeScript types for better development experience:

```typescript
import type {
  SecurityBrief,
  SecurityDetail,
  MarketStatus,
  NepseExports,
} from "nepse-api-helper";
```


---

The library throws descriptive errors with error codes and supports pluggable logging:

```typescript
try {
  await nepseClient.getSecurities();
} catch (error) {
  if (error.code === "NOT_INITIALIZED") {
    // Your logger will also receive this error
    console.error("Client not initialized. Call initialize() first.");
  } else if (error.code === "WASM_FETCH_ERROR") {
    console.error("Failed to load WASM module");
  } else {
    console.error("Unknown error:", error.message);
  }
}

// To capture logs, provide a logger when initializing:
await nepseClient.initialize({ logger });
```

## Common Issues

### SSL Certificate Error

If you encounter SSL certificate errors in Node.js:

```bash
# Linux/Mac
export NODE_TLS_REJECT_UNAUTHORIZED='0'

# Windows (PowerShell)
$env:NODE_TLS_REJECT_UNAUTHORIZED='0'

# Windows (CMD)
set NODE_TLS_REJECT_UNAUTHORIZED=0
```

Or in your code:

```javascript
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
```

> **Warning**: Disabling SSL verification should only be done in development/testing environments.

### WASM Not Supported

If your environment doesn't support WebAssembly:

```typescript
// Use pure TypeScript implementation
await nepseClient.initialize({ useWasm: false });
```


---

### Check if Market is Open

```typescript
import { nepseClient } from "nepse-api-helper";

await nepseClient.initialize();

const status = await nepseClient.getMarketStatus();

if (status.isOpen) {
  console.log("Market is open!");
} else {
  console.log("Market is closed");
}
```

### Get Top Securities

```typescript
import { nepseClient } from "nepse-api-helper";

await nepseClient.initialize();

const securities = await nepseClient.getSecurities();
const activeSecurities = securities.filter((s) => s.activeStatus === "A");

console.log(`Found ${activeSecurities.length} active securities`);
```

### Fetch Security Details

```typescript
import { nepseClient } from "nepse-api-helper";

await nepseClient.initialize({ logger });

const symbols = ["NIFRA", "NICL", "NABIL"];

for (const symbol of symbols) {
  try {
    const detail = await nepseClient.getSecurityDetail(symbol);
    console.log(`${symbol}: ${detail.name}`);
    console.log(`  LTP: ${detail.lastTradePrice}`);
  } catch (error) {
    console.error(`Failed to fetch ${symbol}:`, error.message);
  }
}
```


---

Run the test suite:

```bash
pnpm test
```


---

Contributions are welcome! This is my first npm package, so I appreciate:

- Bug reports
- Feature suggestions
- Documentation improvements
- Pull requests

Please feel free to open an issue or submit a PR.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/dahsameer/nepse-api-helper

# Install dependencies
cd nepse-api-helper
pnpm install

# Run tests
pnpm test

# Build
pnpm run build
```


---

The Unlicense


---

This library is provided "as is" without warranty of any kind. It is created for educational purposes only. The author is not responsible for any misuse or any consequences of using this library. Always ensure you comply with NEPSE's terms of service and applicable regulations.


---

## FAQ / Troubleshooting

**Q: Why do I get SSL errors?**
A: NEPSE's API uses a certificate that may not be trusted by Node.js. See "SSL Certificate Error" above for how to disable verification in dev.

**Q: How do I mock API calls for tests?**
A: Use a custom logger and mock `fetch` or `getAccessToken` in your tests. See `test/unit.spec.ts` for examples.

**Q: How do I use my own logger?**
A: Pass `{ logger }` to `initialize`. See the advanced example above.

**Q: How do I use the TypeScript fallback?**
A: Pass `{ useWasm: false }` to `initialize`.

**Q: How do I get the raw token for custom requests?**
A: Use `await nepseClient.getToken()` and pass it to `createHeaders(token)`.

**Q: How do I get the latest types?**
A: Import from `nepse-api-helper` or see [lib/types.ts](./lib/types.ts).

---

## Customization & Extensibility

- **Logger:** Inject any logger (console, winston, pino, etc.)
- **Fetch:** Mock or override fetch for tests
- **Caching:** Extend or replace cache logic in `lib/cache.ts`
- **Error Handling:** Catch `NepseError` and use error codes for robust handling
- **WASM/TS:** Use fallback logic for environments without WASM

---

**Working as of:** October 19, 2025

Since this library depends on NEPSE's API structure, it may break if NEPSE makes significant changes to their API. Please report any issues on the [GitHub issues page](https://github.com/dahsameer/nepse-api-helper/issues).

---
