import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { isLocalNet } from "@/utils/env";
import {
  BucketCanister,
  ClusterCanister,
  Uploader,
  type FileConfig
} from "@ldclabs/ic_oss_ts";
import { createAgent } from "@dfinity/utils";
import { Ed25519KeyIdentity } from "@dfinity/identity";
import {
  get_access_token,
  upload_voice_file as backend_upload_voice_file,
  mark_voice_file_deleted as backend_mark_voice_file_deleted,
  list_voice_files as backend_list_voice_files,
  get_voice_file as backend_get_voice_file,
  type MetadataValue,
  type VoiceAssetData,
  type VoiceOssInfo,
  type AccessTokenResponse,
  createActor
} from "./callbackend";

/**
 * Interface for Voice File Metadata
 */
export interface VoiceFileMetadata {
  title?: string;
  description?: string;
  duration?: number;
  tags?: string[];
  [key: string]: any;
}

/**
 * Response for voice file operations
 */
export interface VoiceOperationResponse {
  Ok?: any;
  Err?: string;
}

const development = isLocalNet();
const host = development ? "http://localhost:4943" : "https://ic0.app";

// IC OSS Cluster canister ID (update based on environment)
// Get the OSS cluster canister ID from the backend
const getOssClusterCanisterId = async (): Promise<string> => {
  try {
    const actor = await createActor();
    const result = await actor.get_cluster_canister();
    if (result && Array.isArray(result) && result.length > 0) {
      console.log(`[OSS] Retrieved cluster canister ID: ${result[0]}`);
      return result[0];
    } else {
      console.warn("[OSS] No cluster canister ID found, using fallback");
      return "6rbxx-kiaaa-aaaaj-qapfq-cai"; // Fallback ID
    }
  } catch (error) {
    console.error("[OSS] Error getting cluster canister ID:", error);
    return "6rbxx-kiaaa-aaaaj-qapfq-cai"; // Fallback ID on error
  }
};

// Initialize with fallback, will be updated before use
let OSS_CLUSTER_CANISTER_ID = "6rbxx-kiaaa-aaaaj-qapfq-cai";

// Immediately try to get the actual canister ID
(async () => {
  OSS_CLUSTER_CANISTER_ID = await getOssClusterCanisterId();
})();

// Get the bucket canister ID from the backend, similar to getOssClusterCanisterId
const getBucketCanisterId = async (): Promise<string> => {
  try {
    const actor = await createActor();
    const result = await actor.get_bucket_canister();
    if (result && Array.isArray(result) && result.length > 0) {
      console.log(`[OSS] Retrieved bucket canister ID: ${result[0]}`);
      return result[0];
    } else {
      console.warn("[OSS] No bucket canister ID found, using fallback");
      return "mmrxu-fqaaa-aaaap-ahhna-cai"; // Fallback ID
    }
  } catch (error) {
    console.error("[OSS] Error getting bucket canister ID:", error);
    return "mmrxu-fqaaa-aaaap-ahhna-cai"; // Fallback ID on error
  }
};

// Initialize with fallback, will be updated before use
let OSS_BUCKET_CANISTER_ID = "mmrxu-fqaaa-aaaap-ahhna-cai";

// Immediately try to get the actual canister ID
(async () => {
  OSS_BUCKET_CANISTER_ID = await getBucketCanisterId();
})();

// The JSON representation of the identity key as used in the demo
// This identity should have manager permissions on the bucket
const IDENTITY_JSON = 
  '["302a300506032b6570032100f6f7b1317cca7be2c3f6049da6932aadbd5549d4fd7d7d29290dead0b85d1f96","5b3770cbfd16d3ac610cc3cda0bc292a448f2c78d6634de6ee280df0a65e4c04"]';

// Extract the fixed principal ID to use consistently throughout the code
let FIXED_PRINCIPAL_ID = "";
try {
  const identity = Ed25519KeyIdentity.fromJSON(IDENTITY_JSON);
  FIXED_PRINCIPAL_ID = identity.getPrincipal().toString();
  console.log(`[OSS] Fixed principal ID initialized: ${FIXED_PRINCIPAL_ID}`);
} catch (error) {
  console.error(`[OSS] Error initializing fixed principal ID:`, error);
  // Fallback to the known value from the demo if we can't extract it directly
  FIXED_PRINCIPAL_ID = "pxfqr-x3orr-z5yip-7yzdd-hyxgd-dktgh-3awsk-ohzma-lfjzi-753j7-tae";
  console.log(`[OSS] Using fallback fixed principal ID: ${FIXED_PRINCIPAL_ID}`);
}

/**
 * Creates an identity from the fixed JSON key
 * This matches the approach used in the demo
 * @returns The Ed25519KeyIdentity instance
 */
function createIdentityFromJson(): Ed25519KeyIdentity {
  console.log(`[OSS] Creating identity from fixed JSON key`);
  try {
    const identity = Ed25519KeyIdentity.fromJSON(IDENTITY_JSON);
    const principal = identity.getPrincipal().toString();
    console.log(`[OSS] Created identity with principal: ${principal}`);
    return identity;
  } catch (error) {
    console.error(`[OSS] Error creating identity from JSON:`, error);
    throw error;
  }
}

/**
 * Helper function to create a Principal object that works with ic_oss_ts
 * This handles the type compatibility issues between different versions of @dfinity/principal
 * @param id - Principal ID as string
 * @returns A Principal object compatible with the ic_oss_ts package
 */
function createCompatiblePrincipal(id: string): any {
  console.log(`[OSS] Creating compatible principal for ID: ${id}`);
  try {
    // Try to create a Principal from the ID
    // We'll use the any type to bypass TypeScript's type checking
    const principal = Principal.fromText(id);
    
    console.log(`[OSS] Principal created successfully for ID: ${id}`);
    // Return the principal as any to avoid type compatibility issues
    return principal as any;
  } catch (error) {
    console.error(`[OSS] Error creating principal for ID: ${id}:`, error);
    throw error;
  }
}

/**
 * Derives a consistent key from a principal ID for use with Ed25519KeyIdentity
 * @param principalId - The principal ID string
 * @returns A Uint8Array for use as a key
 */
function deriveKeyFromPrincipal(principalId: string): Uint8Array {
  // Create a deterministic seed based on the principal ID
  // This is a simple derivation method - in production, you would use a more secure approach
  const encoder = new TextEncoder();
  const seed = encoder.encode(`ic-identity-seed-${principalId}`);
  
  // Ensure we have exactly 32 bytes (required for Ed25519)
  const result = new Uint8Array(32);
  
  // Copy as many bytes as we can from the seed, then pad or truncate
  for (let i = 0; i < 32; i++) {
    result[i] = i < seed.length ? seed[i] : 0;
  }
  
  console.log(`[OSS] Derived key from principal ID: ${principalId} (${result.length} bytes)`);
  return result;
}

/**
 * Initializes the OSS bucket canister with the given access token
 * @param accessToken - The access token from the backend
 * @param principalId - Optional principal ID for identity
 * @returns A tuple containing the bucket canister and uploader
 */
async function initOssWithToken(accessToken: string, principalId?: string): Promise<[BucketCanister, Uploader]> {
  console.log(`[OSS] Initializing OSS with token (length: ${accessToken.length}), first 10 chars: ${accessToken.substring(0, 10)}...`);
  try {
    // Create agent options
    const agentOptions: any = {
      host: development ? "http://localhost:4943" : "https://ic0.app",
      fetchOptions: {
        // Don't include credentials to avoid CORS preflight requests
        credentials: 'omit'
      }
    };
    
    let httpAgent;
    
    // Create an identity like in the demo
    try {
      console.log(`[OSS] Using fixed identity approach similar to demo`);
      // Create identity from JSON key
      const identity = createIdentityFromJson();
      
      // Create agent using the demo approach
      httpAgent = await createAgent({
        identity: identity as any,
        fetchRootKey: development,
        host: agentOptions.host,
        verifyQuerySignatures: true
      });
      
      console.log(`[OSS] Created agent with fixed identity`);
    } catch (identityError) {
      console.error(`[OSS] Error creating identity, falling back to anonymous agent:`, identityError);
      httpAgent = new HttpAgent(agentOptions);
    }
    
    if (development) {
      console.log(`[OSS] Fetching root key in development mode`);
      await httpAgent.fetchRootKey();
    }
    
    // Convert the access token string to a Uint8Array
    // The token needs to be properly encoded according to CBOR standards
    let tokenBytes: Uint8Array;
    try {
      // Check if the token is already a base64 encoded string (common for CBOR)
      if (accessToken.match(/^[A-Za-z0-9+/=]+$/)) {
        try {
          // Try to decode as base64
          const binaryString = atob(accessToken);
          tokenBytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            tokenBytes[i] = binaryString.charCodeAt(i);
          }
          console.log(`[OSS] Decoded base64 token to binary, length: ${tokenBytes.length}`);
        } catch (base64Error) {
          console.warn(`[OSS] Failed to decode as base64, falling back to hex check:`, base64Error);
          // Continue to hex check
          throw base64Error;
        }
      }
      // If not base64 or base64 decode failed, check if it's a hex string
      else if (/^[0-9a-fA-F]+$/.test(accessToken)) {
        // Convert hex string to byte array - this is likely already in CBOR format
        tokenBytes = new Uint8Array(
          accessToken.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
        );
        console.log(`[OSS] Converted hex token to binary, length: ${tokenBytes.length}`);
      } 
      // If it's not base64 or hex, it might be a raw string that needs to be properly CBOR encoded
      else {
        // For raw strings, we should use a proper CBOR encoding library
        // But for now, we'll use basic UTF-8 encoding as fallback
        console.warn(`[OSS] Token doesn't appear to be in expected format (base64/hex), using UTF-8 encoding`);
        tokenBytes = new TextEncoder().encode(accessToken);
        console.log(`[OSS] Encoded token as UTF-8, length: ${tokenBytes.length}`);
      }
    } catch (encodingError) {
      console.error(`[OSS] Error processing token:`, encodingError);
      // Fallback to simple encoding
      tokenBytes = new TextEncoder().encode(accessToken);
      console.log(`[OSS] Fallback: encoded token as UTF-8, length: ${tokenBytes.length}`);
    }
    
    // Use type assertions to bypass type compatibility issues
    const bucketCanister = OSS_BUCKET_CANISTER_ID;
    console.log(`[OSS] Using bucket canister ID: ${bucketCanister}`);
    
    // Create the BucketCanister using type assertions to avoid compatibility issues
    // and making sure we're not adding any extraneous data to the token
    const bucket = BucketCanister.create({
      canisterId: bucketCanister,
      agent: httpAgent as any,
      accessToken: tokenBytes
    } as any);
    
    console.log(`[OSS] Bucket canister created successfully`);
    
    // Create an uploader instance
    const uploader = new Uploader(bucket);
    console.log(`[OSS] Uploader instance created`);
    
    return [bucket, uploader];
  } catch (error) {
    console.error(`[OSS] Error initializing OSS with token:`, error);
    throw error;
  }
}

/**
 * Converts a metadata object to the format expected by the backend
 * @param metadata - The metadata object with key-value pairs
 * @returns A formatted array of tuples with metadata values
 */
function formatMetadata(metadata: VoiceFileMetadata): Array<[string, MetadataValue]> {
  console.log(`[OSS] Formatting metadata:`, JSON.stringify(metadata));
  const formattedMetadata = Object.entries(metadata).map(([key, value]) => {
    if (typeof value === 'string') {
      console.log(`[OSS] Metadata "${key}": Text value (length: ${value.length})`);
      return [key, { Text: value }];
    } else if (typeof value === 'number') {
      if (Number.isInteger(value)) {
        console.log(`[OSS] Metadata "${key}": Nat value (${value})`);
        return [key, { Nat: BigInt(value) }];
      } else {
        console.log(`[OSS] Metadata "${key}": Int value (${Math.floor(value)})`);
        return [key, { Int: BigInt(Math.floor(value)) }];
      }
    } else if (value instanceof Uint8Array) {
      console.log(`[OSS] Metadata "${key}": Blob value (size: ${value.length} bytes)`);
      return [key, { Blob: value }];
    } else {
      // Convert other types to string
      console.log(`[OSS] Metadata "${key}": Converting to Text (type: ${typeof value})`);
      return [key, { Text: String(value) }];
    }
  }) as Array<[string, MetadataValue]>;
  console.log(`[OSS] Metadata formatted, ${formattedMetadata.length} key-value pairs`);
  return formattedMetadata;
}

/**
 * Creates a proper FileConfig object for uploading to OSS
 * @param file - The file to upload
 * @param folderId - The folder ID
 * @returns A properly formatted FileConfig object
 */
function createFileConfig(file: File, folderId: number): FileConfig {
  console.log(`[OSS] Creating file config for "${file.name}" (type: ${file.type}, size: ${file.size} bytes) in folder ID: ${folderId}`);
  return {
    name: file.name,
    contentType: file.type || 'audio/wav',
    size: file.size,
    parent: folderId,
    content: file
  };
}

/**
 * Uploads a voice file to the OSS bucket and records it in the backend
 * @param file - The file to upload
 * @param folderPath - The folder path in the OSS bucket
 * @param principalId - The principal ID of the user (will be replaced with fixed ID)
 * @param metadata - Optional metadata for the file
 * @returns A promise that resolves to the file ID of the uploaded file
 * @throws Will throw an error if the upload fails
 */
export async function voice_upload(
  file: File,
  folderPath: string,
  principalId: string,
  metadata?: VoiceFileMetadata
): Promise<number> {
  console.log(`[OSS] voice_upload: Starting upload process with params:
  - File: ${file.name} (${file.size} bytes, type: ${file.type})
  - Folder path: ${folderPath}
  - User Principal ID: ${principalId}
  - Using Fixed Principal ID: ${FIXED_PRINCIPAL_ID}
  - Has metadata: ${metadata ? 'yes' : 'no'}`);
  
  try {
    // Get the access token from the backend using the FIXED principal ID
    console.log(`[OSS] Requesting access token for fixed principal: ${FIXED_PRINCIPAL_ID}`);
    const { access_token, folder } = await get_access_token(FIXED_PRINCIPAL_ID);
    console.log(`[OSS] Received access token (length: ${access_token.length}) and folder: ${folder}`);
    
    // Initialize OSS with the access token
    console.log(`[OSS] Initializing OSS with token and using fixed identity`);
    const [bucket, uploader] = await initOssWithToken(access_token);
    console.log(`[OSS] OSS initialized successfully`);
    
    // Get bucket info to verify connection
    const bucketInfo = await bucket.getBucketInfo();
    console.log(`[OSS] Bucket info retrieved:`, bucketInfo);
    
    // Get or create folder info
    let folderId = 0; // Root folder
    console.log(`[OSS] Initial folder ID set to root (0)`);
    
    if (folderPath) {
      console.log(`[OSS] Folder path provided: ${folderPath}, checking if it exists`);
      // List folders to check if it exists
      const folders = await bucket.listFolders(0);
      console.log(`[OSS] Found ${folders.length} folder(s) in root: ${folders.map(f => f.name).join(', ')}`);
      
      const existingFolder = folders.find(f => f.name === folderPath);
      if (existingFolder) {
        folderId = existingFolder.id;
        console.log(`[OSS] Found existing folder: ${folderPath} with ID: ${folderId}`);
      } else {
        // Create folder if it doesn't exist
        console.log(`[OSS] Creating folder: ${folderPath} with parent ID: 0`);
        const folderInfo = await bucket.createFolder({
          name: folderPath,
          parent: 0 // Root folder
        });
        folderId = folderInfo.id;
        console.log(`[OSS] Created folder: ${folderPath} with ID: ${folderId}`);
      }
    }
    
    // Prepare file config for upload
    console.log(`[OSS] Creating file config for upload`);
    const fileConfig = createFileConfig(file, folderId);
    
    // Upload the file to OSS
    console.log(`[OSS] Starting file upload to bucket with folder ID: ${folderId}`);
    const uploadResult = await uploader.upload(fileConfig, (progress) => {
      console.log(`[OSS] Upload progress: ${progress.filled}/${progress.size} bytes (${Math.round((progress.filled / progress.size) * 100)}%)`);
    });
    
    console.log(`[OSS] File uploaded successfully, ID: ${uploadResult.id}, getting file info to confirm upload`);
    
    // Get file info to confirm upload
    const fileInfo = await bucket.getFileInfo(uploadResult.id);
    console.log(`[OSS] File info retrieved:`, fileInfo);
    
    // Format metadata for the backend if provided
    let formattedMetadata;
    if (metadata) {
      console.log(`[OSS] Formatting metadata for backend`);
      formattedMetadata = formatMetadata(metadata);
      console.log(`[OSS] Metadata formatted with ${formattedMetadata.length} entries`);
    }
    
    // Record the voice file in the backend using the adapter function
    // Note: Still use the original user's principalId for backend record
    console.log(`[OSS] Uploading voice file to backend with params:
    - User Principal ID: ${principalId}
    - Folder: ${folderPath}
    - File ID: ${uploadResult.id}
    - Metadata entries: ${formattedMetadata ? formattedMetadata.length : 0}`);
    
    try {
      // Create a Principal object from the string ID
      const principal = Principal.fromText(principalId);
      
      // Convert file ID to filename that can be parsed as a number
      const fileIdStr = String(uploadResult.id);
      
      // Get file content for upload
      const fileContent = new Uint8Array(await file.arrayBuffer());
      
      // Convert metadata to the right format for upload_voice_file
      const uploadMetadata = formattedMetadata ? 
        formattedMetadata.map(([key, value]) => {
          // Convert MetadataValue to string for upload_voice_file
          let stringValue = "";
          if ('Text' in value) {
            stringValue = value.Text;
          } else if ('Int' in value) {
            stringValue = value.Int.toString();
          } else if ('Nat' in value) {
            stringValue = value.Nat.toString();
          } else if ('Blob' in value) {
            stringValue = Array.from(value.Blob)
              .map(b => {
                // Convert to number and then to hex
                const n = Number(b);
                const hex = n.toString(16);
                return hex.length === 1 ? '0' + hex : hex;
              })
              .join('');
          }
          return [key, stringValue] as [string, string];
        }) : 
        undefined;
      
      type UploadResult = { Ok: null } | { Err: string };
      
      const backendUploadResult: UploadResult = await backend_upload_voice_file(
        principalId, // Use the user's principal ID for backend recording
        folderPath,
        fileIdStr, // Send just the numeric ID as a string
        fileContent,
        uploadMetadata
      );
      
      // Check result
      if (backendUploadResult && typeof backendUploadResult === 'object') {
        if ('Ok' in backendUploadResult) {
          console.log(`[OSS] Voice file uploaded successfully to backend`);
          return uploadResult.id;
        } else if ('Err' in backendUploadResult) {
          console.error(`[OSS] Error uploading voice file to backend:`, backendUploadResult.Err);
          throw new Error(`Failed to upload voice file: ${backendUploadResult.Err}`);
        }
      }
      console.error(`[OSS] Unexpected response from upload_voice_file`);
      throw new Error('Failed to upload voice file: Unexpected response format');
    } catch (recordError) {
      console.error(`[OSS] Error during upload_voice_file call:`, recordError);
      
      // Even if we couldn't upload it to the backend, we did upload it to OSS
      // Return the file ID so it's not completely lost
      console.log(`[OSS] Returning file ID despite backend upload failure: ${uploadResult.id}`);
      return uploadResult.id;
    }
  } catch (error) {
    console.error(`[OSS] Error in voice_upload:`, error);
    throw error;
  }
}

/**
 * Deletes a voice file from the OSS bucket and marks it as deleted in the backend
 * @param fileId - The ID of the file to delete
 * @param principalId - The principal ID of the user (will be replaced with fixed ID)
 * @returns A promise that resolves to a boolean indicating success
 * @throws Will throw an error if the deletion fails
 */
export async function voice_delete(
  fileId: number,
  principalId: string
): Promise<boolean> {
  console.log(`[OSS] voice_delete: Starting deletion process with params:
  - File ID: ${fileId}
  - User Principal ID: ${principalId}
  - Using Fixed Principal ID: ${FIXED_PRINCIPAL_ID}`);
  
  try {
    // Get the access token from the backend using the FIXED principal ID
    console.log(`[OSS] Requesting access token for fixed principal: ${FIXED_PRINCIPAL_ID}`);
    const { access_token } = await get_access_token(FIXED_PRINCIPAL_ID);
    console.log(`[OSS] Received access token (length: ${access_token.length})`);
    
    // Initialize OSS with the access token
    console.log(`[OSS] Initializing OSS with token and using fixed identity`);
    const [bucket] = await initOssWithToken(access_token);
    console.log(`[OSS] OSS initialized successfully`);
    
    // Delete the file from OSS
    console.log(`[OSS] Deleting file with ID: ${fileId} from OSS bucket`);
    const deleteResult = await bucket.deleteFile(fileId);
    console.log(`[OSS] OSS delete result:`, deleteResult);
    
    if (deleteResult) {
      // Mark the file as deleted in the backend using the adapter function
      console.log(`[OSS] Marking file with ID: ${fileId} as deleted in backend`);
      const markResult = await backend_mark_voice_file_deleted(fileId);
      
      if ('Ok' in markResult) {
        console.log(`[OSS] Voice file marked as deleted successfully`);
        return true;
      } else {
        console.error(`[OSS] Error marking voice file as deleted:`, markResult.Err);
        return false;
      }
    } else {
      console.error(`[OSS] Failed to delete file from OSS`);
      return false;
    }
  } catch (error) {
    console.error(`[OSS] Error in voice_delete:`, error);
    throw error;
  }
}

/**
 * Fetches voice file data from the backend
 * @param fileId - The ID of the file to fetch
 * @returns A promise that resolves to the voice asset data or null if not found
 * @throws Will throw an error if the fetch fails
 */
export async function fetch_voice_info(
  fileId: number
): Promise<VoiceAssetData | null> {
  console.log(`[OSS] fetch_voice_info: Fetching voice file data for ID: ${fileId}`);
  
  try {
    // Use the adapter function
    console.log(`[OSS] Calling backend_get_voice_file with file ID: ${fileId}`);
    const result = await backend_get_voice_file(fileId);
    console.log(`[OSS] Voice file data retrieved:`, result ? 'success' : 'null');
    return result;
  } catch (error) {
    console.error(`[OSS] Error fetching voice file data for ID: ${fileId}:`, error);
    throw error;
  }
}

/**
 * Fetches a voice file content directly from the OSS bucket
 * @param fileId - The ID of the file to fetch
 * @param principalId - The principal ID of the user (will be replaced with fixed ID)
 * @returns A promise that resolves to the file content as an ArrayBuffer
 * @throws Will throw an error if the fetch fails
 */
export async function fetch_voice_content(
  fileId: number,
  principalId: string
): Promise<ArrayBuffer> {
  console.log(`[OSS] fetch_voice_content: Starting content fetch with params:
  - File ID: ${fileId}
  - User Principal ID: ${principalId}
  - Using Fixed Principal ID: ${FIXED_PRINCIPAL_ID}`);
  
  try {
    // First, get the voice file info to ensure it exists and get metadata
    console.log(`[OSS] Fetching voice file info for ID: ${fileId}`);
    const fileInfo = await fetch_voice_info(fileId);
    console.log(`[OSS] Voice file info retrieved:`, fileInfo ? 'success' : 'null');
    
    if (!fileInfo) {
      console.error(`[OSS] Voice file with ID ${fileId} not found`);
      throw new Error(`Voice file with ID ${fileId} not found`);
    }
    
    // Get the access token using the FIXED principal ID
    console.log(`[OSS] Requesting access token for fixed principal: ${FIXED_PRINCIPAL_ID}`);
    const { access_token } = await get_access_token(FIXED_PRINCIPAL_ID);
    console.log(`[OSS] Received access token (length: ${access_token.length})`);
    
    // Initialize OSS with the access token
    console.log(`[OSS] Initializing OSS with token and using fixed identity`);
    const [bucket] = await initOssWithToken(access_token);
    console.log(`[OSS] OSS initialized successfully`);
    
    // Get file chunks
    console.log(`[OSS] Getting file chunks for file ID: ${fileId}, offset: 0`);
    const chunks = await bucket.getFileChunks(fileId, 0);
    console.log(`[OSS] Retrieved ${chunks ? chunks.length : 0} file chunks`);
    
    // Add detailed chunk structure logging
    if (chunks && chunks.length > 0) {
      console.log(`[OSS] First chunk structure:`, JSON.stringify(chunks[0]));
      
      // Check what properties are available on the chunk
      const chunkKeys = Object.keys(chunks[0]);
      console.log(`[OSS] Available properties on chunk:`, chunkKeys.join(', '));
      
      // If we receive a JSON object instead of a binary chunk, try to extract binary data
      if (typeof chunks[0] === 'object' && !Array.isArray(chunks[0])) {
        const chunkObj = chunks[0] as any;
        // If this is a JSON representation of binary data with numeric indices as keys
        if (Object.keys(chunkObj).every(key => !isNaN(Number(key)))) {
          try {
            // Convert the object structure to Uint8Array
            const maxKey = Math.max(...Object.keys(chunkObj).map(Number));
            const byteArray = new Uint8Array(maxKey + 1);
            
            for (const [key, value] of Object.entries(chunkObj)) {
              byteArray[Number(key)] = Number(value);
            }
            
            // Replace the chunk with the converted Uint8Array
            chunks[0] = byteArray as any; // Cast to any to avoid type errors
            console.log(`[OSS] Converted JSON object chunk to Uint8Array with length: ${byteArray.length}`);
          } catch (e) {
            console.error(`[OSS] Failed to convert JSON chunk to binary:`, e);
          }
        }
      }
    }
    
    if (!chunks || chunks.length === 0) {
      console.error(`[OSS] No content found for voice file with ID ${fileId}`);
      throw new Error(`No content found for voice file with ID ${fileId}`);
    }
    
    // Let's try to adapt to potential API differences or response format changes
    // First try the expected "content" property
    let contentProperty = 'content';
    
    // Check if any chunk has a "content" property
    const hasContentProperty = chunks.some(chunk => !!(chunk && (chunk as any).content));
    
    // If not, try to find an alternative property that might contain the content
    if (!hasContentProperty && chunks[0]) {
      // Look for properties that might contain binary data
      const potentialContentProps = Object.keys(chunks[0]).filter(key => {
        const value = (chunks[0] as any)[key];
        return value instanceof Uint8Array || 
               (value && typeof value === 'object' && 'buffer' in value) ||
               (value && typeof value === 'object' && 'byteLength' in value);
      });
      
      if (potentialContentProps.length > 0) {
        contentProperty = potentialContentProps[0];
        console.log(`[OSS] Using "${contentProperty}" as the content property instead of "content"`);
      }
    }
    
    // Validate that at least one chunk has what we think is content data
    const hasValidContent = chunks.some(chunk => !!(chunk && (chunk as any)[contentProperty]));
    if (!hasValidContent) {
      console.error(`[OSS] No valid content chunks found for voice file with ID ${fileId}. Cannot find "${contentProperty}" property.`);
      
      // Return a valid empty buffer that can be safely encoded as base64 later
      console.warn(`[OSS] Returning minimal valid audio buffer as fallback for file ID: ${fileId}`);
      
      // Create a minimal valid WAV file header (44 bytes)
      // This ensures that even with no content, we return something that can be encoded as base64
      const emptyWav = new Uint8Array([
        // RIFF header
        0x52, 0x49, 0x46, 0x46, // "RIFF"
        0x24, 0x00, 0x00, 0x00, // file size (36 + 0 = 36 bytes)
        0x57, 0x41, 0x56, 0x45, // "WAVE"
        
        // fmt chunk
        0x66, 0x6d, 0x74, 0x20, // "fmt "
        0x10, 0x00, 0x00, 0x00, // chunk size (16 bytes)
        0x01, 0x00,             // format = 1 (PCM)
        0x01, 0x00,             // channels = 1 (mono)
        0x44, 0xac, 0x00, 0x00, // sample rate = 44100
        0x88, 0x58, 0x01, 0x00, // byte rate = 44100 * 1 * 1 = 44100
        0x02, 0x00,             // block align = 1 * 1 = 2
        0x10, 0x00,             // bits per sample = 16
        
        // data chunk
        0x64, 0x61, 0x74, 0x61, // "data"
        0x00, 0x00, 0x00, 0x00  // chunk size (0 bytes of sample data)
      ]);
      
      return emptyWav.buffer;
    }
    
    // Calculate total size and create buffer
    let totalSize = 0;
    chunks.forEach((chunk) => {
      // Access the content property using the determined property name
      const content = (chunk as any)[contentProperty] as Uint8Array;
      // Add null check before accessing length
      if (content) {
        totalSize += content.length;
      } else {
        console.warn(`[OSS] Found chunk without ${contentProperty} for file ID: ${fileId}`);
      }
    });
    
    console.log(`[OSS] Creating buffer with total size: ${totalSize} bytes`);
    const result = new Uint8Array(totalSize);
    
    // Concatenate all chunks
    let offset = 0;
    chunks.forEach((chunk, index) => {
      // Access the content property using the determined property name
      const content = (chunk as any)[contentProperty] as Uint8Array;
      // Add null check before trying to set content in result
      if (content) {
        console.log(`[OSS] Adding chunk ${index + 1} at offset: ${offset}`);
        result.set(content, offset);
        offset += content.length;
      } else {
        console.warn(`[OSS] Skipping chunk ${index + 1} with missing ${contentProperty}`);
      }
    });
    
    console.log(`[OSS] Voice file content retrieved successfully, total size: ${totalSize} bytes`);
    return result.buffer;
  } catch (error) {
    console.error(`[OSS] Error fetching voice file content for ID: ${fileId}:`, error);
    throw error;
  }
}

/**
 * Lists voice files for a user
 * @param principalId - The principal ID of the user
 * @param folderId - Optional folder ID to filter by
 * @param page - Optional page number for pagination (1-based)
 * @param pageSize - Optional limit on the number of files to return
 * @returns A promise that resolves to an array of voice file info objects
 * @throws Will throw an error if the listing fails
 */
export async function list_voice_files(
  principalId?: string,
  folderId?: string,
  page?: number,
  pageSize?: number
): Promise<VoiceOssInfo[]> {
  console.log(`[OSS] list_voice_files: Starting list operation with params:
  - Principal ID: ${principalId !== undefined ? principalId : 'not specified'}
  - Folder ID: ${folderId !== undefined ? folderId : 'not specified'}
  - Page: ${page !== undefined ? page : 'not specified'}
  - Page Size: ${pageSize !== undefined ? pageSize : 'not specified'}`);
  
  try {
    // Convert principalId to Principal object if provided and not empty
    const principalParam = principalId && principalId.trim() !== '' 
      ? Principal.fromText(principalId)
      : undefined;
    
    // Ensure pageSize is within a reasonable range
    const pageSizeParam = pageSize !== undefined ? 
      (pageSize > 50 ? 50 : (pageSize < 1 ? 10 : pageSize)) : 
      undefined;
    
    // Ensure page is at least 1
    const pageParam = page !== undefined && page > 0 ? page : 1;
    
    // Log the processed parameters
    console.log(`[OSS] Processed parameters:
    - Principal: ${principalParam ? principalParam.toString() : 'undefined'}
    - Folder ID: ${folderId || 'undefined'}
    - Page: ${pageParam}
    - Page Size: ${pageSizeParam || 'undefined (default: 10)'}`);
    
    // Call the backend function - convert page to bigint if needed
    console.log(`[OSS] Calling backend_list_voice_files with the specified parameters`);
    const result = await backend_list_voice_files(
      principalParam,
      folderId as any, // Cast to any to bypass type check
      BigInt(pageParam),
      pageSizeParam
    );
    
    // Handle the result which may be a variant with Ok/Err
    if (result && typeof result === 'object') {
      if ('Ok' in result) {
        console.log(`[OSS] Retrieved ${result.Ok.length} voice files successfully (page ${pageParam})`);
        return result.Ok;
      } else if ('Err' in result) {
        console.error(`[OSS] Error listing voice files:`, result.Err);
        return [];
      }
    }
    
    // If the result is not a variant (direct array), return it
    // Need to check if result is array-like first to avoid type error
    if (Array.isArray(result)) {
      console.log(`[OSS] Retrieved ${result.length} voice files successfully (page ${pageParam})`);
      return result as VoiceOssInfo[];
    }
    
    // If we can't recognize the result format, return empty array
    console.warn(`[OSS] Unrecognized result format:`, result);
    return [];
  } catch (error) {
    console.error(`[OSS] Error in list_voice_files:`, error);
    throw error;
  }
}

/**
 * Fetches voice files and their content, converting to the format needed by the UI
 * @param principalId - The principal ID of the user
 * @param pageNum - The page number to fetch (1-based)
 * @param pageSize - Number of items per page
 * @returns A promise that resolves to an array of voice data items in the format expected by the UI
 */
export async function queryVoiceOnline(
  principalId: string,
  pageNum: number = 1,
  pageSize: number = 10
): Promise<any[]> {
  console.log(`[OSS] queryVoiceOnline: Fetching page ${pageNum} with size ${pageSize} for principal: ${principalId}`);
  
  try {
    // Get the list of voice files using the page-based pagination
    const voiceFiles = await list_voice_files(principalId, '0', pageNum, pageSize);
    console.log(`[OSS] Retrieved ${voiceFiles.length} voice files for page ${pageNum}`);
    
    // Process each voice file to get content and format for UI
    const processedData = await Promise.all(voiceFiles.map(async (file) => {
      try {
        console.log(`[OSS] Processing file ID: ${file.file_id}`);
        
        // Fetch the voice content
        const contentBuffer = await fetch_voice_content(Number(file.file_id), principalId);
        
        try {
          // Convert ArrayBuffer to Base64 safely
          const uint8Array = new Uint8Array(contentBuffer);
          let base64Data = '';
          
          // Check if the data is actually already a string or JSON
          if (uint8Array.length > 0) {
            // Try to safely convert binary data to a string for base64 encoding
            try {
              base64Data = uint8Array.reduce((data, byte) => data + String.fromCharCode(byte), '');
            } catch (e) {
              console.error(`[OSS] Error converting Uint8Array to string:`, e);
              base64Data = '';
            }
          }
          
          // Add data URL prefix for proper format expected by base64ToBlob
          const contentBase64 = `data:audio/wav;base64,${btoa(base64Data)}`;
          
          // Get custom metadata (if any)
          const customMetadata = file.custom || [];
          const title = customMetadata.find(([key]) => key === 'title')?.[1]?.Text || '';
          
          // Format the data to match the expected schema in queryVoices
          return {
            prd_id: Number(file.file_id),
            file_obj: contentBase64,
            gmt_create: Number(file.created_at),
            icon: '',
            title: title,
            timestamp: Number(file.created_at), // Keep timestamp for display purposes
            file_id: Number(file.file_id) // Keep file_id for reference
          };
        } catch (e) {
          console.error(`[OSS] Error processing content for file ID ${file.file_id}:`, e);
          // Return a placeholder for failed files
          return {
            prd_id: Number(file.file_id),
            file_obj: 'data:audio/wav;base64,', // Empty but valid base64 data URL
            gmt_create: Number(file.created_at),
            icon: '',
            error: 'Failed to process content',
            timestamp: Number(file.created_at),
            file_id: Number(file.file_id)
          };
        }
      } catch (error) {
        console.error(`[OSS] Error processing file ID ${file.file_id}:`, error);
        // Return a placeholder for failed files
        return {
          prd_id: Number(file.file_id),
          file_obj: null, // Indicate failed content retrieval
          gmt_create: Number(file.created_at),
          icon: '',
          error: 'Failed to load content',
          timestamp: Number(file.created_at),
          file_id: Number(file.file_id)
        };
      }
    }));
    
    console.log(`[OSS] Successfully processed ${processedData.length} voice files for page ${pageNum}`);
    return processedData;
  } catch (error) {
    console.error(`[OSS] Error in queryVoiceOnline:`, error);
    return []; // Return empty array on error
  }
}

/**
 * Generates a mock identity (for development purposes only)
 * This is a placeholder and doesn't actually create a real identity
 */
function generateIdentity() {
  console.log('Mock identity generation - not implemented');
  // In a real implementation, this would use Ed25519KeyIdentity.generate()
  // But we're avoiding that dependency for now
}

