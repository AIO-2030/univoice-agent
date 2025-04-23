import {IcrcLedgerCanister} from "@dfinity/ledger-icrc";
import {createAgent} from "@dfinity/utils";
import {createActor} from 'declarations/univoice-vmc-backend';
import {Principal} from "@dfinity/principal";

try {
    // Canister IDs are automatically expanded to .env config - see vite.config.ts
    const canisterId = import.meta.env.CANISTER_ID_UNIVOICE_VMC_BACKEND;
    const ledgerCanisterId = "";
    const nftCanisterId = "";

    // We pass the host instead of using a proxy to support NodeJS >= v17 (ViteJS issue: https://github.com/vitejs/vite/issues/4794)
    const host = import.meta.env.VITE_HOST;

    // Create an actor to interact with the IC for a particular canister ID
    const actor = createActor(canisterId, {agentOptions: {host}});
    const agent = await createAgent({ host });
    const ledger = IcrcLedgerCanister.create({canisterId: Principal.fromText(ledgerCanisterId), agent});

    let ownerPrincipal = Principal.fromText("");
    // fetch ICRC1 token transactions
    const icrc1Transactions = async () => {
        const account = {owner: ownerPrincipal, subaccount: null};
        const maxResults = 10n;
        const startIndex = BigInt(0);
        const transactionsResult = await ledger.getTransactions({account, max_results: maxResults, start: startIndex});

        if ("Ok" in transactionsResult) {
            const transactions = transactionsResult.Ok.transactions;
            console.log("Transactions:", transactions);
        } else {
            console.error("Error fetching transactions:", transactionsResult.Err.message);
        }
    };

    // query nft owner_of
    const fetchNftOwner = async (tokenId) => {
        const nftActor = createActor(nftCanisterId, {agentOptions: {host}});
        const owner = await nftActor.owner_of({token_id: BigInt(tokenId)});
        if (owner) {
            console.log(`Owner of NFT ${tokenId}:`, owner.owner.toText());
        } else {
            console.log(`NFT ${tokenId} has no owner.`);
        }
    };


    let input = '';
    let disabled = false;
    let greeting = '';
    // Call the IC
    greeting = await actor.greet(input);
} catch (err: unknown) {
    console.error(err);
}
