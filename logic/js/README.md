# KV Store - JavaScript Implementation

JavaScript/TypeScript implementation of the KV Store using the Calimero JavaScript SDK.

This implementation mirrors the Rust version in `logic/rs/` and provides the same functionality:

- Key-value operations: `set`, `get`, `get_unchecked`, `get_result`, `remove`, `clear`, `entries`, `len`
- Event emission: `Inserted`, `Updated`, `Removed`, `Cleared`

## Prerequisites

- Node.js 18+ with WASI support
- pnpm ≥ 8 (or npm/yarn)
- Access to a Calimero node (`merod`) and CLI (`meroctl`)

## Installation

```bash
cd logic/js
pnpm install
```

## Build

```bash
# From the logic/js directory
pnpm run build

# Or from the root directory
pnpm run logic:build:js
```

This will compile the TypeScript code to WebAssembly and output `res/service.wasm`.

## Usage

After building, you can install and use the service:

```bash
# Install the application
meroctl --node-name <NODE> app install \
  --path logic/js/res/service.wasm \
  --context-id <CONTEXT_ID>

# Set a key-value pair
meroctl --node-name <NODE> call \
  --context-id <CONTEXT_ID> \
  --method set \
  --args '{"key": "hello", "value": "world"}'

# Get a value
meroctl --node-name <NODE> call \
  --context-id <CONTEXT_ID> \
  --method get \
  --args '{"key": "hello"}'

# Get all entries
meroctl --node-name <NODE> call \
  --context-id <CONTEXT_ID> \
  --method entries

# Remove a key
meroctl --node-name <NODE> call \
  --context-id <CONTEXT_ID> \
  --method remove \
  --args '{"key": "hello"}'

# Clear all entries
meroctl --node-name <NODE> call \
  --context-id <CONTEXT_ID> \
  --method clear
```

## Methods

### Mutations

- `set(key: string, value: string): void` - Set a key-value pair. Emits `Inserted` or `Updated` event.
- `remove(key: string): string` - Remove a key. Returns the removed value or null. Emits `Removed` event.
- `clear(): void` - Clear all entries. Emits `Cleared` event.

### Views (read-only)

- `get(key: string): string` - Get a value by key. Returns the value directly (or null), which becomes `{"output": "value"}` or `{"output": null}` when wrapped by the runtime.
- `get_unchecked(key: string): string` - Get a value by key, throws if not found. Returns the value directly.
- `get_result(key: string): string` - Get a value by key, returns error if not found. Returns the value directly or `{error: {kind: "NotFound", data: string}}`.
- `entries(): string` - Get all entries. Returns JSON with `Record<string, string>`.
- `len(): string` - Get the number of entries. Returns the number directly.

## Events

The service emits the following events:

- `Inserted` - Emitted when a new key-value pair is inserted
- `Updated` - Emitted when an existing key-value pair is updated
- `Removed` - Emitted when a key-value pair is removed
- `Cleared` - Emitted when all entries are cleared

## Architecture

The implementation uses:

- `@State` decorator to define the persisted state (`KvStore`)
- `@Logic` decorator to define the service logic (`KvStoreLogic`)
- `@Init` static method to initialize the state
- `@View()` decorator for read-only methods
- `@Event` decorator for event classes
- `UnorderedMap<string, string>` CRDT collection for key-value storage

## Development

The code is written in TypeScript and compiled to WebAssembly using the Calimero JavaScript SDK toolchain (Rollup → QuickJS → WASI).

### File Structure

```
logic/js/
├── src/
│   └── index.ts      # Main implementation
├── res/               # Build output (WASM files)
├── build/             # TypeScript build output
├── package.json       # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
└── build.sh           # Build script
```