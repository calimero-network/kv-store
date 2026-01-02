#!/bin/bash
set -e

cd "$(dirname $0)"

echo "Building kv-store JavaScript implementation..."

# Ensure res directory exists
mkdir -p res

# Build the WASM
pnpm build

echo "✅ Build complete: res/service.wasm"

