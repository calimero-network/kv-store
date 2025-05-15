import { ApiResponse } from '@calimero-network/calimero-client';

export interface SetEntryRequest {
  key: string;
  value: string;
}

export interface SetEntryResponse {}
export interface EntriesResponse {}

export enum ClientMethod {
  SET_ENTRY = 'set',
  ENTRIES = 'entries',
  LEN = 'len',
  GET_ENTRY = 'get',
  GET_UNCHECKED_ENTRY = 'get_unchecked',
  GET_RESULT_ENTRY = 'get_result',
  REMOVE_ENTRY = 'remove',
  CLEAR = 'clear',
}

export interface ClientApi {
  setEntry(params: SetEntryRequest): ApiResponse<SetEntryResponse>;
  entries(): ApiResponse<EntriesResponse>;
  len(): ApiResponse<number>;
  getEntry(key: string): ApiResponse<string>;
  getUncheckedEntry(key: string): ApiResponse<string>;
  getResultEntry(key: string): ApiResponse<string>;
  removeEntry(key: string): ApiResponse<string>;
  clear(): ApiResponse<string>;
}
