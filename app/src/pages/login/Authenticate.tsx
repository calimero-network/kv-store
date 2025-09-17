import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Grid,
  GridItem,
  Navbar as MeroNavbar,
  NavbarBrand,
  NavbarMenu,
  NavbarItem,
} from '@calimero-network/mero-ui';
import {
  useCalimero,
  CalimeroConnectButton,
  ConnectionType,
} from '@calimero-network/calimero-client';
import translations from '../../constants/en.global.json';

export default function Authenticate() {
  const navigate = useNavigate();
  const { isAuthenticated } = useCalimero();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  return (
    <>
      <MeroNavbar variant="elevated" size="md">
        <NavbarBrand text="KV Store" />
        <NavbarMenu align="right">
          <NavbarItem>
            <CalimeroConnectButton
              connectionType={{
                type: ConnectionType.Custom,
                url: 'http://node1.127.0.0.1.nip.io',
              }}
            />
          </NavbarItem>
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
          columns={12}
          gap={16}
          maxWidth="100%"
          justify="center"
          align="center"
        >
          <GridItem colSpan={10} colStart={2}>
            <main
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '80vh',
              }}
            >
              <div style={{ width: '100%', maxWidth: '1000px' }}>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {translations.auth.description.subtitle}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <p
                        style={{
                          color: '#ccc',
                          marginBottom: '1rem',
                          fontSize: '0.9em',
                        }}
                      >
                        {translations.home.demoDescription}
                      </p>
                      <p
                        style={{
                          color: '#888',
                          marginBottom: '1.5rem',
                          fontSize: '0.85em',
                        }}
                      >
                        {translations.home.calimeroIntro}
                      </p>
                      <h3
                        style={{
                          color: 'white',
                          marginBottom: '0.75rem',
                          fontSize: '0.9em',
                        }}
                      >
                        Features:
                      </h3>
                      <ul
                        style={{
                          color: '#ccc',
                          lineHeight: '1.4',
                          paddingLeft: '1rem',
                          fontSize: '0.85em',
                        }}
                      >
                        {translations.auth.description.features.map(
                          (feature, index) => (
                            <li key={index} style={{ marginBottom: '0.25rem' }}>
                              {feature}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '1.5rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      <Button
                        variant="secondary"
                        onClick={() =>
                          window.open(
                            'https://docs.calimero.network',
                            '_blank',
                            'noopener,noreferrer',
                          )
                        }
                      >
                        {translations.home.documentation}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() =>
                          window.open(
                            'https://github.com/calimero-network',
                            '_blank',
                            'noopener,noreferrer',
                          )
                        }
                      >
                        {translations.home.github}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() =>
                          window.open(
                            'https://calimero.network',
                            '_blank',
                            'noopener,noreferrer',
                          )
                        }
                      >
                        {translations.home.website}
                      </Button>
                    </div>
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
