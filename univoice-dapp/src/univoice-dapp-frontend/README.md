# Univoice DApp Voice OSS Features

This README documents the voice file operations functionality using IC-OSS (Internet Computer Object Storage Service).

## Voice OSS Business Module

The `voiceossbuss.tsx` module provides a set of functions for interacting with the IC-OSS service to manage voice files:

### Main Features

1. **Voice File Upload**
   - Upload voice files to the IC-OSS bucket
   - Store metadata about the voice files
   - Record voice assets in the backend canister

2. **Voice File Deletion**
   - Delete voice files from the IC-OSS bucket
   - Mark voice files as deleted in the backend

3. **Voice File Retrieval**
   - Fetch voice file metadata
   - Retrieve voice file content
   - List available voice files

### API Reference

#### `get_access_token(principalId: string): Promise<AccessTokenResponse>`
Gets an access token for the OSS bucket from the backend canister.

#### `voice_upload(file: File, folderPath: string, principalId: string, metadata?: VoiceFileMetadata): Promise<number>`
Uploads a voice file to the OSS bucket and records it in the backend.

#### `voice_delete(fileId: number, principalId: string): Promise<boolean>`
Deletes a voice file from the OSS bucket and marks it as deleted in the backend.

#### `fetch_voice_info(fileId: number): Promise<VoiceAssetData | null>`
Fetches voice file metadata from the backend.

#### `fetch_voice_content(fileId: number, principalId: string): Promise<ArrayBuffer>`
Fetches the content of a voice file directly from the OSS bucket.

#### `list_voice_files(principalId: string, folderId?: number, createdAfter?: bigint, limit?: number): Promise<VoiceOssInfo[]>`
Lists voice files for a user with optional filtering.

## Usage Example

```typescript
import { voice_upload, voice_delete, fetch_voice_info, fetch_voice_content, list_voice_files } from '@/utils/voiceossbuss';

// Upload a voice file
const uploadVoice = async (file: File) => {
  try {
    const principalId = 'your-principal-id';
    const folderPath = 'user-voices';
    const metadata = {
      title: 'My Voice Recording',
      duration: 120, // 2 minutes
      tags: ['personal', 'notes']
    };
    
    const fileId = await voice_upload(file, folderPath, principalId, metadata);
    console.log(`Voice file uploaded with ID: ${fileId}`);
    return fileId;
  } catch (error) {
    console.error('Failed to upload voice file:', error);
  }
};

// List voice files
const listVoices = async () => {
  try {
    const principalId = 'your-principal-id';
    const voices = await list_voice_files(principalId);
    console.log(`Found ${voices.length} voice files`);
    return voices;
  } catch (error) {
    console.error('Failed to list voice files:', error);
    return [];
  }
};

// Delete a voice file
const deleteVoice = async (fileId: number) => {
  try {
    const principalId = 'your-principal-id';
    const success = await voice_delete(fileId, principalId);
    console.log(`Voice file deletion ${success ? 'succeeded' : 'failed'}`);
    return success;
  } catch (error) {
    console.error('Failed to delete voice file:', error);
    return false;
  }
};
```

## Dependencies

This module depends on:
- `@dfinity/agent` and `@dfinity/principal` for interacting with Internet Computer canisters
- `@ldclabs/ic_oss_ts` for the IC-OSS TypeScript SDK

## Installation

The dependencies are included in the project's package.json. Run npm install to install them:

```
npm install
``` 