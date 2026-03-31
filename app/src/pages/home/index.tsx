import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
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
  Menu,
  MenuItem,
  MenuGroup,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  useToast,
  CopyToClipboard,
  Text,
} from '@calimero-network/mero-ui';
import { Trash } from '@calimero-network/mero-icons';
import translations from '../../constants/en.global.json';
import { useNavigate } from 'react-router-dom';
import { useMero, useSubscription, MeroJs } from '@calimero-network/mero-react';
import { KvStoreClient } from '../../generated/KvStoreClient';

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, contextId, contextIdentity, applicationId, nodeUrl, mero, logout } = useMero();
  const { show } = useToast();
  const [key, setKey] = useState<string>('');
  const [value, setValue] = useState<string>('');
  const [entries, setEntries] = useState<{ key: string; value: string }[]>([]);
  const loadingEntriesRef = useRef<boolean>(false);

  const client = useMemo(
    () => mero && contextId && contextIdentity
      ? new KvStoreClient(mero, contextId, contextIdentity)
      : null,
    [mero, contextId, contextIdentity],
  );

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const getEntries = useCallback(async () => {
    if (loadingEntriesRef.current || !client) return;
    loadingEntriesRef.current = true;
    try {
      const data = await client.entries();
      const entriesArray = Object.entries(data).map(([k, v]) => ({ key: k, value: v }));
      setEntries(entriesArray);
    } catch (error) {
      console.error('getEntries error:', error);
    } finally {
      loadingEntriesRef.current = false;
    }
  }, [client]);

  const setEntry = useCallback(async () => {
    if (!client) return;
    try {
      await client.set({ key, value });
      await getEntries();
      show({ title: `Successfully added entry: ${key}`, variant: 'success' });
      setKey('');
      setValue('');
    } catch (error) {
      show({
        title: error instanceof Error ? error.message : translations.home.errors.setFailed,
        variant: 'error',
      });
    }
  }, [client, key, value, getEntries, show]);

  const resetEntries = useCallback(async () => {
    if (!client) return;
    try {
      await client.clear();
      await getEntries();
      show({ title: 'All entries cleared successfully', variant: 'success' });
    } catch (error) {
      show({
        title: error instanceof Error ? error.message : translations.home.errors.clearFailed,
        variant: 'error',
      });
    }
  }, [client, getEntries, show]);

  const handleRemoveEntry = useCallback(
    async (entryKey: string) => {
      if (!client) return;
      try {
        await client.remove({ key: entryKey });
        await getEntries();
        show({ title: `Successfully removed entry: ${entryKey}`, variant: 'success' });
      } catch (error) {
        show({
          title: error instanceof Error ? error.message : translations.home.errors.removeFailed,
          variant: 'error',
        });
      }
    },
    [client, getEntries, show],
  );

  // Initial load
  useEffect(() => {
    if (isAuthenticated && contextId && contextIdentity) {
      getEntries();
    }
  }, [isAuthenticated, contextId, contextIdentity, getEntries]);

  // Real-time updates via SSE
  const contextIds = useMemo(
    () => (contextId ? [contextId] : []),
    [contextId],
  );
  const getEntriesRef = useRef(getEntries);
  getEntriesRef.current = getEntries;

  useSubscription(contextIds, () => {
    getEntriesRef.current();
  });

  const doLogout = useCallback(() => {
    logout();
    window.location.replace('/');
  }, [logout]);

  return (
    <>
      <MeroNavbar variant="elevated" size="md">
        <NavbarBrand text="KV Store" />
        <NavbarMenu align="center">
          {contextId && (
            <div
              style={{
                display: 'flex',
                gap: '1.5rem',
                alignItems: 'center',
                fontSize: '0.875rem',
                color: '#9ca3af',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              {nodeUrl && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Text size="sm" color="muted">Node:</Text>
                  <Text size="sm" style={{ fontFamily: 'monospace', color: '#e5e7eb' }}>
                    {nodeUrl.replace('http://', '').replace('https://', '')}
                  </Text>
                  <CopyToClipboard text={nodeUrl} variant="icon" size="small" successMessage="Node URL copied!" />
                </div>
              )}
              {applicationId && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Text size="sm" color="muted">App ID:</Text>
                  <Text size="sm" style={{ fontFamily: 'monospace', color: '#e5e7eb' }}>
                    {applicationId.slice(0, 8)}...{applicationId.slice(-8)}
                  </Text>
                  <CopyToClipboard text={applicationId} variant="icon" size="small" successMessage="Application ID copied!" />
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Text size="sm" color="muted">Context ID:</Text>
                <Text size="sm" style={{ fontFamily: 'monospace', color: '#e5e7eb' }}>
                  {contextId.slice(0, 8)}...{contextId.slice(-8)}
                </Text>
                <CopyToClipboard text={contextId} variant="icon" size="small" successMessage="Context ID copied!" />
              </div>
            </div>
          )}
        </NavbarMenu>
        <NavbarMenu align="right">
          {isAuthenticated ? (
            <Menu variant="compact" size="md">
              <MenuGroup>
                <MenuItem onClick={doLogout}>
                  {translations.home.logout}
                </MenuItem>
              </MenuGroup>
            </Menu>
          ) : (
            <NavbarItem>
              <Button variant="primary" onClick={() => navigate('/')}>
                Connect
              </Button>
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
          style={{ minHeight: '100vh', padding: '2rem' }}
        >
          <GridItem>
            <main
              style={{
                width: '100%',
                maxWidth: '1200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ maxWidth: '800px', width: '100%' }}>
                <Card variant="rounded" style={{ marginBottom: '2rem' }}>
                  <CardHeader>
                    <CardTitle>{translations.home.addEntry}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        setEntry();
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem',
                        width: '100%',
                      }}
                    >
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: '1rem',
                          width: '100%',
                        }}
                      >
                        <Input
                          type="text"
                          placeholder={translations.home.key}
                          value={key}
                          onChange={(e) => setKey(e.target.value)}
                          style={{ width: '100%' }}
                        />
                        <Input
                          type="text"
                          placeholder={translations.home.value}
                          value={value}
                          onChange={(e) => setValue(e.target.value)}
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', width: '100%', flexWrap: 'wrap' }}>
                        <Button type="submit" variant="success" style={{ flex: 1, minHeight: '3rem' }}>
                          {translations.home.setEntry}
                        </Button>
                        <Button variant="error" onClick={resetEntries} style={{ flex: 1, minHeight: '3rem' }}>
                          {translations.home.resetEntries}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
                <Card variant="rounded" style={{ width: '100%' }}>
                  <CardHeader>
                    <CardTitle>Key-Value Entries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {entries.length === 0 ? (
                      <div
                        style={{
                          color: '#aaa',
                          textAlign: 'center',
                          padding: '3rem 2rem',
                          fontSize: '1.1rem',
                          fontStyle: 'italic',
                        }}
                      >
                        {translations.home.noEntries}
                      </div>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <Table
                          columns={[
                            { title: translations.home.key, key: 'key' },
                            { title: translations.home.value, key: 'value' },
                            {
                              key: 'actions',
                              title: 'Actions',
                              render: (_value: any, row: any) => (
                                <Button
                                  variant="error"
                                  onClick={() => handleRemoveEntry(row.key)}
                                  style={{ padding: '8px 12px', minWidth: 'auto', borderRadius: '6px' }}
                                >
                                  <Trash size={16} />
                                </Button>
                              ),
                              width: 120,
                              align: 'center',
                            },
                          ]}
                          data={entries}
                          zebra
                          compact
                          stickyHeader
                          style={{ minWidth: '100%' }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </main>
          </GridItem>
        </Grid>
      </div>
    </>
  );
}
