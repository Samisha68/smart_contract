import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {  BijleeToken } from "../target/types/bijlee_token";
import { describe, it } from "node:test";

describe("smart_contract", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SmartContract as Program<BijleeToken>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
