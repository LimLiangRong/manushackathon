import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database module
vi.mock("./db", () => ({
  updateUserProfile: vi.fn().mockResolvedValue(undefined),
  getUserDebateHistory: vi.fn().mockResolvedValue([]),
  createDebateRoom: vi.fn().mockResolvedValue(1),
  getDebateRoomByCode: vi.fn(),
  getDebateRoomById: vi.fn(),
  getParticipantWithUser: vi.fn(),
  getRoomParticipants: vi.fn().mockResolvedValue([]),
  addParticipant: vi.fn().mockResolvedValue(1),
  removeParticipant: vi.fn().mockResolvedValue(undefined),
  updateParticipantReady: vi.fn().mockResolvedValue(undefined),
  getActiveRooms: vi.fn().mockResolvedValue([]),
  updateDebateRoom: vi.fn().mockResolvedValue(undefined),
  getMotionById: vi.fn(),
  getUserById: vi.fn(),
  createMotion: vi.fn().mockResolvedValue(1),
  createSpeech: vi.fn().mockResolvedValue(1),
  updateSpeech: vi.fn().mockResolvedValue(undefined),
  getSpeechesByRoom: vi.fn().mockResolvedValue([]),
  createPOI: vi.fn().mockResolvedValue(1),
  createFeedback: vi.fn().mockResolvedValue(1),
  getFeedbackByRoom: vi.fn().mockResolvedValue([]),
  createArgumentNode: vi.fn().mockResolvedValue(1),
  getArgumentNodesByRoom: vi.fn().mockResolvedValue([]),
}));

// Mock LLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{
      message: {
        content: JSON.stringify({
          motion: "This House Would ban social media for minors",
          backgroundContext: "Social media usage among young people has increased dramatically",
          keyStakeholders: ["Parents", "Tech companies", "Children"]
        })
      }
    }]
  })
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(overrides?: Partial<AuthenticatedUser>): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("auth router", () => {
  it("returns user for authenticated request", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.auth.me();
    
    expect(result).toBeDefined();
    expect(result?.id).toBe(1);
    expect(result?.name).toBe("Test User");
  });

  it("returns null for unauthenticated request", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.auth.me();
    
    expect(result).toBeNull();
  });

  it("clears cookie on logout", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.auth.logout();
    
    expect(result).toEqual({ success: true });
    expect(ctx.res.clearCookie).toHaveBeenCalled();
  });
});

describe("profile router", () => {
  it("returns current user profile", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.profile.get();
    
    expect(result).toBeDefined();
    expect(result.id).toBe(1);
  });

  it("updates user profile", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const db = await import("./db");
    
    const result = await caller.profile.update({
      name: "Updated Name",
      bio: "Updated bio",
      experienceLevel: "intermediate",
    });
    
    expect(result).toEqual({ success: true });
    expect(db.updateUserProfile).toHaveBeenCalledWith(1, {
      name: "Updated Name",
      bio: "Updated bio",
      experienceLevel: "intermediate",
    });
  });

  it("rejects profile update for unauthenticated user", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(caller.profile.update({ name: "Test" }))
      .rejects.toThrow();
  });
});

describe("room router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a new debate room", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.room.create({ format: "asian_parliamentary" });
    
    expect(result).toHaveProperty("roomId");
    expect(result).toHaveProperty("roomCode");
    expect(result.roomCode).toHaveLength(6);
  });

  it("joins a room successfully", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const db = await import("./db");
    
    // Setup mocks
    vi.mocked(db.getDebateRoomByCode).mockResolvedValue({
      id: 1,
      roomCode: "ABC123",
      creatorId: 2,
      format: "asian_parliamentary",
      status: "waiting",
      currentPhase: "setup",
      currentSpeakerIndex: 0,
      motionId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      startedAt: null,
      endedAt: null,
    });
    vi.mocked(db.getParticipantWithUser).mockResolvedValue(null);
    vi.mocked(db.getRoomParticipants).mockResolvedValue([]);
    
    const result = await caller.room.join({
      roomCode: "ABC123",
      team: "government",
      speakerRole: "prime_minister",
    });
    
    expect(result).toEqual({ success: true, roomId: 1 });
    expect(db.addParticipant).toHaveBeenCalled();
  });

  it("rejects joining non-existent room", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const db = await import("./db");
    
    vi.mocked(db.getDebateRoomByCode).mockResolvedValue(null);
    
    await expect(caller.room.join({
      roomCode: "XXXXXX",
      team: "government",
      speakerRole: "prime_minister",
    })).rejects.toThrow("Room not found");
  });

  it("rejects joining room that is not waiting", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const db = await import("./db");
    
    vi.mocked(db.getDebateRoomByCode).mockResolvedValue({
      id: 1,
      roomCode: "ABC123",
      creatorId: 2,
      format: "asian_parliamentary",
      status: "in_progress",
      currentPhase: "debate",
      currentSpeakerIndex: 0,
      motionId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      startedAt: new Date(),
      endedAt: null,
    });
    
    await expect(caller.room.join({
      roomCode: "ABC123",
      team: "government",
      speakerRole: "prime_minister",
    })).rejects.toThrow("Room is not accepting participants");
  });

  it("rejects invalid team-role combination", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const db = await import("./db");
    
    vi.mocked(db.getDebateRoomByCode).mockResolvedValue({
      id: 1,
      roomCode: "ABC123",
      creatorId: 2,
      format: "asian_parliamentary",
      status: "waiting",
      currentPhase: "setup",
      currentSpeakerIndex: 0,
      motionId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      startedAt: null,
      endedAt: null,
    });
    vi.mocked(db.getParticipantWithUser).mockResolvedValue(null);
    vi.mocked(db.getRoomParticipants).mockResolvedValue([]);
    
    // Government team with opposition role
    await expect(caller.room.join({
      roomCode: "ABC123",
      team: "government",
      speakerRole: "leader_of_opposition",
    })).rejects.toThrow("Invalid role for Government team");
  });

  it("lists active rooms", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const db = await import("./db");
    
    vi.mocked(db.getActiveRooms).mockResolvedValue([
      {
        id: 1,
        roomCode: "ABC123",
        creatorId: 1,
        format: "asian_parliamentary",
        status: "waiting",
        currentPhase: "setup",
        currentSpeakerIndex: 0,
        motionId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        startedAt: null,
        endedAt: null,
      }
    ]);
    
    const result = await caller.room.listActive();
    
    expect(result).toHaveLength(1);
    expect(result[0].roomCode).toBe("ABC123");
  });

  it("sets participant ready status", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const db = await import("./db");
    
    vi.mocked(db.getParticipantWithUser).mockResolvedValue({
      id: 1,
      roomId: 1,
      userId: 1,
      team: "government",
      speakerRole: "prime_minister",
      isReady: false,
      joinedAt: new Date(),
    });
    
    const result = await caller.room.setReady({ roomId: 1, isReady: true });
    
    expect(result).toEqual({ success: true });
    expect(db.updateParticipantReady).toHaveBeenCalledWith(1, true);
  });
});

describe("motion router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generates a motion for a room", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.motion.generate({
      roomId: 1,
      topicArea: "technology",
      difficulty: "intermediate",
    });
    
    expect(result).toHaveProperty("motion");
    expect(result).toHaveProperty("backgroundContext");
    expect(result).toHaveProperty("keyStakeholders");
    expect(result.motion).toBe("This House Would ban social media for minors");
  });
});

describe("room start validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects start if not creator", async () => {
    const ctx = createAuthContext({ id: 2 }); // Different user
    const caller = appRouter.createCaller(ctx);
    const db = await import("./db");
    
    vi.mocked(db.getDebateRoomById).mockResolvedValue({
      id: 1,
      roomCode: "ABC123",
      creatorId: 1, // Creator is user 1
      format: "asian_parliamentary",
      status: "waiting",
      currentPhase: "setup",
      currentSpeakerIndex: 0,
      motionId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      startedAt: null,
      endedAt: null,
    });
    
    await expect(caller.room.start({ roomId: 1 }))
      .rejects.toThrow("Only the room creator can start the debate");
  });

  it("rejects start if no motion set", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const db = await import("./db");
    
    vi.mocked(db.getDebateRoomById).mockResolvedValue({
      id: 1,
      roomCode: "ABC123",
      creatorId: 1,
      format: "asian_parliamentary",
      status: "waiting",
      currentPhase: "setup",
      currentSpeakerIndex: 0,
      motionId: null, // No motion
      createdAt: new Date(),
      updatedAt: new Date(),
      startedAt: null,
      endedAt: null,
    });
    
    await expect(caller.room.start({ roomId: 1 }))
      .rejects.toThrow("A motion must be set before starting");
  });

  it("rejects start if not all participants ready", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const db = await import("./db");
    
    vi.mocked(db.getDebateRoomById).mockResolvedValue({
      id: 1,
      roomCode: "ABC123",
      creatorId: 1,
      format: "asian_parliamentary",
      status: "waiting",
      currentPhase: "setup",
      currentSpeakerIndex: 0,
      motionId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      startedAt: null,
      endedAt: null,
    });
    
    // 2 participants but not all ready
    vi.mocked(db.getRoomParticipants).mockResolvedValue([
      { id: 1, roomId: 1, userId: 1, team: "government", speakerRole: "prime_minister", isReady: true, joinedAt: new Date() },
      { id: 2, roomId: 1, userId: 2, team: "government", speakerRole: "deputy_prime_minister", isReady: false, joinedAt: new Date() }, // Not ready
    ]);
    
    await expect(caller.room.start({ roomId: 1 }))
      .rejects.toThrow("All participants must be ready");
  });

  it("starts debate successfully when all conditions met", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const db = await import("./db");
    
    vi.mocked(db.getDebateRoomById).mockResolvedValue({
      id: 1,
      roomCode: "ABC123",
      creatorId: 1,
      format: "asian_parliamentary",
      status: "waiting",
      currentPhase: "setup",
      currentSpeakerIndex: 0,
      motionId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      startedAt: null,
      endedAt: null,
    });
    
    // At least 1 participant ready (early start allowed)
    vi.mocked(db.getRoomParticipants).mockResolvedValue([
      { id: 1, roomId: 1, userId: 1, team: "government", speakerRole: "prime_minister", isReady: true, joinedAt: new Date() },
    ]);
    
    const result = await caller.room.start({ roomId: 1 });
    
    expect(result).toEqual({ success: true });
    expect(db.updateDebateRoom).toHaveBeenCalledWith(1, expect.objectContaining({
      status: "in_progress",
      currentPhase: "debate",
      currentSpeakerIndex: 0,
    }));
  });
});

describe("speaker advancement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("advances to next speaker", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const db = await import("./db");
    
    vi.mocked(db.getDebateRoomById).mockResolvedValue({
      id: 1,
      roomCode: "ABC123",
      creatorId: 1,
      format: "asian_parliamentary",
      status: "in_progress",
      currentPhase: "debate",
      currentSpeakerIndex: 0,
      motionId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      startedAt: new Date(),
      endedAt: null,
    });
    
    // Mock participants - all 6 speakers present
    vi.mocked(db.getRoomParticipants).mockResolvedValue([
      { id: 1, roomId: 1, userId: 1, team: "government", speakerRole: "prime_minister", isReady: true, joinedAt: new Date() },
      { id: 2, roomId: 1, userId: 2, team: "opposition", speakerRole: "leader_of_opposition", isReady: true, joinedAt: new Date() },
      { id: 3, roomId: 1, userId: 3, team: "government", speakerRole: "deputy_prime_minister", isReady: true, joinedAt: new Date() },
      { id: 4, roomId: 1, userId: 4, team: "opposition", speakerRole: "deputy_leader_of_opposition", isReady: true, joinedAt: new Date() },
      { id: 5, roomId: 1, userId: 5, team: "government", speakerRole: "government_whip", isReady: true, joinedAt: new Date() },
      { id: 6, roomId: 1, userId: 6, team: "opposition", speakerRole: "opposition_whip", isReady: true, joinedAt: new Date() },
    ]);
    
    const result = await caller.room.advanceSpeaker({ roomId: 1 });
    
    expect(result.completed).toBe(false);
    expect(result.nextSpeakerIndex).toBe(1);
    expect(db.updateDebateRoom).toHaveBeenCalledWith(1, { currentSpeakerIndex: 1 });
  });

  it("completes debate after last speaker", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const db = await import("./db");
    
    vi.mocked(db.getDebateRoomById).mockResolvedValue({
      id: 1,
      roomCode: "ABC123",
      creatorId: 1,
      format: "asian_parliamentary",
      status: "in_progress",
      currentPhase: "debate",
      currentSpeakerIndex: 7, // Last speaker (government_reply, 0-indexed)
      motionId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      startedAt: new Date(),
      endedAt: null,
    });
    
    // Mock participants - all 6 speakers present (reply speeches use PM and LO)
    vi.mocked(db.getRoomParticipants).mockResolvedValue([
      { id: 1, roomId: 1, userId: 1, team: "government", speakerRole: "prime_minister", isReady: true, joinedAt: new Date() },
      { id: 2, roomId: 1, userId: 2, team: "opposition", speakerRole: "leader_of_opposition", isReady: true, joinedAt: new Date() },
      { id: 3, roomId: 1, userId: 3, team: "government", speakerRole: "deputy_prime_minister", isReady: true, joinedAt: new Date() },
      { id: 4, roomId: 1, userId: 4, team: "opposition", speakerRole: "deputy_leader_of_opposition", isReady: true, joinedAt: new Date() },
      { id: 5, roomId: 1, userId: 5, team: "government", speakerRole: "government_whip", isReady: true, joinedAt: new Date() },
      { id: 6, roomId: 1, userId: 6, team: "opposition", speakerRole: "opposition_whip", isReady: true, joinedAt: new Date() },
    ]);
    
    const result = await caller.room.advanceSpeaker({ roomId: 1 });
    
    expect(result.completed).toBe(true);
    expect(result.nextSpeakerIndex).toBeNull();
    expect(db.updateDebateRoom).toHaveBeenCalledWith(1, expect.objectContaining({
      currentPhase: "feedback",
      status: "completed",
    }));
  });
});
