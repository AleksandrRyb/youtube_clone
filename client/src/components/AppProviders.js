import React from "react";
import { ThemeProvider } from "styled-components";
import { BrowserRouter as Router } from "react-router-dom";
import GlobalStyle from "../styles/GlobalStyle";
import { darkTheme } from "../styles/theme";

function AppProviders({ children }) {
  return (
    <Router>
      <ThemeProvider theme={darkTheme}>
        <GlobalStyle />
        {children}
      </ThemeProvider>
    </Router>
  );
}

export default AppProviders;
