import React from "react";
import { ThemeProvider } from "styled-components";
import { BrowserRouter as Router } from "react-router-dom";
import GlobalStyle from "../styles/GlobalStyle";
import { darkTheme } from "../styles/theme";
import { AuthProvider } from "context/auth-context";
import { ReactQueryConfigProvider } from "react-query";
import { ReactQueryDevtools } from "react-query-devtools";

const config = {
  queries: {
    refetchOnWindowFocus: false,
    retry(failureCount, error) {
      if (error.status === 404) return false;
      else if (failureCount < 2) return true;
      else return false;
    },
  },
};

function AppProviders({ children }) {
  return (
    <ReactQueryConfigProvider config={config}>
      <Router>
        <AuthProvider>
          <ThemeProvider theme={darkTheme}>
            <GlobalStyle />
            <ReactQueryDevtools />
            {children}
          </ThemeProvider>
        </AuthProvider>
      </Router>
    </ReactQueryConfigProvider>
  );
}

export default AppProviders;
