import {
  L2BeneficiarySet,
  LockedFundsSentToL2,
  L2WalletAddressSet,
  ETHDeposited,
  ETHWithdrawn,
  ETHPulled
} from "../types/L1GraphTokenLockTransferTool/L1GraphTokenLockTransferTool";

import { TokenLockWallet } from "../types/schema";

export function handleLockedFundsSentToL2(event: LockedFundsSentToL2): void {
  let tokenLockWallet = TokenLockWallet.load(event.params.l1Wallet.toHexString())!;

  if(!tokenLockWallet.transferredToL2) {
    tokenLockWallet.l2WalletIsTokenLock = true
    tokenLockWallet.transferredToL2 = true
    tokenLockWallet.firstTransferredToL2At = event.block.timestamp
    tokenLockWallet.firstTransferredToL2AtBlockNumber = event.block.number
    tokenLockWallet.firstTransferredToL2AtTx = event.transaction.hash.toHexString()
  }
  tokenLockWallet.lastTransferredToL2At = event.block.timestamp
  tokenLockWallet.lastTransferredToL2AtBlockNumber = event.block.number
  tokenLockWallet.lastTransferredToL2AtTx = event.transaction.hash.toHexString()
  tokenLockWallet.tokensTransferredToL2 = tokenLockWallet.tokensTransferredToL2.plus(
    event.params.amount
  );
  tokenLockWallet.save();
}

export function handleL2WalletAddressSet(event: L2WalletAddressSet): void {
  let tokenLockWallet = TokenLockWallet.load(event.params.l1Wallet.toHexString())!;
  tokenLockWallet.l2WalletAddress = event.params.l2Wallet;
  tokenLockWallet.l2WalletIsTokenLock = tokenLockWallet.l2WalletIsTokenLock || false; // at this point we can't differentiate them, but at least we know it either has to be 
  tokenLockWallet.save();
}

export function handleL2BeneficiarySet(event: L2BeneficiarySet): void {
  let tokenLockWallet = TokenLockWallet.load(event.params.l1Wallet.toHexString())!;
  tokenLockWallet.l2Beneficiary = event.params.l2Beneficiary;
  tokenLockWallet.save();
}

export function handleETHDeposited(event: ETHDeposited): void {
  let tokenLockWallet = TokenLockWallet.load(event.params.tokenLock.toHexString())!;
  tokenLockWallet.ethBalance = tokenLockWallet.ethBalance.plus(
    event.params.amount
  );
  tokenLockWallet.save();
}

export function handleETHWithdrawn(event: ETHWithdrawn): void {
  let tokenLockWallet = TokenLockWallet.load(event.params.tokenLock.toHexString())!;
  tokenLockWallet.ethBalance = tokenLockWallet.ethBalance.minus(
    event.params.amount
  );
  tokenLockWallet.save();
}

export function handleETHPulled(event: ETHPulled): void {
  let tokenLockWallet = TokenLockWallet.load(event.params.tokenLock.toHexString())!;
  tokenLockWallet.ethBalance = tokenLockWallet.ethBalance.minus(
    event.params.amount
  );
  tokenLockWallet.save();
}
