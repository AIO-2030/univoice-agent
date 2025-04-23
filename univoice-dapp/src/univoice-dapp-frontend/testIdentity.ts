import { Ed25519KeyIdentity } from "@dfinity/identity";

// Test the identity creation
const keyBytes = new Uint8Array(32);
// Fill with some test data
for (let i = 0; i < 32; i++) {
  keyBytes[i] = i;
}

console.log("Key bytes:", keyBytes);

// Let's check what methods are available
console.log("Available methods:", Object.getOwnPropertyNames(Ed25519KeyIdentity));

// Try different approaches to create an identity
try {
  // Method 1: fromSecretKey with ArrayBuffer
  const identity1 = Ed25519KeyIdentity.fromSecretKey(keyBytes.buffer);
  console.log("Method 1 worked: identity1 created");
} catch (e) {
  console.error("Method 1 failed:", e);
}

try {
  // Method 2: fromSecretKey with Uint8Array
  const identity2 = Ed25519KeyIdentity.fromSecretKey(keyBytes);
  console.log("Method 2 worked: identity2 created");
} catch (e) {
  console.error("Method 2 failed:", e);
}

try {
  // Method 3: use generate with seed
  const identity3 = Ed25519KeyIdentity.generate(keyBytes);
  console.log("Method 3 worked: identity3 created");
} catch (e) {
  console.error("Method 3 failed:", e);
} 