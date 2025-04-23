/**
 * Utility functions for interacting with the MUGC AGC backend canister
 * @module callmugcbackend
 */

/** Development mode flag based on local network status */
 
/**
 * Identity provider URL for authentication
 * Local development: http://{canister_id}.localhost:4943
 * Production: https://identity.ic0.app
 */



import { mugc_agc_backend } from "declarations/mugc-agc-backend";
import { UploaderPowContractInput } from "declarations/mugc-agc-backend/mugc-agc-backend.did";
import type {WorkLoadLedgerItem, WorkflowLedgerItem} from "declarations/mugc-agc-backend/mugc-agc-backend.did";
import { isLocalNet } from '@/utils/env';

// Mode
const development = isLocalNet();
// Identity provider URL
const IDENTITY_PROVIDER = development
  ? `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943` 
  : "https://identity.ic0.app";


/**
 * Stores workflow data in the backend canister
 * @param principalId - The principal ID of the user
 * @param workflowData - The workflow data to store
 * @returns A promise that resolves to either {Ok: string} on success or {Err: string} on failure
 * @throws Will return an error object if the backend call fails
 */
export async function storeWorkflowData(principalId: string, workflowData: string): Promise<{ Ok: string } | { Err: string }> {
    try {
        const result = await mugc_agc_backend.store_workflow_data(principalId, workflowData);
        return result;
    } catch (error) {
        return { Err: `Failed to store workflow data: ${error.message}` };
    }
}

/**
 * Stores an uploader POW (Proof of Work) contract in the backend canister
 * @param input - The UploaderPowContractInput object containing contract details
 * @returns A promise that resolves to either {Ok: null} on success or {Err: string} on failure
 * @throws Will return an error object if the backend call fails
 */
export async function storeUploaderPowContract(input: UploaderPowContractInput): Promise<{ Ok: null } | { Err: string }> {
    try {
        const result = await mugc_agc_backend.store_uploader_pow_contract(input);
        return result;
    } catch (error) {
        return { Err: `Failed to store uploader POW contract: ${error.message}` };
    }
}

/**
 * Queries workflow ledger entries for a specific principal ID
 * @param principalId - The principal ID to query workflows for
 * @returns A promise that resolves to either {Ok: WorkLoadLedgerItem[]} or {Err: string}
 * @throws Will return an error object if the backend call fails
 */
export async function query_workflow_ledger_by_principal_id(principalId: string): Promise<{ Ok: Array<WorkflowLedgerItem> } | { Err: string }> {
    try {
        console.log("Querying workflow ledger for principal ID:", principalId);
        const result = await mugc_agc_backend.query_workflow_ledger_by_principal_id(principalId);
        
        if (!result) {
            return { Err: "No ledger data found" };
        }

        // Let the caller handle the result structure directly since developer.tsx expects 
        // to check for 'Ok' or 'Err' properties when using setLedgerItems
        return result;

    } catch (error) {
        console.error("Query workflow ledger error:", error);
        return { Err: error.message || "Failed to query workflow ledger" };
    }
}