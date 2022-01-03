import "@babel/polyfill";

import React from 'react';
import ReactDOM from 'react-dom';

import { ChakraProvider, extendTheme } from "@chakra-ui/react"

import App from './app';


const config = {
  // initialColorMode: "dark",
  // useSystemColorMode: false,
};

const theme = extendTheme({ config });


ReactDOM.render(<ChakraProvider theme={theme}><App/></ChakraProvider>, document.getElementById('app'));
