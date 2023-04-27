import { PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID } from '@metaplex-foundation/mpl-token-metadata';
import { PublicKey } from '@solana/web3.js';

export const getMetadataAccount = (mint: PublicKey): PublicKey => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('metadata', 'utf8'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    TOKEN_METADATA_PROGRAM_ID
  )[0];
};
