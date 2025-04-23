#!/bin/bash

# Go to root directory
cd "$(dirname "$0")"

# Install a utility to deduplicate node_modules
npm install -g npm-force-resolutions

# Go to frontend directory
cd src/univoice-dapp-frontend

# Temporary fix for the voiceossbuss.tsx file
cat > temp-fix.patch << EOF
--- src/utils/voiceossbuss.tsx-old
+++ src/utils/voiceossbuss.tsx
@@ -1,7 +1,6 @@
 import { Actor, HttpAgent } from "@dfinity/agent";
 import { Principal } from "@dfinity/principal";
 import { isLocalNet } from "@/utils/env";
-import { Ed25519KeyIdentity } from "@dfinity/identity";
 import {
   BucketCanister,
   ClusterCanister,
EOF

patch -p0 < temp-fix.patch

# Clean install with forced resolutions
rm -rf node_modules
npm install

echo "Dependencies fixed! Try running npm run build now." 