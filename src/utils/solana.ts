// https://github.com/debridge-finance/solana-tx-parser-public/blob/master/src/helpers.ts#L28
// integrated here to avoid security issues with npm packages
import { utils } from '@project-serum/anchor';
import {
  AccountMeta,
  CompiledInstruction,
  LoadedAddresses,
  Message,
  MessageCompiledInstruction,
  PartiallyDecodedInstruction,
  PublicKey,
  TransactionInstruction,
  VersionedMessage,
  VersionedTransactionResponse,
} from '@solana/web3.js';

export function parseTransactionAccounts<T extends Message | VersionedMessage>(
  message: T,
  loadedAddresses: T extends VersionedMessage ? LoadedAddresses | undefined : undefined = undefined
): AccountMeta[] {
  const accounts: PublicKey[] =
    message.version === 'legacy' ? message.accountKeys : message.staticAccountKeys;
  const readonlySignedAccountsCount = message.header.numReadonlySignedAccounts;
  const readonlyUnsignedAccountsCount = message.header.numReadonlyUnsignedAccounts;
  const requiredSignaturesAccountsCount = message.header.numRequiredSignatures;
  const totalAccounts = accounts.length;
  let parsedAccounts: AccountMeta[] = accounts.map((account, idx) => {
    const isWritable =
      idx < requiredSignaturesAccountsCount - readonlySignedAccountsCount ||
      (idx >= requiredSignaturesAccountsCount &&
        idx < totalAccounts - readonlyUnsignedAccountsCount);

    return {
      isSigner: idx < requiredSignaturesAccountsCount,
      isWritable,
      pubkey: new PublicKey(account),
    } as AccountMeta;
  });
  const [ALTWritable, ALTReadOnly] =
    message.version === 'legacy'
      ? [[], []]
      : loadedAddresses
      ? [loadedAddresses.writable, loadedAddresses.readonly]
      : [[], []]; // message.getAccountKeys({ accountKeysFromLookups: loadedAddresses }).keySegments().slice(1); // omit static keys
  if (ALTWritable)
    parsedAccounts = [
      ...parsedAccounts,
      ...ALTWritable.map((pubkey) => ({ isSigner: false, isWritable: true, pubkey })),
    ];
  if (ALTReadOnly)
    parsedAccounts = [
      ...parsedAccounts,
      ...ALTReadOnly.map((pubkey) => ({ isSigner: false, isWritable: false, pubkey })),
    ];

  return parsedAccounts;
}

/**
 * Converts compiled instruction into common TransactionInstruction
 * @param compiledInstruction
 * @param parsedAccounts account meta, result of {@link parseTransactionAccounts}
 * @returns TransactionInstruction
 */
export function compiledInstructionToInstruction<
  Ix extends CompiledInstruction | MessageCompiledInstruction
>(compiledInstruction: Ix, parsedAccounts: AccountMeta[]): TransactionInstruction {
  if (typeof compiledInstruction.data === 'string') {
    const ci = compiledInstruction as CompiledInstruction;

    return new TransactionInstruction({
      data: utils.bytes.bs58.decode(ci.data),
      programId: parsedAccounts[ci.programIdIndex].pubkey,
      keys: ci.accounts.map((accountIdx) => parsedAccounts[accountIdx]),
    });
  } else {
    const ci = compiledInstruction as MessageCompiledInstruction;

    return new TransactionInstruction({
      data: Buffer.from(ci.data),
      programId: parsedAccounts[ci.programIdIndex].pubkey,
      keys: ci.accountKeyIndexes.map((accountIndex) => {
        if (accountIndex >= parsedAccounts.length)
          throw new Error(
            `Trying to resolve account at index ${accountIndex} while parsedAccounts is only ${parsedAccounts.length}. \
						Looks like you're trying to parse versioned transaction, make sure that LoadedAddresses are passed to the \
						parseTransactionAccounts function`
          );

        return parsedAccounts[accountIndex];
      }),
    });
  }
}
