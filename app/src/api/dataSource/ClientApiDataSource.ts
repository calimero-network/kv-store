import {
  ApiResponse,
  JsonRpcClient,
  WsSubscriptionsClient,
  RpcError,
  handleRpcError,
  getAppEndpointKey,
  prepareAuthenticatedRequestConfig,
} from '@calimero-network/calimero-client';
import {
  ClientApi,
  ClientMethod,
  SetEntryRequest,
  SetEntryResponse,
  EntriesResponse,
} from '../clientApi';

export function getJsonRpcClient() {
  const appEndpointKey = getAppEndpointKey();
  if (!appEndpointKey) {
    throw new Error(
      'Application endpoint key is missing. Please check your configuration.',
    );
  }
  return new JsonRpcClient(appEndpointKey, '/jsonrpc');
}

export function getWsSubscriptionsClient() {
  const appEndpointKey = getAppEndpointKey();
  if (!appEndpointKey) {
    throw new Error(
      'Application endpoint key is missing. Please check your configuration.',
    );
  }
  return new WsSubscriptionsClient(appEndpointKey, '/ws');
}

export class ClientApiDataSource implements ClientApi {
  private async handleError(
    error: RpcError,
    params: any,
    callbackFunction: any,
  ) {
    if (error && error.code) {
      const response = await handleRpcError(error, getAppEndpointKey);
      if (response.code === 403) {
        return await callbackFunction(params);
      }
      return {
        error: await handleRpcError(error, getAppEndpointKey),
      };
    }
  }

  async setEntry(params: SetEntryRequest): ApiResponse<SetEntryResponse> {
    try {
      const { publicKey, contextId, config, error } =
        prepareAuthenticatedRequestConfig();
      if (error) {
        return { error };
      }

      const response = await getJsonRpcClient().execute<any, SetEntryResponse>(
        {
          contextId: contextId,
          method: ClientMethod.SET_ENTRY,
          argsJson: {
            key: params.key,
            value: params.value,
          },
          executorPublicKey: publicKey,
        },
        config,
      );
      if (response?.error) {
        return await this.handleError(response.error, {}, this.setEntry);
      }

      return {
        data: { count: Number(response?.result?.output) ?? 0 },
        error: null,
      };
    } catch (error) {
      console.error('setEntry failed:', error);
      let errorMessage = 'An unexpected error occurred during setEntry';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      return {
        error: {
          code: 500,
          message: errorMessage,
        },
      };
    }
  }

  async entries(): ApiResponse<EntriesResponse> {
    try {
      const { publicKey, contextId, config, error } =
        prepareAuthenticatedRequestConfig();
      if (error) {
        return { error };
      }

      const response = await getJsonRpcClient().execute<any, EntriesResponse>(
        {
          contextId,
          method: ClientMethod.ENTRIES,
          argsJson: {},
          executorPublicKey: publicKey,
        },
        config,
      );
      if (response?.error) {
        return await this.handleError(response.error, {}, this.entries);
      }

      return {
        data: response?.result?.output ?? {},
        error: null,
      };
    } catch (error) {
      console.error('entries failed:', error);
      let errorMessage = 'An unexpected error occurred during entries';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      return {
        error: {
          code: 500,
          message: errorMessage,
        },
      };
    }
  }

  async len(): ApiResponse<number> {
    try {
      const { publicKey, contextId, config, error } =
        prepareAuthenticatedRequestConfig();
      if (error) {
        return { error };
      }

      const response = await getJsonRpcClient().execute<any, number>(
        {
          contextId,
          method: ClientMethod.LEN,
          argsJson: {},
          executorPublicKey: publicKey,
        },
        config,
      );
      if (response?.error) {
        return await this.handleError(response.error, {}, this.len);
      }

      return {
        data: Number(response?.result?.output) ?? 0,
        error: null,
      };
    } catch (error) {
      console.error('len failed:', error);
      let errorMessage = 'An unexpected error occurred during len';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      return {
        error: {
          code: 500,
          message: errorMessage,
        },
      };
    }
  }

  async getEntry(key: string): ApiResponse<string> {
    try {
      const { publicKey, contextId, config, error } =
        prepareAuthenticatedRequestConfig();
      if (error) {
        return { error };
      }

      const response = await getJsonRpcClient().execute<any, string>(
        {
          contextId,
          method: ClientMethod.GET_ENTRY,
          argsJson: { key },
          executorPublicKey: publicKey,
        },
        config,
      );
      if (response?.error) {
        return await this.handleError(response.error, {}, this.getEntry);
      }

      return {
        data: response?.result?.output ?? '',
        error: null,
      };
    } catch (error) {
      console.error('getEntry failed:', error);
      let errorMessage = 'An unexpected error occurred during getEntry';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      return {
        error: {
          code: 500,
          message: errorMessage,
        },
      };
    }
  }

  async getUncheckedEntry(key: string): ApiResponse<string> {
    try {
      const { publicKey, contextId, config, error } =
        prepareAuthenticatedRequestConfig();
      if (error) {
        return { error };
      }

      const response = await getJsonRpcClient().execute<any, string>(
        {
          contextId,
          method: ClientMethod.GET_UNCHECKED_ENTRY,
          argsJson: { key },
          executorPublicKey: publicKey,
        },
        config,
      );
      if (response?.error) {
        return await this.handleError(
          response.error,
          {},
          this.getUncheckedEntry,
        );
      }

      return {
        data: response?.result?.output ?? '',
        error: null,
      };
    } catch (error) {
      console.error('getUncheckedEntry failed:', error);
      let errorMessage =
        'An unexpected error occurred during getUncheckedEntry';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      return {
        error: {
          code: 500,
          message: errorMessage,
        },
      };
    }
  }

  async getResultEntry(key: string): ApiResponse<string> {
    try {
      const { publicKey, contextId, config, error } =
        prepareAuthenticatedRequestConfig();
      if (error) {
        return { error };
      }

      const response = await getJsonRpcClient().execute<any, string>(
        {
          contextId,
          method: ClientMethod.GET_RESULT_ENTRY,
          argsJson: { key },
          executorPublicKey: publicKey,
        },
        config,
      );
      if (response?.error) {
        return await this.handleError(response.error, {}, this.getResultEntry);
      }

      return {
        data: response?.result?.output ?? '',
        error: null,
      };
    } catch (error) {
      console.error('getResultEntry failed:', error);
      let errorMessage = 'An unexpected error occurred during getResultEntry';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      return {
        error: {
          code: 500,
          message: errorMessage,
        },
      };
    }
  }

  async removeEntry(key: string): ApiResponse<string> {
    try {
      const { publicKey, contextId, config, error } =
        prepareAuthenticatedRequestConfig();
      if (error) {
        return { error };
      }

      const response = await getJsonRpcClient().execute<any, string>(
        {
          contextId,
          method: ClientMethod.REMOVE_ENTRY,
          argsJson: { key },
          executorPublicKey: publicKey,
        },
        config,
      );
      if (response?.error) {
        return await this.handleError(response.error, {}, this.removeEntry);
      }

      return {
        data: response?.result?.output ?? '',
        error: null,
      };
    } catch (error) {
      console.error('removeEntry failed:', error);
      let errorMessage = 'An unexpected error occurred during removeEntry';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      return {
        error: {
          code: 500,
          message: errorMessage,
        },
      };
    }
  }

  async clear(): ApiResponse<string> {
    try {
      const { publicKey, contextId, config, error } =
        prepareAuthenticatedRequestConfig();
      if (error) {
        return { error };
      }

      const response = await getJsonRpcClient().execute<any, string>(
        {
          contextId,
          method: ClientMethod.CLEAR,
          argsJson: {},
          executorPublicKey: publicKey,
        },
        config,
      );
      if (response?.error) {
        return await this.handleError(response.error, {}, this.clear);
      }

      return {
        data: response?.result?.output ?? '',
        error: null,
      };
    } catch (error) {
      console.error('clear failed:', error);
      let errorMessage = 'An unexpected error occurred during clear';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      return {
        error: {
          code: 500,
          message: errorMessage,
        },
      };
    }
  }
}
