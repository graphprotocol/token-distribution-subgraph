import { BigInt } from "@graphprotocol/graph-ts";
import {
  MasterCopyUpdated,
  TokenLockCreated,
  TokensDeposited,
  TokensWithdrawn,
  FunctionCallAuth,
  TokenDestinationAllowed,
} from "../types/GraphTokenLockManager/GraphTokenLockManager";

import {
  TokenManager,
  TokenLockWallet,
  AuthorizedFunction,
} from "../types/schema";
let managerAddress = "0x9401a6AB882F9f2C4658889f38b8d9a25AfE364F";

export function handleMasterCopyUpdated(event: MasterCopyUpdated): void {
  let tokenLock = TokenManager.load(managerAddress);
  if (tokenLock == null) {
    tokenLock = new TokenManager(managerAddress);
    tokenLock.tokens = BigInt.fromI32(0);
  }
  tokenLock.masterCopy = event.params.masterCopy;
  tokenLock.save();
}

/**
 * @param _contractAddress The address of the contract
 * @param _initHash The hash of the initializer
 * @param _beneficiary Address of the beneficiary of locked tokens
 * @param _token The token being used
 * @param _managedAmount Amount of tokens to be managed by the lock contract
 * @param _startTime Start time of the release schedule
 * @param _endTime End time of the release schedule
 * @param _periods Number of periods between start time and end time
 * @param _releaseStartTime Override time for when the releases start
 * @param _revocable Whether the contract is revocable
 * @param _vestingCliffTime Time the cliff vests, 0 if no cliff
 */
export function handleTokenLockCreated(event: TokenLockCreated): void {
  let tokenLock = new TokenLockWallet(
    event.params.contractAddress.toHexString()
  );
  tokenLock.initHash = event.params.initHash;
  tokenLock.beneficiary = event.params.beneficiary;
  tokenLock.token = event.params.token;
  tokenLock.managedAmount = event.params.managedAmount;
  tokenLock.startTime = event.params.startTime;
  tokenLock.endTime = event.params.endTime;
  tokenLock.periods = event.params.periods;
  tokenLock.releaseStartTime = event.params.releaseStartTime;
  tokenLock.vestingCliffTime = event.params.vestingCliffTime;
  if (event.params.revocable == 0) {
    tokenLock.revocable = "NotSet";
  } else if (event.params.revocable == 1) {
    tokenLock.revocable = "Enabled";
  } else {
    tokenLock.revocable = "Disabled";
  }
  tokenLock.save();
}

export function handleTokensDeposited(event: TokensDeposited): void {
  let tokenLock = TokenManager.load(managerAddress);
  tokenLock.tokens = tokenLock.tokens.plus(event.params.amount);
  tokenLock.save();
}

export function handleTokensWithdrawn(event: TokensWithdrawn): void {
  let tokenLock = TokenManager.load(managerAddress);
  tokenLock.tokens = tokenLock.tokens.minus(event.params.amount);
  tokenLock.save();
}

export function handleFunctionCallAuth(event: FunctionCallAuth): void {
  let auth = new AuthorizedFunction(event.params.signature);
  auth.target = event.params.target;
  auth.sigHash = event.params.sigHash;
  auth.manager = managerAddress;
  auth.save();
}

export function handleTokenDestinationAllowed(
  event: TokenDestinationAllowed
): void {
  let tokenLock = TokenManager.load(managerAddress);
  let destinations = tokenLock.tokenDestinations;

  if (destinations == null) {
    destinations = [];
  }
  let index = destinations.indexOf(event.params.dst);

  // It was not there before
  if (index == -1) {
    // Lets add it in
    if (event.params.allowed) {
      destinations.push(event.params.dst);
    }
    // If false was passed, we do nothing
    // It was there before
  } else {
    // We are revoking access
    if (!event.params.allowed) {
      destinations.splice(index, 1);
    }
    // Otherwise do nothing
  }
  tokenLock.tokenDestinations = destinations;
  tokenLock.save();
}
