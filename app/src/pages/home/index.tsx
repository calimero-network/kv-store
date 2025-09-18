import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Button,
  Input,
  Table,
  Navbar as MeroNavbar,
  NavbarBrand,
  NavbarMenu,
  NavbarItem,
  Grid,
  GridItem,
} from '@calimero-network/mero-ui';
import { Trash } from '@calimero-network/mero-icons';
import translations from '../../constants/en.global.json';
import { useNavigate } from 'react-router-dom';
import {
  useCalimero,
  CalimeroConnectButton,
  ConnectionType,
} from '@calimero-network/calimero-client';
import { createKvClient, AbiClient } from '../../features/kv/api';

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, app } = useCalimero();
  const [key, setKey] = useState<string>('');
  const [value, setValue] = useState<string>('');
  const [entries, setEntries] = useState<any[]>([]);
  const [api, setApi] = useState<AbiClient | null>(null);
  const loadingEntriesRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Create API client when app is available
  useEffect(() => {
    if (!app) return;

    const initializeApi = async () => {
      try {
        const client = await createKvClient(app);
        setApi(client);
      } catch (error) {
        console.error('Failed to create API client:', error);
        window.alert('Failed to initialize API client');
      }
    };

    initializeApi();
  }, [app]);

  const getEntries = useCallback(async () => {
    if (loadingEntriesRef.current || !api) return;
    loadingEntriesRef.current = true;
    try {
      const data = await api.entries();
      const entriesArray = Object.entries(data).map(([k, v]) => ({
        key: k,
        value: v,
      }));
      setEntries(entriesArray);
    } catch (error) {
      console.error('getEntries error:', error);
      window.alert(
        error instanceof Error
          ? error.message
          : translations.home.errors.loadFailed,
      );
    } finally {
      loadingEntriesRef.current = false;
    }
  }, [api]);

  const setEntry = useCallback(async () => {
    if (!api) return;
    try {
      await api.set({ key, value });
      await getEntries();
    } catch (error) {
      console.error('setEntry error:', error);
      window.alert(
        error instanceof Error
          ? error.message
          : translations.home.errors.setFailed,
      );
    }
  }, [api, key, value, getEntries]);

  const resetEntries = useCallback(async () => {
    if (!api) return;
    try {
      await api.clear();
      await getEntries();
    } catch (error) {
      console.error('resetEntries error:', error);
      window.alert(
        error instanceof Error
          ? error.message
          : translations.home.errors.clearFailed,
      );
    }
  }, [api, getEntries]);

  const handleRemoveEntry = useCallback(
    async (entryKey: string) => {
      if (!api) return;
      try {
        await api.remove({ key: entryKey });
        await getEntries();
      } catch (error) {
        console.error('removeEntry error:', error);
        window.alert(
          error instanceof Error
            ? error.message
            : translations.home.errors.removeFailed,
        );
      }
    },
    [api, getEntries],
  );

  useEffect(() => {
    if (isAuthenticated && api) {
      getEntries();
    }
  }, [isAuthenticated, api, getEntries]);

  // Websocket event subscription removed; rely on manual refresh after mutations

  const doLogout = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  return (
    <>
      <MeroNavbar variant="elevated" size="md">
        <NavbarBrand text="KV Store" />
        <NavbarMenu align="right">
          {isAuthenticated ? (
            <NavbarItem>
              <Button variant="secondary" onClick={doLogout}>
                Logout
              </Button>
            </NavbarItem>
          ) : (
            <NavbarItem>
              <CalimeroConnectButton
                connectionType={{
                  type: ConnectionType.Custom,
                  url: 'http://node1.127.0.0.1.nip.io',
                }}
              />
            </NavbarItem>
          )}
        </NavbarMenu>
      </MeroNavbar>
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#111111',
          color: 'white',
        }}
      >
        <Grid
          columns={1}
          gap={32}
          maxWidth="100%"
          justify="center"
          align="center"
          style={{
            minHeight: '100vh',
            padding: '2rem',
          }}
        >
          <GridItem>
            <main
              style={{
                width: '100%',
                maxWidth: '1200px',
              }}
            >
              <div style={{ maxWidth: '800px', width: '100%' }}>
                <div style={{ marginBottom: '1em', fontSize: '1.2em' }}>
                  {translations.home.addEntry}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setEntry();
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      marginBottom: '1rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <Input
                      type="text"
                      placeholder={translations.home.key}
                      value={key}
                      onChange={(e) => setKey(e.target.value)}
                    />
                    <Input
                      type="text"
                      placeholder={translations.home.value}
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                    />
                  </div>
                  <div
                    style={{
                      width: '100%',
                      display: 'flex',
                      gap: '1rem',
                      marginTop: '0.25rem',
                    }}
                  >
                    <Button
                      type="submit"
                      variant="warning"
                      style={{
                        backgroundColor: '#5dbb63',
                        color: '#111',
                        flex: 1,
                      }}
                    >
                      {translations.home.setEntry}
                    </Button>
                    <Button
                      variant="error"
                      onClick={resetEntries}
                      style={{
                        flex: 1,
                      }}
                    >
                      {translations.home.resetEntries}
                    </Button>
                  </div>
                </form>
                {entries.length === 0 ? (
                  <div
                    style={{
                      color: '#aaa',
                      marginBottom: '1em',
                      marginTop: '2rem',
                    }}
                  >
                    {translations.home.noEntries}
                  </div>
                ) : (
                  <div style={{ marginTop: '2rem' }}>
                    <Table
                      columns={[
                        { header: translations.home.key, key: 'key' },
                        { header: translations.home.value, key: 'value' },
                        {
                          header: '',
                          render: (_value: any, row: any) => (
                            <button
                              onClick={() => handleRemoveEntry(row.key)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ef4444',
                              }}
                              title="Delete entry"
                            >
                              <Trash size={16} />
                            </button>
                          ),
                          width: 96,
                          align: 'right',
                        },
                      ]}
                      data={entries}
                      zebra
                      compact
                      stickyHeader
                    />
                  </div>
                )}
              </div>
            </main>
          </GridItem>
        </Grid>
      </div>
    </>
  );
}
