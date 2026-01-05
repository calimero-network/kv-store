# KV Store - Demo application

This repository contains three independent parts:

- `logic/rs/` — Rust smart-contract (compiled to WASM)
- `logic/js/` — JavaScript/TypeScript smart-contract (compiled to WASM)
- `app/` — React frontend (Vite) that talks to the contract via generated ABI client

The folders are separate projects; treat each as its own repo.

## Prerequisites

- pnpm (or npm) for JavaScript tooling
- Rust toolchain + wasm target: `rustup target add wasm32-unknown-unknown`
- Optional: `wasm-opt` for size optimization

## Logic

This project includes two implementations of the KV store contract:

### Rust Implementation (`logic/rs/`)

```bash
pnpm run logic:build
```

Optional cleanup:

```bash
pnpm run logic:clean
```

**Contract capabilities:**

- Key-value operations: `set`, `get`, `remove`, `entries`, `len`, `clear`
- Utility: `get_result`, `get_unchecked`

**Events emitted:** `Inserted`, `Updated`, `Removed`, `Cleared`

**Build artifacts:**

- Built WASM outputs to `logic/rs/res/kv_store.wasm` (minified if `wasm-opt` is available)
- ABI JSON is generated at `logic/rs/res/abi.json`

### JavaScript/TypeScript Implementation (`logic/js/`)

```bash
pnpm run logic:build:js
```

Optional cleanup:

```bash
pnpm run logic:clean:js
```

**Contract capabilities:**

- Key-value operations: `set`, `get`, `remove`, `entries`, `len`, `clear`
- Utility: `get_result`, `get_unchecked`

**Events emitted:** `Inserted`, `Updated`, `Removed`, `Cleared`

**Build artifacts:**

- Built WASM outputs to `logic/js/res/service.wasm`
- Uses `@calimero-network/calimero-sdk-js` for contract development

**Prerequisites:**

- Node.js and pnpm
- QuickJS compiler (automatically downloaded via `@calimero-network/calimero-cli-js`)
- WASI-SDK and Binaryen (automatically downloaded)

## App (React)

```bash
cd app && pnpm install
```

Build and run:

```bash
pnpm --dir app build
pnpm --dir app dev
```

Open the app in your browser and connect to a running node.

Docs: https://calimero-network.github.io/build/quickstart

## Watchers and Dev Workflow

The root `app:dev` script runs the web app alongside a unified watcher for `logic/rs/res/`.

```bash
pnpm run app:dev
```

What happens:

- `logic:watch`: watches `logic/rs/res/**/*`
  - On `abi.json` change → runs codegen: `app:generate-client`
  - On `*.wasm` change → copies the changed file to data nodes via `logic:sync`

For JavaScript logic development:

```bash
pnpm run logic:watch:js
```

This watches `logic/js/res/**/*` and syncs WASM files to data nodes.

Key scripts (root `package.json`):

- `logic:build`: Build Rust contract
- `logic:build:js`: Build JavaScript contract
- `logic:watch`: `chokidar "logic/rs/res/**/*" -c "node scripts/on-res-change.mjs {path}"`
- `logic:watch:js`: `chokidar "logic/js/res/**/*" -c "node scripts/on-res-change.mjs {path}"`
- `logic:sync`: `bash ./scripts/sync-wasm.sh <path>` — copies to `data/calimero-node-1/` and `data/calimero-node-2/`
- `app:generate-client`: `npx @calimero-network/abi-codegen@0.1.1 -i logic/rs/res/abi.json -o app/src/api`
- `app:dev`: `concurrently` runs the Vite dev server and `logic:watch`

Notes:

- The watcher only triggers when `logic/rs/res/` or `logic/js/res/` changes. Make sure your build writes there.
- `sync-wasm.sh` copies by filename (basename) so any wasm produced in `res/` is propagated.

## ABI Codegen

Client types and a thin client are generated into `app/src/api` from `logic/rs/res/abi.json`.

- Ad-hoc run:

```bash
pnpm run app:generate-client
```

- This is also run automatically by the watcher on `abi.json` changes.

## Merobox (Local Network)

You can bootstrap a local network with Merobox:

**For Rust implementation:**

```bash
merobox bootstrap run workflows/workflow-example-rs.yml --near-devnet --contracts-dir /path/to/calimero-sdk-js/contracts/near
```

**For JavaScript implementation:**

```bash
merobox bootstrap run workflows/workflow-example-js.yml --near-devnet --contracts-dir /path/to/calimero-sdk-js/contracts/near
```

These workflows start local Calimero nodes whose data dirs live under `data/` and test the respective contract implementations.

## Typical Dev Loop

### Rust Contract Development

1. Start dev (web + watchers):

```bash
pnpm run app:dev
```

2. Edit Rust contract under `logic/rs/src` and build:

```bash
pnpm run logic:build
```

When the wasm in `logic/rs/res/` updates, the watcher copies it to `data/calimero-node-1/` and `data/calimero-node-2/` automatically.

3. If you change public methods or events, update ABI and regenerate client:

```bash
# If you produce a new ABI at logic/rs/res/abi.json
pnpm run app:generate-client
```

The watcher also regenerates automatically on `abi.json` changes.

### JavaScript Contract Development

1. Install dependencies:

```bash
cd logic/js && pnpm install
```

2. Edit TypeScript contract under `logic/js/src` and build:

```bash
pnpm run logic:build:js
```

3. Watch for changes and auto-sync:

```bash
pnpm run logic:watch:js
```

When the wasm in `logic/js/res/` updates, the watcher copies it to `data/calimero-node-1/` and `data/calimero-node-2/` automatically.

**Note:** The JavaScript implementation uses QuickJS, WASI-SDK, and Binaryen which are automatically downloaded during `pnpm install`. If you encounter issues, run `pnpm run verify-deps` in the `logic/js` directory to check dependencies.

## Troubleshooting

- If `concurrently` or `chokidar` are missing, install dev deps at repo root:

```bash
pnpm add -D concurrently chokidar-cli
```

- If ABI codegen fails due to missing schema, ensure you’re on `@calimero-network/abi-codegen@0.1.1` (the script pins this version).
