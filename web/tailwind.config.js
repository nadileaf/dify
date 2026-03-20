import commonConfig from './tailwind-common-config.ts'
const {heroui} = require("@heroui/theme");

const config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './context/**/*.{js,ts,jsx,tsx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
    './node_modules/streamdown/dist/*.js',
    './node_modules/@streamdown/math/dist/*.js',
    '!./**/*.{spec,test}.{js,ts,jsx,tsx}',
  ],
  ...commonConfig,
  plugins: [heroui()],
}

export default config
