import * as rootPackage from '@namesmt/utils-lambda'
import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'

console.log({ rootPackage: JSON.stringify(rootPackage) })

export default defineConfig({
  plugins: [
    Inspect(),
  ],
})
