#! /bin/bash
set -e

npm run build:web
npx pkgroll

