import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("Maze Contract Tests", () => {
  
  describe("Admin Functions", () => {
    it("allows owner to transfer ownership", () => {
      const { result } = simnet.callPublicFn(
        "maze",
        "transferOwnerhip",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents non-owner from transferring ownership", () => {
      const { result } = simnet.callPublicFn(
        "maze",
        "transferOwnerhip",
        [Cl.principal(wallet2)],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(100)); // err-not-owner
    });

    it("allows owner to set token contract", () => {
      const { result } = simnet.callPublicFn(
        "maze",
        "set-token-contract",
        [Cl.principal(`${deployer}.test-token`)],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents non-owner from setting token contract", () => {
      const { result } = simnet.callPublicFn(
        "maze",
        "set-token-contract",
        [Cl.principal(`${deployer}.test-token`)],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(100)); // err-not-owner
    });
  });

  describe("Maze Management", () => {
    it("allows owner to create a maze", () => {
      const mazeHash = new Uint8Array(32).fill(1);
      const { result } = simnet.callPublicFn(
        "maze",
        "create-maze",
        [Cl.uint(1), Cl.buffer(mazeHash), Cl.uint(1000)],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents creating duplicate maze", () => {
      const mazeHash = new Uint8Array(32).fill(1);
      
      // Create first maze
      simnet.callPublicFn(
        "maze",
        "create-maze",
        [Cl.uint(1), Cl.buffer(mazeHash), Cl.uint(1000)],
        deployer
      );

      // Try to create duplicate
      const { result } = simnet.callPublicFn(
        "maze",
        "create-maze",
        [Cl.uint(1), Cl.buffer(mazeHash), Cl.uint(1000)],
        deployer
      );
      expect(result).toBeErr(Cl.uint(101)); // err-maze-already-exist
    });

    it("prevents non-owner from creating maze", () => {
      const mazeHash = new Uint8Array(32).fill(1);
      const { result } = simnet.callPublicFn(
        "maze",
        "create-maze",
        [Cl.uint(1), Cl.buffer(mazeHash), Cl.uint(1000)],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(100)); // err-not-owner
    });

    it("allows owner to set maze active status", () => {
      const mazeHash = new Uint8Array(32).fill(1);
      
      // Create maze
      simnet.callPublicFn(
        "maze",
        "create-maze",
        [Cl.uint(1), Cl.buffer(mazeHash), Cl.uint(1000)],
        deployer
      );

      // Set inactive
      const { result } = simnet.callPublicFn(
        "maze",
        "set-maze-active",
        [Cl.uint(1), Cl.bool(false)],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("returns error when setting status of non-existent maze", () => {
      const { result } = simnet.callPublicFn(
        "maze",
        "set-maze-active",
        [Cl.uint(999), Cl.bool(false)],
        deployer
      );
      expect(result).toBeErr(Cl.uint(102)); // err-maze-not-exist
    });
  });

  describe("Player Registration and Gameplay", () => {
    it("allows player to register", () => {
      const { result } = simnet.callPublicFn(
        "maze",
        "register-player",
        [],
        wallet1
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("allows registered player to start maze", () => {
      const mazeHash = new Uint8Array(32).fill(1);
      
      // Create maze
      simnet.callPublicFn(
        "maze",
        "create-maze",
        [Cl.uint(1), Cl.buffer(mazeHash), Cl.uint(1000)],
        deployer
      );

      // Register player
      simnet.callPublicFn("maze", "register-player", [], wallet1);

      // Start maze
      const { result } = simnet.callPublicFn(
        "maze",
        "start-maze",
        [Cl.uint(1)],
        wallet1
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents unregistered player from starting maze", () => {
      const mazeHash = new Uint8Array(32).fill(1);
      
      // Create maze
      simnet.callPublicFn(
        "maze",
        "create-maze",
        [Cl.uint(1), Cl.buffer(mazeHash), Cl.uint(1000)],
        deployer
      );

      // Try to start without registering
      const { result } = simnet.callPublicFn(
        "maze",
        "start-maze",
        [Cl.uint(1)],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(104)); // err-not-registered
    });

    it("prevents starting inactive maze", () => {
      const mazeHash = new Uint8Array(32).fill(1);
      
      // Create and deactivate maze
      simnet.callPublicFn(
        "maze",
        "create-maze",
        [Cl.uint(1), Cl.buffer(mazeHash), Cl.uint(1000)],
        deployer
      );
      simnet.callPublicFn(
        "maze",
        "set-maze-active",
        [Cl.uint(1), Cl.bool(false)],
        deployer
      );

      // Register and try to start
      simnet.callPublicFn("maze", "register-player", [], wallet1);
      const { result } = simnet.callPublicFn(
        "maze",
        "start-maze",
        [Cl.uint(1)],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(103)); // err-maze-inactive
    });
  });

  describe("Progress Submission", () => {
    it("allows player to submit correct solution", () => {
      // For testing: use empty buffer whose SHA256 hash is known
      const emptyBuffer = new Uint8Array(0);
      const emptyHash = new Uint8Array([
        0xe3, 0xb0, 0xc4, 0x42, 0x98, 0xfc, 0x1c, 0x14, 0x9a, 0xfb, 0xf4, 0xc8, 0x99, 0x6f, 0xb9, 0x24,
        0x27, 0xae, 0x41, 0xe4, 0x64, 0x9b, 0x93, 0x4c, 0xa4, 0x95, 0x99, 0x1b, 0x78, 0x52, 0xb8, 0x55
      ]);
      
      // Create maze with the hash of empty buffer
      simnet.callPublicFn(
        "maze",
        "create-maze",
        [Cl.uint(1), Cl.buffer(emptyHash), Cl.uint(1000)],
        deployer
      );

      // Register and start
      simnet.callPublicFn("maze", "register-player", [], wallet1);
      simnet.callPublicFn("maze", "start-maze", [Cl.uint(1)], wallet1);

      // Submit the empty buffer as solution (its SHA256 matches the stored hash)
      const { result } = simnet.callPublicFn(
        "maze",
        "submit-progress",
        [Cl.uint(1), Cl.buffer(emptyBuffer)],
        wallet1
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("rejects incorrect solution", () => {
      const correctPath = new Uint8Array(32).fill(1);
      const wrongPath = new Uint8Array(32).fill(2);
      
      // Create maze
      simnet.callPublicFn(
        "maze",
        "create-maze",
        [Cl.uint(1), Cl.buffer(correctPath), Cl.uint(1000)],
        deployer
      );

      // Register and start
      simnet.callPublicFn("maze", "register-player", [], wallet1);
      simnet.callPublicFn("maze", "start-maze", [Cl.uint(1)], wallet1);

      // Submit wrong solution
      const { result } = simnet.callPublicFn(
        "maze",
        "submit-progress",
        [Cl.uint(1), Cl.buffer(wrongPath)],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(115)); // err-invalid-path
    });

    it("prevents submission without starting maze", () => {
      const testPath = new Uint8Array(32).fill(1);
      
      // Create maze
      simnet.callPublicFn(
        "maze",
        "create-maze",
        [Cl.uint(1), Cl.buffer(testPath), Cl.uint(1000)],
        deployer
      );

      // Register but don't start
      simnet.callPublicFn("maze", "register-player", [], wallet1);

      // Try to submit
      const { result } = simnet.callPublicFn(
        "maze",
        "submit-progress",
        [Cl.uint(1), Cl.buffer(testPath)],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(108)); // err-attempt-not-found
    });
  });

  describe("Reward Claiming", () => {
    it("allows player to claim reward after completion", () => {
      const rewardAmount = 1000;
      
      // Use empty buffer solution (SHA256 hash is known)
      const emptyBuffer = new Uint8Array(0);
      const emptyHash = new Uint8Array([
        0xe3, 0xb0, 0xc4, 0x42, 0x98, 0xfc, 0x1c, 0x14, 0x9a, 0xfb, 0xf4, 0xc8, 0x99, 0x6f, 0xb9, 0x24,
        0x27, 0xae, 0x41, 0xe4, 0x64, 0x9b, 0x93, 0x4c, 0xa4, 0x95, 0x99, 0x1b, 0x78, 0x52, 0xb8, 0x55
      ]);
      
      // Setup: Create maze with hash, mint tokens to contract
      simnet.callPublicFn(
        "maze",
        "create-maze",
        [Cl.uint(1), Cl.buffer(emptyHash), Cl.uint(rewardAmount)],
        deployer
      );

      // Mint tokens to maze contract
      simnet.callPublicFn(
        "test-token",
        "mint",
        [Cl.uint(rewardAmount), Cl.principal(`${deployer}.maze`)],
        deployer
      );

      // Register, start, and complete maze
      simnet.callPublicFn("maze", "register-player", [], wallet1);
      simnet.callPublicFn("maze", "start-maze", [Cl.uint(1)], wallet1);
      simnet.callPublicFn(
        "maze",
        "submit-progress",
        [Cl.uint(1), Cl.buffer(emptyBuffer)],
        wallet1
      );

      // Claim reward
      const { result } = simnet.callPublicFn(
        "maze",
        "claim-reward",
        [Cl.uint(1), Cl.contractPrincipal(deployer, "test-token")],
        wallet1
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents claiming reward twice", () => {
      const rewardAmount = 1000;
      
      // Use empty buffer solution
      const emptyBuffer = new Uint8Array(0);
      const emptyHash = new Uint8Array([
        0xe3, 0xb0, 0xc4, 0x42, 0x98, 0xfc, 0x1c, 0x14, 0x9a, 0xfb, 0xf4, 0xc8, 0x99, 0x6f, 0xb9, 0x24,
        0x27, 0xae, 0x41, 0xe4, 0x64, 0x9b, 0x93, 0x4c, 0xa4, 0x95, 0x99, 0x1b, 0x78, 0x52, 0xb8, 0x55
      ]);
      
      // Setup
      simnet.callPublicFn(
        "maze",
        "create-maze",
        [Cl.uint(1), Cl.buffer(emptyHash), Cl.uint(rewardAmount)],
        deployer
      );
      simnet.callPublicFn(
        "test-token",
        "mint",
        [Cl.uint(rewardAmount * 2), Cl.principal(`${deployer}.maze`)],
        deployer
      );

      // Complete maze
      simnet.callPublicFn("maze", "register-player", [], wallet1);
      simnet.callPublicFn("maze", "start-maze", [Cl.uint(1)], wallet1);
      simnet.callPublicFn(
        "maze",
        "submit-progress",
        [Cl.uint(1), Cl.buffer(emptyBuffer)],
        wallet1
      );

      // Claim first time
      simnet.callPublicFn(
        "maze",
        "claim-reward",
        [Cl.uint(1), Cl.contractPrincipal(deployer, "test-token")],
        wallet1
      );

      // Try to claim again
      const { result } = simnet.callPublicFn(
        "maze",
        "claim-reward",
        [Cl.uint(1), Cl.contractPrincipal(deployer, "test-token")],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(110)); // err-reward-already-claimed
    });

    it("prevents claiming reward without completing maze", () => {
      const testPath = new Uint8Array(32).fill(1);
      
      // Setup
      simnet.callPublicFn(
        "maze",
        "create-maze",
        [Cl.uint(1), Cl.buffer(testPath), Cl.uint(1000)],
        deployer
      );

      // Register and start but don't complete
      simnet.callPublicFn("maze", "register-player", [], wallet1);
      simnet.callPublicFn("maze", "start-maze", [Cl.uint(1)], wallet1);

      // Try to claim
      const { result } = simnet.callPublicFn(
        "maze",
        "claim-reward",
        [Cl.uint(1), Cl.contractPrincipal(deployer, "test-token")],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(112)); // err-maze-not-completed
    });
  });

  describe("Read-Only Functions", () => {
    it("returns maze information", () => {
      const testPath = new Uint8Array(32).fill(1);
      
      simnet.callPublicFn(
        "maze",
        "create-maze",
        [Cl.uint(1), Cl.buffer(testPath), Cl.uint(1000)],
        deployer
      );

      const { result } = simnet.callReadOnlyFn(
        "maze",
        "get-maze",
        [Cl.uint(1)],
        wallet1
      );
      expect(result).toBeSome(
        Cl.tuple({
          "maze-hash": Cl.buffer(testPath),
          reward: Cl.uint(1000),
          active: Cl.bool(true),
        })
      );
    });

    it("returns player information", () => {
      simnet.callPublicFn("maze", "register-player", [], wallet1);

      const { result } = simnet.callReadOnlyFn(
        "maze",
        "player-info",
        [Cl.principal(wallet1)],
        wallet1
      );
      expect(result).toBeSome(
        Cl.tuple({
          registered: Cl.bool(true),
          "total-score": Cl.uint(0),
        })
      );
    });

    it("returns attempt information", () => {
      const testPath = new Uint8Array(32).fill(1);
      
      simnet.callPublicFn(
        "maze",
        "create-maze",
        [Cl.uint(1), Cl.buffer(testPath), Cl.uint(1000)],
        deployer
      );
      simnet.callPublicFn("maze", "register-player", [], wallet1);
      simnet.callPublicFn("maze", "start-maze", [Cl.uint(1)], wallet1);

      const { result } = simnet.callReadOnlyFn(
        "maze",
        "attempt-info",
        [Cl.principal(wallet1), Cl.uint(1)],
        wallet1
      );
      expect(result).toBeSome(
        Cl.tuple({
          startBlock: Cl.uint(simnet.blockHeight),
          inProgres: Cl.bool(true),
          completed: Cl.bool(false),
          "completion-block": Cl.none(),
        })
      );
    });
  });
});
