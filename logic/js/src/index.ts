import {
  State,
  Logic,
  Init,
  View,
  Event,
  emitWithHandler,
} from "@calimero-network/calimero-sdk-js";
import { UnorderedMap } from "@calimero-network/calimero-sdk-js/collections";
import * as env from "@calimero-network/calimero-sdk-js/env";

@Event
export class Inserted {
  constructor(public key: string, public value: string) {}
}

@Event
export class Updated {
  constructor(public key: string, public value: string) {}
}

@Event
export class Removed {
  constructor(public key: string) {}
}

@Event
export class Cleared {}

@State
export class KvStore {
  items: UnorderedMap<string, string>;

  constructor() {
    this.items = new UnorderedMap<string, string>();
  }
}

@Logic(KvStore)
export class KvStoreLogic extends KvStore {
  @Init
  static init(): KvStore {
    env.log("Initializing KvStore");
    return new KvStore();
  }

  set(
    arg1: { key: string; value: string } | string,
    maybeValue?: string
  ): void {
    const key = typeof arg1 === "string" ? arg1 : arg1.key;
    const value = typeof arg1 === "string" ? maybeValue ?? "" : arg1.value;

    env.log(`Setting key: ${key} to value: ${value}`);

    const exists = this.items.has(key);

    if (exists) {
      emitWithHandler(new Updated(key, value), "updateHandler");
    } else {
      emitWithHandler(new Inserted(key, value), "insertHandler");
    }

    this.items.set(key, value);
  }

  @View()
  entries(): string {
    env.log("Getting all entries");
    const result: Record<string, string> = Object.create(null);
    for (const [key, value] of this.items.entries()) {
      result[key] = value;
    }
    return this.respond(result);
  }

  @View()
  len(): string {
    env.log("Getting the number of entries");
    return this.respond(this.items.entries().length);
  }

  @View()
  get(key: string): string {
    env.log(`Getting key: ${key}`);
    const value = this.items.get(key);
    return this.respond(value ?? null);
  }

  @View()
  get_unchecked(key: string): string {
    env.log(`Getting key without checking: ${key}`);
    const value = this.items.get(key);
    if (value === undefined) {
      throw new Error(`key not found: ${key}`);
    }
    return this.respond(value);
  }

  @View()
  get_result(key: string): string {
    env.log(`Getting key, possibly failing: ${key}`);
    const value = this.items.get(key);
    if (value === undefined) {
      return this.respond({
        error: {
          kind: "NotFound",
          data: key,
        },
      });
    }
    return this.respond(value);
  }

  remove(key: string): string {
    env.log(`Removing key: ${key}`);
    const value = this.items.get(key);
    if (value !== undefined) {
      emitWithHandler(new Removed(key), "removeHandler");
      this.items.remove(key);
    }
    return this.respond(value ?? null);
  }

  clear(): void {
    env.log("Clearing all entries");
    emitWithHandler(new Cleared(), "clearHandler");
    for (const [key] of this.items.entries()) {
      this.items.remove(key);
    }
  }

  private respond(payload: unknown): string {
    return JSON.stringify(payload);
  }

  // Event handlers (optional, for logging/debugging)
  private insertHandler(event: Inserted): void {
    env.log(`[kv-store] Item inserted: key=${event.key}, value=${event.value}`);
  }

  private updateHandler(event: Updated): void {
    env.log(`[kv-store] Item updated: key=${event.key}, value=${event.value}`);
  }

  private removeHandler(event: Removed): void {
    env.log(`[kv-store] Item removed: key=${event.key}`);
  }

  private clearHandler(_event: Cleared): void {
    env.log("[kv-store] Store cleared");
  }
}
