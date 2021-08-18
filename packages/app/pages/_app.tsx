import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { ThemeProvider } from 'styled-components';
import { MuiThemeProvider, StylesProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import theme from '../styles/theme';
import '../styles/globals.css';
import Router from 'next/router';
import { GlobalLinearProgress } from 'containers/GlobalLinearProgress';
import { StateProvider } from 'app/store';
import { Web3ReactProvider } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import ContractsWrapper from 'app/contracts';
import SwapChainModal from 'app/SwapChainModal';
import ElectionsProvider from '../app/elections';
import { SingleActionModalContainer } from 'components/Modal/SingleActionModalContainer';
import { DualActionModalContainer } from 'components/Modal/DualActionModalContainer';

function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

export default function MyApp(props) {
  const { Component, pageProps } = props;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Router.events.on('routeChangeStart', () => {
      setLoading(true);
    });
    Router.events.on('routeChangeComplete', () => {
      setLoading(false);
    });
    Router.events.on('routeChangeError', () => {
      setLoading(false);
    });
  }, []);

  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>Popcorn - DeFi for the People</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />

        <meta name="description" content="Earn high yield on your cryptoassets while creating real world impact. Our fees go directly towards non-profits" />

        {/*  Facebook Meta Tags */}
        <meta property="og:url" content="https://popcorn.network/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Popcorn - DeFi for the People" />
        <meta property="og:description" content="Earn high yield on your cryptoassets while creating real world impact. Our fees go directly towards non-profits of your choosing." />
        <meta property="og:image" content="https://popcorn.network/images/popcorn_network_rocket_2.png" />

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="popcorn.network" />
        <meta property="twitter:url" content="https://popcorn.network/" />
        <meta name="twitter:title" content="Popcorn - DeFi for the People" />
        <meta name="twitter:description" content="Earn high yield on your cryptoassets while creating real world impact. Our fees go directly towards non-profits of your choosing." />
        <meta name="twitter:image" content="https://popcorn.network/images/popcorn_network_rocket_2.png" />

        <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500&display=swap"
          rel="stylesheet"
        ></link>
      </Head>

      <StylesProvider injectFirst>
        <MuiThemeProvider theme={theme}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <GlobalLinearProgress visible={loading} />
            <Web3ReactProvider getLibrary={getLibrary}>
              <ContractsWrapper>
                <ElectionsProvider>
                  <StateProvider>
                    <SwapChainModal />
                    <SingleActionModalContainer />
                    <DualActionModalContainer />
                    <Component {...pageProps} />
                  </StateProvider>
                </ElectionsProvider>
              </ContractsWrapper>
            </Web3ReactProvider>
          </ThemeProvider>
        </MuiThemeProvider>
      </StylesProvider>
    </React.Fragment>
  );
}
