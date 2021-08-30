import React from "react";
import { Router } from "./router";
import ApplicationContextProvider from './context/Application';
import GlobalDataContextProvider from "./context/GlobalData";
import PairDataContextProvider from "./context/PairData";
import { Web3ReactProvider } from "@web3-react/core";
import * as ethers from "ethers";


export const getLibrary = (provider) => {
  const library = new ethers.providers.Web3Provider(provider);
  library.pollingInterval = 12000;
  return library
};

function ContextProvider({ children }) {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <ApplicationContextProvider>
        <GlobalDataContextProvider>
          <PairDataContextProvider>
            {children}
          </PairDataContextProvider>
        </GlobalDataContextProvider>
      </ApplicationContextProvider>
    </Web3ReactProvider>
  );
}

function App() {
  return (
    <ContextProvider>
      <Router/>
    </ContextProvider>
  );
}

export default App;
