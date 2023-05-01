import {
  Metadata,
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
} from '@metaplex-foundation/mpl-token-metadata';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import {
  SystemProgram,
  Connection,
  PublicKey,
  AccountMeta,
  SYSVAR_INSTRUCTIONS_PUBKEY,
} from '@solana/web3.js';

const TOKEN_AUTH_RULES_ID = new PublicKey('auth9SigNpDKz4sJJ1DfCTuZrZNSAgh9sFD3rboVmgg');

export const getMetadataAccount = (mint: PublicKey): PublicKey => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('metadata', 'utf8'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    TOKEN_METADATA_PROGRAM_ID
  )[0];
};

export const getMasterEditionAccount = (mint: PublicKey): PublicKey => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata', 'utf8'),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
      Buffer.from('edition', 'utf8'),
    ],
    TOKEN_METADATA_PROGRAM_ID
  )[0];
};

export function findTokenRecordPda(mint: PublicKey, token: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
      Buffer.from('token_record'),
      token.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  )[0];
}

export function findDelegateRecordPda(
  collectionMint: PublicKey,
  payer: PublicKey,
  delegate: PublicKey
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      collectionMint.toBuffer(),
      Buffer.from('programmable_config_delegate'),
      payer.toBuffer(),
      delegate.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  )[0];
}

/*

Sell Accounts

metadataProgram
delegateRecord isMut
tokenRecord isMut
tokenMint
edition
authRulesProgram
authRules
sysvarInstructions

*/

/*

Cancel Accounts

pub struct CancelRemainingAccounts<'info> {
    ///CHECK: checked in cancel function
    pub metadata_program: UncheckedAccount<'info>,
    ///CHECK: checked in cpi
    #[account(mut)]
    pub delegate_record: UncheckedAccount<'info>,
    ///CHECK: checked in cpi
    pub program_as_signer: UncheckedAccount<'info>,
    ///CHECK: checked in cpi
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,
    ///CHECK: checked in cpi
    pub edition: UncheckedAccount<'info>,
    ///CHECK: checked in cpi
    #[account(mut)]
    pub token_record: UncheckedAccount<'info>,
    ///CHECK: checked in cpi
    pub token_mint: UncheckedAccount<'info>,
    ///CHECK: checked in cpi
    pub auth_rules_program: UncheckedAccount<'info>,
    ///CHECK: checked in cpi
    pub auth_rules: UncheckedAccount<'info>,
    ///CHECK: checked in cpi
    pub sysvar_instructions: UncheckedAccount<'info>,
    ///CHECK: chekced in cpi
    pub system_program: UncheckedAccount<'info>,
}

*/

/*

Buy Accounts

pub struct ExecuteSaleRemainingAccounts<'info> {
    ///CHECK: checked in execute_sale function
    pub metadata_program: UncheckedAccount<'info>,
    ///CHECK: checked in cpi
    pub edition: UncheckedAccount<'info>,
    ///CHECK: checked in cpi
    #[account(mut)]
    pub owner_tr: UncheckedAccount<'info>,
    ///CHECK: checked in cpi
    #[account(mut)]
    pub destination_tr: UncheckedAccount<'info>,
    ///CHECK: checked in cpi
    pub auth_rules_program: UncheckedAccount<'info>,
    ///CHECK: checked in cpi
    pub auth_rules: UncheckedAccount<'info>,
    ///CHECK: checked in cpi
    pub sysvar_instructions: UncheckedAccount<'info>,
}
*/

interface PNFTAccounts {
  metadataProgram: AccountMeta;
  delegateRecord: AccountMeta;
  tokenRecord: AccountMeta;
  tokenMint: AccountMeta;
  edition: AccountMeta;
  authRulesProgram: AccountMeta;
  authRules: AccountMeta;
  sysvarInstructions: AccountMeta;
  programAsSigner: AccountMeta;
  systemProgram: AccountMeta;
  sellerTokenRecord: AccountMeta;
}

export const getPNFTAccounts = async (
  connection: Connection,
  wallet: PublicKey,
  programAsSigner: PublicKey,
  mint: PublicKey,
  seller?: PublicKey
): Promise<PNFTAccounts> => {
  const metadata = await Metadata.fromAccountAddress(connection, getMetadataAccount(mint));
  const ata = getAssociatedTokenAddressSync(mint, wallet);
  const tokenRecord = findTokenRecordPda(mint, ata);
  const masterEdition = getMasterEditionAccount(mint);
  const authRules = metadata.programmableConfig?.ruleSet;
  const pasAssociatedTokenAccount = getAssociatedTokenAddressSync(mint, programAsSigner, true);
  const delegateRecord = findTokenRecordPda(mint, pasAssociatedTokenAccount);
  let sellerTokenRecord = TOKEN_METADATA_PROGRAM_ID;

  if (seller) {
    const sellerATA = getAssociatedTokenAddressSync(mint, seller);
    sellerTokenRecord = findTokenRecordPda(mint, sellerATA);
  }

  return {
    metadataProgram: {
      isSigner: false,
      isWritable: false,
      pubkey: TOKEN_METADATA_PROGRAM_ID,
    },
    delegateRecord: {
      isSigner: false,
      isWritable: true,
      pubkey: delegateRecord ?? tokenRecord,
    },
    tokenRecord: {
      isSigner: false,
      isWritable: true,
      pubkey: tokenRecord,
    },
    tokenMint: {
      isSigner: false,
      isWritable: false,
      pubkey: mint,
    },
    edition: {
      isSigner: false,
      isWritable: false,
      pubkey: masterEdition,
    },
    authRulesProgram: {
      isSigner: false,
      isWritable: false,
      pubkey: TOKEN_AUTH_RULES_ID,
    },
    authRules: {
      isSigner: false,
      isWritable: false,
      pubkey: authRules ?? TOKEN_METADATA_PROGRAM_ID,
    },
    sysvarInstructions: {
      isSigner: false,
      isWritable: false,
      pubkey: SYSVAR_INSTRUCTIONS_PUBKEY,
    },
    programAsSigner: {
      isSigner: false,
      isWritable: false,
      pubkey: programAsSigner,
    },
    systemProgram: {
      isSigner: false,
      isWritable: false,
      pubkey: SystemProgram.programId,
    },
    sellerTokenRecord: {
      isSigner: false,
      isWritable: true,
      pubkey: sellerTokenRecord,
    },
  };
};
