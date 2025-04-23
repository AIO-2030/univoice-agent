import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "declarations/univoice-dapp-backend/univoice-dapp-backend.did.js";
import type { TaskData } from "declarations/univoice-dapp-backend/univoice-dapp-backend.did";
import { isLocalNet } from "@/utils/env";

/**
 * Utility functions for interacting with the univoice-dapp backend canister
 * @module callbackend
 */

// Define global variables for host
const LOCAL_HOST = "http://localhost:4943";
const IC_HOST = "https://ic0.app";

// Backend canister IDs - use different IDs for local vs production
const PROD_BACKEND_CANISTER_ID = "224pv-saaaa-aaaaj-af7qa-cai";
const LOCAL_BACKEND_CANISTER_ID = "224pv-saaaa-aaaaj-af7qa-cai"; // Use your local canister ID
const BACKEND_CANISTER_ID = isLocalNet() ? LOCAL_BACKEND_CANISTER_ID : PROD_BACKEND_CANISTER_ID;

console.log("IDL Callbackend Environment:", isLocalNet() ? "Local" : "Production");
console.log("IDL Host being used:", isLocalNet() ? LOCAL_HOST : IC_HOST);
console.log("Backend canister ID:", BACKEND_CANISTER_ID);

// Create agent and actor
const createActor = async () => {
    let agent;
    
    if (isLocalNet()) {
        // Create an agent for local development with minimal CORS settings
        agent = new HttpAgent({
            host: LOCAL_HOST,
            fetchOptions: {
                // Don't include credentials to avoid CORS preflight requests
                credentials: 'omit'
                // Remove the custom headers that are causing CORS issues
            }
        });
        
        // Only fetch the root key in development
        await agent.fetchRootKey();
        console.log("IDL: Local agent created with CORS configuration");
    } else {
        agent = new HttpAgent({
            host: IC_HOST
        });
        console.log("IDL: Production agent created");
    }

    // Use type assertions to bypass compatibility issues
    return Actor.createActor(idlFactory as any, {
        agent,
        canisterId: BACKEND_CANISTER_ID,
    }) as any;
};

/**
 * Gets user tasks from the backend canister
 * @param principalId - The principal ID of the user
 * @returns A promise that resolves to an array of TaskData or null if no tasks found
 * @throws Will throw an error if the backend call fails
 */
export async function get_user_tasks(principalId: string): Promise<TaskData[] | null> {
    try {
        console.log("Fetching tasks for principal ID:", principalId);
        const actor = await createActor();
        const result = await actor.get_user_tasks(principalId) as TaskData[][];
        
        if (result.length === 0) {
            return null;
        }
        console.log("User tasks retrieved:", result[0]);
        return result[0]; // The API returns [Array<TaskData>] or []
    } catch (error) {
        console.error("Error fetching user tasks:", error);
        throw error;
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
        const actor = await createActor();
        const result = await actor.update_task_status(principalId, taskId, status) as { Ok: null } | { Err: string };
        return result;
    } catch (error) {
        console.error("Error updating task status:", error);
        return { Err: `Failed to update task status: ${error.message}` };
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
        const actor = await createActor();
        const result = await actor.claim_reward(
            dappPrincipalId ? [dappPrincipalId] : [], 
            walletPrincipalId ? [walletPrincipalId] : [], 
            amount
        );
        return Boolean(result);
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
    used_invite_code: string | [] | [string];  // 更灵活的类型定义，兼容多种形式的opt text
    total_rewards: bigint;
}): Promise<{ Ok: null } | { Err: string }> {
    try {
        // 处理used_invite_code字段，确保发送给Candid接口的是正确格式
        const processedInfo = {
            ...customInfo,
            used_invite_code: typeof customInfo.used_invite_code === "string" 
                ? [customInfo.used_invite_code] 
                : customInfo.used_invite_code
        };
        
        console.log("Adding custom info:", processedInfo);
        const actor = await createActor();
        const result = await actor.add_custom_info(processedInfo) as { Ok: null } | { Err: string };
        console.log("Custom info add result:", result);
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
        const actor = await createActor();
        const result = await actor.get_custom_info(
            dappPrincipalId ? [dappPrincipalId] : [], 
            walletPrincipalId ? [walletPrincipalId] : []
        );
        
        const resultArray = Array.isArray(result) ? result : [];
        return resultArray.length > 0 ? resultArray[0] : null;
    } catch (error) {
        console.error("Error fetching custom info:", error);
        return null;
    }
}


