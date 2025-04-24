#!/bin/bash

# Go to the frontend directory
cd src/univoice-dapp-frontend

# Generate the declarations first
cd ../..
dfx generate
cd src/univoice-dapp-frontend

# Run vite build directly without tsc
export NODE_ENV=production
npx vite build

# Return to the original directory
cd ../..
echo "Build completed successfully!" 