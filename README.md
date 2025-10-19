# nepse-api-helper

[![npm version](https://img.shields.io/npm/v/nepse-api-helper.svg)](https://www.npmjs.com/package/nepse-api-helper)
[![License: MIT](https://img.shields.io/badge/License-The%20Unlicense-yellow.svg)](https://opensource.org/license/unlicense)

A TypeScript/JavaScript library that simplifies interaction with the NEPSE (Nepal Stock Exchange) API by handling authentication, token management, and API requests.

> **Educational Purpose Only**: This library is created for educational purposes to understand API interactions and is not affiliated with or endorsed by NEPSE.

## Features

- **Automatic Token Management**: Handles token generation and caching automatically
- **Dual Implementation**: Choose between WebAssembly or pure TypeScript implementations
- **Built-in Caching**: Reduces API calls with intelligent caching mechanisms
- **TypeScript Support**: Fully typed for better developer experience
- **Cross-Platform**: Works in Node.js and modern browsers (but probably won't work in browser because of CORS)
- **Easy to Use**: Simple, intuitive API

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

## Quick Start

```typescript
import { nepseClient } from "nepse-api-helper";

// Initialize the client (required before any API calls)
await nepseClient.initialize();

// Get all securities
const securities = await nepseClient.getSecurities();
console.log(securities);

// Get details of a specific security
const nifraDetails = await nepseClient.getSecurityDetail("NIFRA");
console.log(nifraDetails);

// Check market status
const marketStatus = await nepseClient.getMarketStatus();
console.log(`Market is ${marketStatus.isOpen ? "open" : "closed"}`);
```

## Initialization Options

The library supports two initialization modes:

### 1. WebAssembly Mode (Default)

Uses the latest deobfuscation logic from NEPSE's WASM module. **Recommended for production use** to ensure compatibility with the latest NEPSE API.

```typescript
await nepseClient.initialize(); // Uses WASM by default

// Or explicitly:
await nepseClient.initialize({ useWasm: true });
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

## API Reference

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

For endpoints not covered by the library, you can use the token to make custom requests:

```typescript
import { nepseClient, createHeaders, BASE_URL } from "nepse-api-helper";

// Initialize and get token
await nepseClient.initialize();
const token = await nepseClient.getToken();

// Make custom API call
const response = await fetch(`${BASE_URL}/api/nots/securityDailyTradeStat/58`, {
  method: "GET",
  headers: createHeaders(token),
});

const data = await response.json();
```

### Utility Functions

#### `createHeaders(token)`

Creates headers object for NEPSE API requests.

```typescript
const headers = createHeaders(token);
// Returns: Headers object with Authorization and other required headers
```

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

## Error Handling

The library throws descriptive errors with error codes:

```typescript
try {
  await nepseClient.getSecurities();
} catch (error) {
  if (error.code === "NOT_INITIALIZED") {
    console.error("Client not initialized. Call initialize() first.");
  } else if (error.code === "WASM_FETCH_ERROR") {
    console.error("Failed to load WASM module");
  } else {
    console.error("Unknown error:", error.message);
  }
}
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

## Examples

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

await nepseClient.initialize();

const symbols = ["NIFRA", "NICL", "NABIL"];

for (const symbol of symbols) {
  try {
    const detail = await nepseClient.getSecurityDetail(symbol);
    console.log(`${symbol}: ${detail.securityName}`);
    console.log(`  LTP: ${detail.lastTradedPrice}`);
  } catch (error) {
    console.error(`Failed to fetch ${symbol}:`, error.message);
  }
}
```

## Testing

Run the test suite:

```bash
pnpm test
```

## Contributing

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

## License

The Unlicense

## Disclaimer

This library is provided "as is" without warranty of any kind. It is created for educational purposes only. The author is not responsible for any misuse or any consequences of using this library. Always ensure you comply with NEPSE's terms of service and applicable regulations.

## Status

**Working as of:** October 19, 2025

Since this library depends on NEPSE's API structure, it may break if NEPSE makes significant changes to their API. Please report any issues on the [GitHub issues page](https://github.com/dahsameer/nepse-api-helper/issues).

---
