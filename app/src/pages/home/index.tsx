import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import {
  clientLogout,
  getAccessToken,
  getAppEndpointKey,
  getApplicationId,
  getContextId,
  getRefreshToken,
  NodeEvent,
  ResponseData,
  SubscriptionsClient,
} from '@calimero-network/calimero-client';

import {
  ClientApiDataSource,
  getWsSubscriptionsClient,
} from '../../api/dataSource/ClientApiDataSource';
import { EntriesResponse } from '../../api/clientApi';
import deleteIcon from '../../assets/delete.svg';

const FullPageCenter = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: #111111;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const TextStyle = styled.div`
  color: white;
  margin-bottom: 2em;
  font-size: 2em;
`;

const Button = styled.div`
  color: white;
  padding: 0.25em 1em;
  border-radius: 8px;
  font-size: 1em;
  background: #5dbb63;
  cursor: pointer;
  justify-content: center;
  display: flex;
`;

const ButtonReset = styled.div`
  color: white;
  padding: 0.25em 1em;
  border-radius: 8px;
  font-size: 1em;
  background: #ffa500;
  cursor: pointer;
  justify-content: center;
  display: flex;
  margin-top: 1rem;
`;

const LogoutButton = styled.div`
  color: black;
  margin-top: 2rem;
  padding: 0.25em 1em;
  border-radius: 8px;
  font-size: 1em;
  background: white;
  cursor: pointer;
  justify-content: center;
  display: flex;
`;

const AddEntryContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1em;
  margin-bottom: 1em;
`;

const EntriesContainer = styled.div`
  height: 300px;
  overflow-y: scroll;
  width: 100%;
  max-width: 500px;
  background: #222;
  border-radius: 8px;
  padding: 1em;
  margin-bottom: 1em;
`;

const EntriesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5em 0;
  border-bottom: 2px solid #444;
  color: #bbb;
  font-weight: bold;
  font-size: 1.1em;
  letter-spacing: 0.05em;
`;

const EntryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5em 0;
  border-bottom: 1px solid #333;
  color: white;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-left: 1em;
  display: flex;
  align-items: center;
`;

const NoEntries = styled.div`
  color: #aaa;
`;

const Input = styled.input`
  font-size: 1em;
  padding: 0.5em;
  border-radius: 4px;
`;

const ActionsRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2rem;
  margin-top: 0.5rem;
  justify-content: center;
`;

export default function HomePage() {
  const navigate = useNavigate();
  const url = getAppEndpointKey();
  const applicationId = getApplicationId();
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  const [key, setKey] = useState<string>('');
  const [value, setValue] = useState<string>('');
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    if (!url || !applicationId || !accessToken || !refreshToken) {
      navigate('/auth');
    }
  }, [accessToken, applicationId, navigate, refreshToken, url]);

  async function setEntry() {
    try {
      const result = await new ClientApiDataSource().setEntry({
        key: key,
        value: value,
      });
      if (result?.error) {
        console.error('Error:', result.error);
        window.alert(`${result.error.message}`);
        return;
      }
      // @ts-ignore
      if (result?.data.data == null) {
        window.alert('Entry set successfully');
      }
      await getEntries();
    } catch (e) {
      console.error('Error:', e);
      window.alert(`${e}`);
    }
  }

  async function getEntries() {
    const result: ResponseData<EntriesResponse> =
      await new ClientApiDataSource().entries();
    if (result?.error) {
      console.error('Error:', result.error);
      window.alert(`${result.error.message}`);
      return;
    }
    const entriesArray = result.data
      ? Object.entries(result.data).map(([key, value]) => ({ key, value }))
      : [];
    setEntries(entriesArray);
  }

  async function resetEntries() {
    const result: ResponseData<string> =
      await new ClientApiDataSource().clear();
    if (result?.error) {
      console.error('Error:', result.error);
      window.alert(`${result.error.message}`);
      return;
    }
    await getEntries();
  }

  async function handleRemoveEntry(entryKey: string) {
    try {
      const result = await new ClientApiDataSource().removeEntry(entryKey);
      if (result?.error) {
        console.error('Error:', result.error);
        window.alert(`${result.error.message}`);
        return;
      }
      await getEntries();
    } catch (e) {
      console.error('Error:', e);
      window.alert(`${e}`);
    }
  }

  useEffect(() => {
    if (accessToken) {
      getEntries();
    }
  }, [accessToken]);

  const observeNodeEvents = async () => {
    let subscriptionsClient: SubscriptionsClient = getWsSubscriptionsClient();
    await subscriptionsClient.connect();
    subscriptionsClient.subscribe([getContextId() ?? '']);

    subscriptionsClient?.addCallback((data: NodeEvent) => {
      if (
        'events' in data.data &&
        Array.isArray(data.data.events) &&
        data.data.events.length > 0
      ) {
        const event = data.data.events[0];
        if (event.data && Array.isArray(event.data)) {
          getEntries();
        }
      }
    });
  };

  useEffect(() => {
    observeNodeEvents();
  }, []);

  const logout = () => {
    clientLogout();
    navigate('/');
  };

  return (
    <FullPageCenter>
      <TextStyle>
        <span> Welcome to home page!</span>
      </TextStyle>
      <div style={{ marginBottom: '1em' }}>Add new entry</div>
      <AddEntryContainer>
        <Input
          type="text"
          placeholder="Key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Button onClick={setEntry}>Set Entry</Button>
      </AddEntryContainer>
      <EntriesContainer>
        <EntriesHeader>
          <span>Key</span>
          <span>Value</span>
          <span style={{ width: 24 }} />
        </EntriesHeader>
        {entries.length === 0 ? (
          <NoEntries>No entries</NoEntries>
        ) : (
          entries.map((entry, idx) => (
            <EntryRow key={idx}>
              <span>{entry.key}</span>
              <span>{entry.value}</span>
              <DeleteButton
                onClick={() => handleRemoveEntry(entry.key)}
                title="Delete entry"
              >
                <img src={deleteIcon as unknown as string} alt="delete" />
              </DeleteButton>
            </EntryRow>
          ))
        )}
      </EntriesContainer>
      <ButtonReset onClick={resetEntries}>Reset Entries</ButtonReset>
      <ActionsRow>
        <LogoutButton onClick={() => navigate('/context')}>
          Context Actions
        </LogoutButton>
        <LogoutButton onClick={logout}>Logout</LogoutButton>
      </ActionsRow>
    </FullPageCenter>
  );
}
