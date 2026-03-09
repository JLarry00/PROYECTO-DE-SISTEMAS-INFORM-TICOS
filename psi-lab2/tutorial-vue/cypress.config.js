const { defineConfig } = require('cypress')
require('dotenv').config({path: '.env.development'})   // carga .env del directorio actual

const VITE_LOCAL = process.env.VITE_LOCAL;

let baseUrl = '';
if (VITE_LOCAL === '1') {
  baseUrl = process.env.VITE_DEV_BASE_URL;
} else {
  baseUrl = process.env.VITE_PROD_BASE_URL;
}

module.exports = defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}',
    baseUrl: baseUrl
  },
  component: {
    specPattern: 'src/**/__tests__/*.{cy,spec}.{js,ts,jsx,tsx}',
    devServer: {
      framework: 'vue',
      bundler: 'vite'
    }
  }
})
