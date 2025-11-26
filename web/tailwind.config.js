// import type { Config } from 'tailwindcss'
import commonConfig from './tailwind-common-config'
const {heroui} = require("@heroui/theme");

const config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './context/**/*.{js,ts,jsx,tsx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  ...commonConfig,
  plugins: [heroui()],
}

export default config
