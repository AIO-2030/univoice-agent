import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "declarations/univoice-dapp-backend/univoice-dapp-backend.did.js";

import type { TaskData } from "declarations/univoice-dapp-backend/univoice-dapp-backend.did";
import { isLocalNet } from "@/utils/env";
import { idlFactory as vmc_idlFactory } from "../idl/univoice-vmc-backend.did.js";
import { Principal } from "@dfinity/principal";

/**
 * Interface for MainSiteSummary as defined in the .did.js file
 */
export interface MainSiteSummary {
  token_pool_balance: bigint;
  listener_count: bigint;
  token_per_block: bigint;
  aigcblock_created_number: bigint;
}

/**
 * Interface for MetadataValue used in voice operations
 */
export interface MetadataValue {
  Int?: bigint;
  Nat?: bigint;
  Blob?: Uint8Array;
  Text?: string;
}

/**
 * Interface for Voice Asset Data
 */
export interface VoiceAssetData {
  status: number;
  updated_at?: bigint;
  custom?: Array<[string, MetadataValue]>;
  created_at: bigint;
  principal_id: Principal;
  folder_id: number;
  file_id: number;
}

/**
 * Interface for Voice OSS Info
 */
export interface VoiceOssInfo {
  status: number;
  updated_at?: bigint;
  custom?: Array<[string, MetadataValue]>;
  created_at: bigint;
  file_id: number;
}

/**
 * Interface for the access token response
 */
export interface AccessTokenResponse {
  access_token: string;
  folder: string;
}

/**
 * Utility functions for interacting with the univoice-dapp backend canister
 * @module callbackend
 */

// Define global variables for host
// For local development, we'll use the standard localhost URL
// The Canister UI usually uses a subdomain like canister-id.localhost
// But for API calls, we need to use the base localhost address
const LOCAL_HOST = "http://localhost:4943";
const IC_HOST = "https://ic0.app";

// Use isLocalNet() to determine the environment
const development = isLocalNet();
console.log("Callbackend Environment:", development ? "Local" : "Production");
console.log("Host being used:", development ? LOCAL_HOST : IC_HOST);

// Backend canister IDs - use different IDs for local vs production
const PROD_BACKEND_CANISTER_ID = "224pv-saaaa-aaaaj-af7qa-cai";
const LOCAL_BACKEND_CANISTER_ID = "224pv-saaaa-aaaaj-af7qa-cai"; // Use your local canister ID
const BACKEND_CANISTER_ID = development ? LOCAL_BACKEND_CANISTER_ID : PROD_BACKEND_CANISTER_ID;

console.log("Backend canister ID:", BACKEND_CANISTER_ID);

// Define a more specific Actor interface that includes the methods we're calling
interface BackendActor {
  get_user_tasks: (principalId: string) => Promise<{ tasks: Array<TaskData> } | { Err: string }>;
  update_task_status: (principalId: string, taskId: string, status: string) => Promise<{ Ok: null } | { Err: string }>;
  claim_reward: (dappPrincipalOpt: string[], walletPrincipalOpt: string[], amount: bigint) => Promise<{ Ok: null } | { Err: string }>;
  add_custom_info: (info: any) => Promise<{ Ok: null } | { Err: string }>;
  get_custom_info: (dappPrincipalOpt: string[], walletPrincipalOpt: string[]) => Promise<Array<any> | { Err: string }>;
  get_unclaimed_rewards: (userPrincipal: string) => Promise<bigint>;
  use_invite_code: (code: string, newUserPrincipalId: string) => Promise<{ Ok: any } | { Err: string }>;
  get_friend_infos: (principalId: string) => Promise<Array<[any, bigint]>>;
  get_access_token: (principalId: string) => Promise<{ Ok: AccessTokenResponse } | { Err: string }>;
  upload_voice_file: (principal: Principal, folder: string, filename: string, content: Uint8Array, metadataOpt?: Array<[string, string]>) => Promise<{ Ok: null } | { Err: string }>;
  mark_voice_file_deleted: (fileId: bigint) => Promise<{ Ok: null } | { Err: string }>;
  list_voice_files: (principalOpt: Principal[], folderIdOpt: number[], createdAfterOpt: bigint[], limitOpt: number[]) => Promise<{ Ok: VoiceOssInfo[] } | { Err: string }>;
  get_voice_file: (fileId: bigint) => Promise<Array<VoiceAssetData> | []>;
  get_cluster_canister: () => Promise<string[]>;
  get_bucket_canister: () => Promise<string[]>;
}

interface VmcActor {
  sum_unclaimed_mint_ledger_onceday: (principalId: string) => Promise<bigint>;
  get_main_site_summary: () => Promise<MainSiteSummary>;
}

// Update the createActor function to return the appropriate interface
export async function createActor(): Promise<BackendActor> {
  try {
    let agent: HttpAgent;
    // Use isLocalNet() to determine the environment
    if (development) {
      // Create an agent for local development with minimal CORS settings
      agent = new HttpAgent({ 
        host: LOCAL_HOST,
        fetchOptions: {
          // Don't include credentials to avoid CORS preflight requests
          credentials: 'omit'
          // Remove the custom headers that are causing CORS issues
        }
      });
      // In development, we don't verify the certificate
      await agent.fetchRootKey();
      console.log("Local agent created with CORS configuration");
    } else {
      agent = new HttpAgent({ host: IC_HOST });
      console.log("Production agent created");
    }

    // Use type assertion to bypass the compatibility issues
    return Actor.createActor(idlFactory as any, {
      agent,
      canisterId: BACKEND_CANISTER_ID,
    }) as unknown as BackendActor;
  } catch (error) {
    console.error("Error creating actor:", error);
    throw error;
  }
}

/**
 * Gets user tasks from the backend canister
 * @param principalId - The principal ID of the user
 * @returns A promise that resolves to an array of TaskData or null if no tasks found
 * @throws Will throw an error if the backend call fails
 */
export async function get_user_tasks(principalId: string): Promise<TaskData[] | null> {
    try {
        console.log("Fetching tasks for principal:", principalId);
        const actor = await createActor();
        const result = await actor.get_user_tasks(principalId) as { tasks: Array<TaskData> } | { Err: string };

        if ('tasks' in result) {
            console.log("Tasks retrieved:", result.tasks);
            return result.tasks;
        } else if ('Err' in result) {
            console.error("Error from backend:", result.Err);
            return null;
        } else {
            console.error("Unexpected response format:", result);
            return null;
        }
    } catch (error) {
        console.error("Error fetching tasks:", error);
        return null;
    }
}

/**
 * Updates task status in the backend canister
 * @param principalId - The principal ID of the user
 * @param taskId - The ID of the task to update
 * @param status - The new status of the task (e.g., "FINISH")
 * @returns A promise that resolves to either {Ok: null} on success or {Err: string} on failure
 */
export async function update_task_status(
    principalId: string,
    taskId: string,
    status: string
): Promise<{ Ok: null } | { Err: string }> {
    try {
        console.log(`Updating task ${taskId} status to ${status} for principal: ${principalId}`);
        const actor = await createActor();
        const result = await actor.update_task_status(principalId, taskId, status) as { Ok: null } | { Err: string };
        console.log("Task status update result:", result);
        return result;
    } catch (error) {
        console.error("Error updating task status:", error);
        return { Err: `Update task status failed: ${error.message}` };
    }
}

/**
 * Claims a reward for completing a task
 * @param dappPrincipalId - The dapp principal ID
 * @param walletPrincipalId - The wallet principal ID
 * @param amount - The reward amount to claim
 * @returns A promise that resolves to a boolean indicating success or failure
 */
export async function claim_reward(
    dappPrincipalId: string | null = null,
    walletPrincipalId: string | null = null,
    amount: bigint
): Promise<boolean> {
    try {
        console.log(`Claiming reward of ${amount} with dapp principal: ${dappPrincipalId}, wallet principal: ${walletPrincipalId}`);
        
        if (!dappPrincipalId && !walletPrincipalId) {
            throw new Error("At least one principal ID must be provided");
        }
        
        const actor = await createActor();
        const dappPrincipalOpt = dappPrincipalId ? [dappPrincipalId] : [];
        const walletPrincipalOpt = walletPrincipalId ? [walletPrincipalId] : [];
        
        const result = await actor.claim_reward(dappPrincipalOpt, walletPrincipalOpt, amount) as { Ok: null } | { Err: string };
        
        if ('Ok' in result) {
            console.log("Reward claimed successfully");
            return true;
        } else {
            console.error("Error claiming reward:", result.Err);
            return false;
        }
    } catch (error) {
        console.error("Error claiming reward:", error);
        return false;
    }
}

/**
 * Adds custom information for a user to the backend canister
 * @param customInfo - The custom information object to add
 * @returns A promise that resolves to either {Ok: null} on success or {Err: string} on failure
 */
export async function add_custom_info(customInfo: {
    dapp_principal: string;
    wallet_principal: string;
    nick_name: string;
    logo: string;
    is_invite_code_filled: boolean;
    invite_code: string;
    used_invite_code: string | [] | [string];
    total_rewards: bigint;
}): Promise<{ Ok: null } | { Err: string }> {
    try {
        const actor = await createActor();
        
        console.log("Adding custom info for user:", customInfo.dapp_principal);
        
        // Format used_invite_code as expected by the backend
        const used_invite_code = Array.isArray(customInfo.used_invite_code) 
            ? customInfo.used_invite_code 
            : (customInfo.used_invite_code ? [customInfo.used_invite_code] : []);
        
        const result = await actor.add_custom_info({
            dapp_principal: customInfo.dapp_principal,
            wallet_principal: customInfo.wallet_principal,
            nick_name: customInfo.nick_name,
            logo: customInfo.logo,
            is_invite_code_filled: customInfo.is_invite_code_filled,
            invite_code: customInfo.invite_code,
            used_invite_code: used_invite_code,
            total_rewards: customInfo.total_rewards
        }) as { Ok: null } | { Err: string };
        
        console.log("Add custom info result:", result);
        return result;
    } catch (error) {
        console.error("Error adding custom info:", error);
        return { Err: `Failed to add custom info: ${error.message}` };
    }
}

/**
 * Gets custom information for a user from the backend canister
 * @param dappPrincipalId - The dapp principal ID (optional)
 * @param walletPrincipalId - The wallet principal ID (optional)
 * @returns A promise that resolves to the custom information or null if not found
 */
export async function get_custom_info(
    dappPrincipalId: string | null = null,
    walletPrincipalId: string | null = null
): Promise<any | null> {
    try {
        if (!dappPrincipalId && !walletPrincipalId) {
            throw new Error("At least one principal ID must be provided");
        }
        
        console.log("Fetching custom info with:", { dappPrincipalId, walletPrincipalId });
        
        const actor = await createActor();
        const dappPrincipalOpt = dappPrincipalId ? [dappPrincipalId] : [];
        const walletPrincipalOpt = walletPrincipalId ? [walletPrincipalId] : [];
        
        const result = await actor.get_custom_info(dappPrincipalOpt, walletPrincipalOpt) as Array<any> | { Err: string };
        
        if (Array.isArray(result) && result.length > 0) {
            console.log("Custom info retrieved:", result[0]);
            return result[0];
        } else if ('Err' in result) {
            console.error("Error from backend:", result.Err);
            return null;
        } else {
            console.log("No custom info found");
            return null;
        }
    } catch (error) {
        console.error("Error fetching custom info:", error);
        return null;
    }
}

// Update the VMC actor function to return the appropriate interface
async function createVMCActor(): Promise<VmcActor> {
  try {
    let agent: HttpAgent;
    // Use isLocalNet() to determine the environment
    if (development) {
      // Create an agent for local development with minimal CORS settings
      agent = new HttpAgent({ 
        host: LOCAL_HOST,
        fetchOptions: {
          // Don't include credentials to avoid CORS preflight requests
          credentials: 'omit'
          // Remove the custom headers that are causing CORS issues
        }
      });
      // In development, we don't verify the certificate
      await agent.fetchRootKey();
      console.log("Local VMC agent created with CORS configuration");
    } else {
      agent = new HttpAgent({ host: IC_HOST });
      console.log("Production VMC agent created");
    }

    // VMC canister IDs - use different IDs for local vs production
    const PROD_VMC_CANISTER_ID = "bw4dl-smaaa-aaaaa-qaacq-cai";
    const LOCAL_VMC_CANISTER_ID = "be2us-64aaa-aaaaa-qaabq-cai"; // Use your local VMC canister ID
    const VMC_CANISTER_ID = development ? LOCAL_VMC_CANISTER_ID : PROD_VMC_CANISTER_ID;
    
    console.log("VMC canister ID:", VMC_CANISTER_ID);

    // Use type assertion to bypass the compatibility issues
    return Actor.createActor(vmc_idlFactory as any, {
      agent,
      canisterId: VMC_CANISTER_ID,
    }) as unknown as VmcActor;
  } catch (error) {
    console.error("Error creating VMC actor:", error);
    throw error;
  }
}

/**
 * Gets unclaimed mint ledger balance for a principal within the last day
 * @param principalId - The principal ID to check
 * @returns A promise that resolves to the unclaimed balance as BigInt
 * @throws Will throw an error if the backend call fails
 */
export async function sum_unclaimed_mint_ledger_onceday(principalId: string): Promise<bigint> {
    try {
        console.log("Fetching unclaimed mint ledger balance for:", principalId);
        const actor = await createVMCActor();
        const result = await actor.sum_unclaimed_mint_ledger_onceday(principalId) as bigint;
        console.log("Unclaimed balance retrieved:", result.toString());
        return result;
    } catch (error) {
        console.error("Error fetching unclaimed mint ledger balance:", error);
        throw error;
    }
}

/**
 * Gets the total unclaimed rewards (from both tasks and invites) for a user
 * @param userPrincipal - The principal ID of the user
 * @returns A promise that resolves to a BigInt representing the total unclaimed rewards
 * @throws Will throw an error if the backend call fails
 */
export async function get_unclaimed_rewards(userPrincipal: string): Promise<bigint> {
    try {
        console.log("Fetching unclaimed rewards for principal:", userPrincipal);
        const actor = await createActor();
        const result = await actor.get_unclaimed_rewards(userPrincipal) as bigint;
        console.log("Total unclaimed rewards retrieved:", result.toString());
        return result;
    } catch (error) {
        console.error("Error fetching unclaimed rewards:", error);
        throw error;
    }
}

/**
 * Calculates the total rewards a user can claim by summing the unclaimed mint ledger balance
 * and the unclaimed rewards from tasks and invites
 * 
 * @param principalId - The principal ID of the user
 * @returns A promise that resolves to a BigInt representing the total claimable rewards
 * @throws Will throw an error if any of the backend calls fail
 */
export async function calculate_total_claimable_rewards(principalId: string): Promise<bigint> {
    try {
        console.log("Calculating total claimable rewards for:", principalId);
        
        // Fetch both types of rewards concurrently for better performance
        const [mintLedgerBalance, unclaimedRewards] = await Promise.all([
            sum_unclaimed_mint_ledger_onceday(principalId),
            get_unclaimed_rewards(principalId)
        ]);
        
        const totalRewards = mintLedgerBalance + unclaimedRewards;
        console.log("Total claimable rewards calculated:", totalRewards.toString());
        
        return totalRewards;
    } catch (error) {
        console.error("Error calculating total claimable rewards:", error);
        throw error;
    }
}

/**
 * Uses an invite code for a new user
 * @param code - The invite code to use
 * @param newUserPrincipalId - The principal ID of the new user
 * @returns A promise that resolves to either {Ok: InviteRewardRecord} on success or {Err: string} on failure
 */
export async function use_invite_code(
    code: string,
    newUserPrincipalId: string
): Promise<{ Ok: any } | { Err: string }> {
    try {
        const actor = await createActor();
        const result = await actor.use_invite_code(code, newUserPrincipalId) as { Ok: any } | { Err: string };
        console.log("Invite code use result:", result);
        return result;
    } catch (error) {
        console.error("Error using invite code:", error);
        return { Err: `Failed to use invite code: ${error.message}` };
    }
}

/**
 * Gets friend information for a user from the backend canister
 * @param principalId - The principal ID of the user
 * @returns A promise that resolves to an object with 'friends' array containing friend information
 */
export async function get_friend_infos(principalId: string): Promise<{ 
    friends: Array<{ name: string; avatar: string; friendnum: number; rewards: number }>
}> {
        try {
                const actor = await createActor();
                const result = await actor.get_friend_infos(principalId) as Array<[any, bigint]>;
                console.log("Friend information retrieved:", result);
                
                // Process the result based on the DID definition that returns vec record { CustomInfo; nat }
                return {
                        friends: Array.isArray(result) ? result.map((item, index) => {
                                const customInfo = item[0]; // CustomInfo part
                                const rewardAmount = Number(item[1]) || 0; // nat part (reward amount)
                                
                                return {
                                        name: customInfo.nick_name || '',
                                        avatar: customInfo.logo || '',
                                        friendnum: index, // Using the index as friendnum as requested
                                        rewards: rewardAmount
                                };
                        }) : []
                };
        } catch (error) {
                console.error("Error fetching friend information:", error);
                return { friends: [] };
        }
}


/**
 * Gets the main site summary data from the VMC backend canister
 * @returns A promise that resolves to the MainSiteSummary object
 * @throws Will throw an error if the backend call fails
 */
export async function get_main_site_summary(): Promise<MainSiteSummary> {
    try {
        console.log("Fetching main site summary data");
        const actor = await createVMCActor();
        const result = await actor.get_main_site_summary() as MainSiteSummary;
        console.log("Main site summary data retrieved:", result);
        return result;
    } catch (error) {
        console.error("Error fetching main site summary data:", error);
        throw error;
    }
}

/**
 * Gets the access token for the OSS bucket
 * @param principalId - The principal ID to use for authentication
 * @returns A promise that resolves to the access token response object
 * @throws Will throw an error if the backend call fails
 */
export async function get_access_token(
    principalId: string
): Promise<AccessTokenResponse> {
    try {
        console.log("Fetching OSS access token for principal:", principalId);
        const actor = await createActor();
        // Only pass the principalId parameter as the backend only expects one parameter
        const result = await actor.get_access_token(principalId) as { Ok: AccessTokenResponse } | { Err: string };
        console.log("OSS access token result:", JSON.stringify(result, null, 2));
        if (typeof result === 'object' && result !== null) {
            // The response is a variant with { Ok: { access_token, folder } } or { Err: string }
            if ('Ok' in result && result.Ok && typeof result.Ok === 'object') {
                const okResult = result.Ok;
                if ('access_token' in okResult && 'folder' in okResult) {
                    const typedResult = {
                        access_token: okResult.access_token as string,
                        folder: okResult.folder as string
                    };
                    console.log("OSS access token retrieved, folder:", typedResult.folder);
                    return typedResult;
                }
            } else if ('Err' in result) {
                throw new Error(`Backend error: ${result.Err}`);
            }
        }
        
        throw new Error("Invalid access token response format");
    } catch (error) {
        console.error("Error fetching OSS access token:", error);
        throw error;
    }
}

/**
 * Uploads a voice file to the backend
 * @param principalId - The principal ID of the user
 * @param folder - The folder path in the OSS where the file should be stored
 * @param filename - The name of the file
 * @param content - The binary content of the file
 * @param metadata - Optional metadata for the file
 * @returns A promise that resolves to either {Ok: null} on success or {Err: string} on failure
 * @throws Will throw an error if the backend call fails
 */
export async function upload_voice_file(
    principalId: string | Principal,
    folder: string,
    filename: string,
    content: Uint8Array,
    metadata?: Array<[string, string]>
): Promise<{ Ok: null; } | { Err: string; }> {
    try {
        // Convert principalId to Principal if it's a string
        const principalObj = typeof principalId === 'string' 
            ? Principal.fromText(principalId) 
            : principalId;
        
        console.log(`Uploading voice file: ${filename} to folder ${folder} for principal: ${principalObj.toString()}`);
        const actor = await createActor();
        
        // Call the backend function with the correct metadata format
        const optMetadata = metadata && metadata.length > 0 ? 
            [metadata as unknown as [string, string]] : 
            []; // Empty array for no metadata
            
        const result = await actor.upload_voice_file(
            principalObj,
            folder,
            filename,
            content,
            optMetadata as unknown as [string, string][]
        ) as { Ok: null } | { Err: string };
        
        // Check if the result is valid
        if (result && typeof result === 'object') {
            if ('Ok' in result) {
                console.log("Voice file uploaded successfully");
                return { Ok: null };
            } else if ('Err' in result) {
                console.error("Error uploading voice file:", result.Err);
                return { Err: result.Err as string };
            }
        }
        
        throw new Error("Invalid response from upload_voice_file");
    } catch (error) {
        console.error("Error in upload_voice_file:", error);
        return { Err: `Failed to upload voice file: ${error.message}` };
    }
}

/**
 * Marks a voice file as deleted in the backend
 * @param fileId - The ID of the file to mark as deleted
 * @returns A promise that resolves to either {Ok: null} on success or {Err: string} on failure
 * @throws Will throw an error if the backend call fails
 */
export async function mark_voice_file_deleted(
    fileId: bigint | number
): Promise<{ Ok: null } | { Err: string }> {
    try {
        console.log(`Marking voice file as deleted: ${fileId}`);
        const actor = await createActor();
        
        // Ensure fileId is a bigint
        const bigintFileId = typeof fileId === 'number' ? BigInt(fileId) : fileId;
        
        // Call the backend function
        const result = await actor.mark_voice_file_deleted(bigintFileId) as { Ok: null } | { Err: string };
        
        // Check if the result is valid
        if (result && typeof result === 'object') {
            if ('Ok' in result) {
                console.log("Voice file marked as deleted successfully");
                return { Ok: null };
            } else if ('Err' in result) {
                console.error("Error marking voice file as deleted:", result.Err);
                return { Err: result.Err as string };
            }
        }
        
        throw new Error("Invalid response from mark_voice_file_deleted");
    } catch (error) {
        console.error("Error in mark_voice_file_deleted:", error);
        return { Err: `Failed to mark voice file as deleted: ${error.message}` };
    }
}

/**
 * Lists voice files for a user
 * @param principalId - The principal ID of the user
 * @param folderId - Optional folder ID to filter by
 * @param createdAfter - Optional timestamp to filter files created after
 * @param limit - Optional limit on the number of files to return
 * @returns A promise that resolves to either {Ok: VoiceOssInfo[]} or {Err: string} on failure
 * @throws Will throw an error if the backend call fails
 */
export async function list_voice_files(
    principalId: string | Principal,
    folderId?: number,
    createdAfter?: bigint,
    limit?: number
): Promise<{ Ok: VoiceOssInfo[] } | { Err: string }> {
    try {
        // Convert principalId to Principal if it's a string
        const principalObj = typeof principalId === 'string' 
            ? Principal.fromText(principalId) 
            : principalId;
            
        console.log(`Listing voice files for principal: ${principalObj.toString()}`);
        const actor = await createActor();
        
        // Prepare the optional parameters
        const principalOpt = [principalObj];
        const folderIdOpt = folderId !== undefined ? [folderId] : [];
        const createdAfterOpt = createdAfter !== undefined ? [createdAfter] : [];
        const limitOpt = limit !== undefined ? [limit] : [];
        console.log(`[OSS] Calling backend_list_voice_files with the specified parameters`,
            principalObj.toString(),
            folderIdOpt,
            createdAfterOpt,
            limitOpt
        );
        // Call the backend function
        const result = await actor.list_voice_files(
            principalOpt,
            folderIdOpt,
            createdAfterOpt,
            limitOpt
        ) as { Ok: VoiceOssInfo[] } | { Err: string };
        
        // Based on the backend definition, list_voice_files returns Vec<VoiceOssInfo> directly
        // not a Result variant with Ok/Err
        if (Array.isArray(result)) {
            const files = result as VoiceOssInfo[];
            console.log(`Retrieved ${files.length} voice files`);
            return { Ok: files };
        }
        
        console.error("Unexpected response format from list_voice_files:", result);
        throw new Error("Invalid response from list_voice_files");
    } catch (error) {
        console.error("Error in list_voice_files:", error);
        return { Err: `Failed to list voice files: ${error.message}` };
    }
}

/**
 * Gets a voice file from the backend
 * @param fileId - The ID of the file to get
 * @returns A promise that resolves to the voice asset data or null if not found
 * @throws Will throw an error if the backend call fails
 */
export async function get_voice_file(
    fileId: bigint | number
): Promise<VoiceAssetData | null> {
    try {
        console.log(`Getting voice file: ${fileId}`);
        const actor = await createActor();
        
        // Ensure fileId is a bigint
        const bigintFileId = typeof fileId === 'number' ? BigInt(fileId) : fileId;
        
        // Call the backend function
        const result = await actor.get_voice_file(bigintFileId) as Array<VoiceAssetData> | [];
        
        // Check if the result exists
        if (result && Array.isArray(result) && result.length > 0) {
            console.log("Voice file retrieved successfully");
            return result[0] as VoiceAssetData;
        } else {
            console.log("Voice file not found");
            return null;
        }
    } catch (error) {
        console.error("Error in get_voice_file:", error);
        throw error;
    }
}
