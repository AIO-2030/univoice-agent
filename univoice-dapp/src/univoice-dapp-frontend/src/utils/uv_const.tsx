export const WALLET_TYPE = {
  PLUG: 'plug',
  II: 'ii'
}

export type TransferResponse = {
  total_log:number;
  txIndex:number,
  to:string,
  fee : number,
  from : string,
  memo : number,
  created_at_time : number,
  amount : number
};

export const ERROR_MSG = {
  UNKNOWN_WALLET_TYPE: 'Unsupported wallet type',
  WALLET_NOT_CONNECTED: 'Wallet not yet connected or connection expired',
  USER_NOT_AUTH: 'Wallet not yet connected',
  // Transfer error messages
  INSUFFICIENT_FUNDS: 'Insufficient funds',
  BAD_BURN: 'Invalid burn operation',
  BAD_FEE: 'Invalid fee',
  TOO_OLD: 'Transaction timestamp too old',
  CREATED_IN_FUTURE: 'Transaction timestamp in future',
  TEMPORARILY_UNAVAILABLE: 'Service temporarily unavailable',
  DUPLICATE_TRANSACTION: 'Duplicate transaction',
  TRANSFER_FAILED: 'Transfer failed',
  UNKNOWN_ERROR: 'Unknown error'
}
