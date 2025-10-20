#!/bin/bash

# Remove old dependencies and lock file
rm package-lock.json
rm -rf node_modules

# Run a fresh install, which will generate a new, synchronized lock file
npm install

# Run the regular build
npm run build
