// Asian Parliamentary Debate Format Configuration
export const ASIAN_PARLIAMENTARY_FORMAT = {
  name: "Asian Parliamentary",
  teamsCount: 2,
  speakersPerTeam: 3,
  teams: ["government", "opposition"] as const,
  
  // Speaking order with time limits (in seconds)
  speakingOrder: [
    { role: "prime_minister", team: "government", label: "Prime Minister", time: 420, type: "substantive" },
    { role: "leader_of_opposition", team: "opposition", label: "Leader of Opposition", time: 420, type: "substantive" },
    { role: "deputy_prime_minister", team: "government", label: "Deputy Prime Minister", time: 420, type: "substantive" },
    { role: "deputy_leader_of_opposition", team: "opposition", label: "Deputy Leader of Opposition", time: 420, type: "substantive" },
    { role: "government_whip", team: "government", label: "Government Whip", time: 420, type: "substantive" },
    { role: "opposition_whip", team: "opposition", label: "Opposition Whip", time: 420, type: "substantive" },
    { role: "opposition_reply", team: "opposition", label: "Opposition Reply", time: 240, type: "reply" },
    { role: "government_reply", team: "government", label: "Government Reply", time: 240, type: "reply" },
  ] as const,
  
  // POI rules
  poi: {
    protectedTimeStart: 60, // First minute protected
    protectedTimeEnd: 60, // Last minute protected
    minDuration: 15, // Minimum POI duration in seconds
    maxDuration: 15, // Maximum POI duration
  },
  
  // Reply speech rules
  replyRules: {
    noNewArguments: true,
    speakerMustBePreviousSpeaker: true, // First or second speaker only
  }
} as const;

export type Team = typeof ASIAN_PARLIAMENTARY_FORMAT.teams[number];
export type SpeakerRole = typeof ASIAN_PARLIAMENTARY_FORMAT.speakingOrder[number]["role"];

// Topic areas for motion generation
export const TOPIC_AREAS = [
  { id: "politics", label: "Politics & Governance", icon: "🏛️" },
  { id: "ethics", label: "Ethics & Philosophy", icon: "⚖️" },
  { id: "technology", label: "Technology & Innovation", icon: "💻" },
  { id: "economics", label: "Economics & Business", icon: "📈" },
  { id: "social", label: "Social Issues", icon: "👥" },
  { id: "environment", label: "Environment & Climate", icon: "🌍" },
  { id: "education", label: "Education", icon: "📚" },
  { id: "health", label: "Health & Medicine", icon: "🏥" },
] as const;

export type TopicArea = typeof TOPIC_AREAS[number]["id"];

// Difficulty levels
export const DIFFICULTY_LEVELS = [
  { id: "novice", label: "Novice", description: "Simple, clear-cut issues with obvious stakeholders" },
  { id: "intermediate", label: "Intermediate", description: "Nuanced topics requiring balanced analysis" },
  { id: "advanced", label: "Advanced", description: "Complex issues with multiple competing interests" },
] as const;

export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number]["id"];

// Experience levels for user profiles
export const EXPERIENCE_LEVELS = [
  { id: "novice", label: "Novice", description: "New to competitive debating" },
  { id: "intermediate", label: "Intermediate", description: "Some tournament experience" },
  { id: "advanced", label: "Advanced", description: "Regular tournament participant" },
  { id: "expert", label: "Expert", description: "National/international level debater" },
] as const;

export type ExperienceLevel = typeof EXPERIENCE_LEVELS[number]["id"];

// Debate room statuses
export const ROOM_STATUSES = {
  waiting: "Waiting for participants",
  in_progress: "Debate in progress",
  completed: "Debate completed",
  cancelled: "Debate cancelled",
} as const;

// Debate phases
export const DEBATE_PHASES = {
  setup: "Setting up debate",
  debate: "Debate in progress",
  feedback: "Generating feedback",
  completed: "Completed",
} as const;

// Generate a random room code
export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Get speaker info by index
export function getSpeakerByIndex(index: number) {
  return ASIAN_PARLIAMENTARY_FORMAT.speakingOrder[index] || null;
}

// Check if POI is allowed at given time
export function isPOIAllowed(elapsedSeconds: number, totalTime: number): boolean {
  const { protectedTimeStart, protectedTimeEnd } = ASIAN_PARLIAMENTARY_FORMAT.poi;
  return elapsedSeconds >= protectedTimeStart && elapsedSeconds <= (totalTime - protectedTimeEnd);
}

// Format time as MM:SS
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Get team color
export function getTeamColor(team: Team): string {
  return team === "government" ? "#3B82F6" : "#EF4444";
}

// Get team label
export function getTeamLabel(team: Team): string {
  return team === "government" ? "Government (Proposition)" : "Opposition";
}
