import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useLocation, Link, useParams } from "wouter";
import { 
  ArrowLeft, 
  Copy, 
  Check,
  Play,
  LogOut,
  Crown,
  Loader2
} from "lucide-react";

const SPEAKER_ROLES = {
  government: [
    { id: "prime_minister", label: "Prime Minister", order: 1 },
    { id: "deputy_prime_minister", label: "Deputy Prime Minister", order: 3 },
    { id: "government_whip", label: "Government Whip", order: 5 },
  ],
  opposition: [
    { id: "leader_of_opposition", label: "Leader of Opposition", order: 2 },
    { id: "deputy_leader_of_opposition", label: "Deputy Leader of Opposition", order: 4 },
    { id: "opposition_whip", label: "Opposition Whip", order: 6 },
  ],
};

export default function Room() {
  const params = useParams<{ code: string }>();
  const roomCode = params.code?.toUpperCase() || "";
  
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [copied, setCopied] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<"government" | "opposition" | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const utils = trpc.useUtils();

  const { data: roomData, isLoading, error } = trpc.room.get.useQuery(
    { roomCode },
    { 
      enabled: !!roomCode,
      refetchInterval: 3000,
    }
  );

  const joinRoom = trpc.room.join.useMutation({
    onSuccess: () => {
      toast.success("Joined the room!");
      utils.room.get.invalidate({ roomCode });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to join room");
    },
  });

  const leaveRoom = trpc.room.leave.useMutation({
    onSuccess: () => {
      toast.success("Left the room");
      utils.room.get.invalidate({ roomCode });
      setSelectedTeam(null);
      setSelectedRole(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to leave room");
    },
  });

  const setReady = trpc.room.setReady.useMutation({
    onSuccess: () => {
      utils.room.get.invalidate({ roomCode });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update ready status");
    },
  });

  const startDebate = trpc.room.start.useMutation({
    onSuccess: () => {
      toast.success("Debate starting!");
      navigate(`/debate/${roomCode}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to start debate");
    },
  });

  const currentParticipant = roomData?.participants.find(p => p.userId === user?.id);
  const isCreator = roomData?.room.creatorId === user?.id;
  const allReady = roomData?.participants && roomData.participants.length >= 1 && 
    roomData.participants.every(p => p.isReady);

  useEffect(() => {
    if (roomData?.room.status === "in_progress") {
      navigate(`/debate/${roomCode}`);
    }
    if (roomData?.room.status === "completed") {
      navigate(`/review/${roomCode}`);
    }
  }, [roomData?.room.status, roomCode, navigate]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-foreground border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    navigate("/");
    return null;
  }

  if (error || !roomData) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b-4 border-foreground">
          <div className="container flex items-center gap-6 h-20">
            <Link href="/lobby">
              <Button variant="ghost" size="icon" className="brutalist-border">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <span className="text-2xl font-black tracking-tighter uppercase">
              [ROOM NOT FOUND]
            </span>
          </div>
        </nav>
        <main className="container pt-28 pb-12">
          <div className="brutalist-border brutalist-shadow p-12 max-w-md mx-auto text-center">
            <p className="text-xl mb-6">
              Room <span className="font-mono font-black">{roomCode}</span> not found.
            </p>
            <Link href="/lobby">
              <Button className="brutalist-border brutalist-shadow-hover uppercase font-black">
                Back to Lobby
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const { room, participants, motion } = roomData;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    toast.success("Room code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = () => {
    if (!selectedTeam || !selectedRole) {
      toast.error("Please select a team and role");
      return;
    }
    joinRoom.mutate({
      roomCode,
      team: selectedTeam,
      speakerRole: selectedRole as "prime_minister" | "deputy_prime_minister" | "government_whip" | "leader_of_opposition" | "deputy_leader_of_opposition" | "opposition_whip",
    });
  };

  const handleLeave = () => {
    if (room.id) {
      leaveRoom.mutate({ roomId: room.id });
    }
  };

  const handleToggleReady = () => {
    if (room.id && currentParticipant) {
      setReady.mutate({ roomId: room.id, isReady: !currentParticipant.isReady });
    }
  };

  const handleStart = () => {
    if (room.id) {
      startDebate.mutate({ roomId: room.id });
    }
  };

  const getAvailableRoles = (team: "government" | "opposition") => {
    const takenRoles = participants
      .filter(p => p.team === team)
      .map(p => p.speakerRole);
    return SPEAKER_ROLES[team].filter(role => !takenRoles.includes(role.id as typeof takenRoles[number]));
  };

  const getRoleLabel = (roleId: string) => {
    const allRoles = [...SPEAKER_ROLES.government, ...SPEAKER_ROLES.opposition];
    return allRoles.find(r => r.id === roleId)?.label || roleId;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b-4 border-foreground">
        <div className="container flex items-center justify-between h-20">
          <div className="flex items-center gap-6">
            <Link href="/lobby">
              <Button variant="ghost" size="icon" className="brutalist-border">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-black tracking-tighter uppercase">
                [ROOM]
              </span>
              <span className="font-mono font-black text-3xl">{roomCode}</span>
              <Button variant="ghost" size="icon" onClick={handleCopyCode} className="brutalist-border h-10 w-10">
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </Button>
            </div>
          </div>
          <Badge className="brutalist-border uppercase font-black px-4 py-2 text-sm">
            {room.status === "waiting" ? "Waiting" : room.status}
          </Badge>
        </div>
      </nav>

      <main className="container pt-28 pb-12">
        {/* Motion */}
        <div className="brutalist-border brutalist-shadow p-8 mb-8">
          <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">Motion</h2>
          {motion ? (
            <div className="space-y-4">
              <p className="text-2xl md:text-3xl font-black uppercase">{motion.motion}</p>
              <p className="text-muted-foreground leading-relaxed">{motion.backgroundContext}</p>
              {motion.keyStakeholders && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {(motion.keyStakeholders as string[]).map((s, i) => (
                    <Badge key={i} className="brutalist-border uppercase font-bold">{s}</Badge>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">No motion set. Room creator needs to generate one.</p>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Government Team */}
          <div className="brutalist-border brutalist-shadow">
            <div className="p-6 team-gov">
              <h3 className="text-xl font-black uppercase tracking-tight">Government</h3>
              <p className="text-sm opacity-80">{participants.filter(p => p.team === "government").length}/3 speakers</p>
            </div>
            <div className="p-6 space-y-4">
              {SPEAKER_ROLES.government.map((role) => {
                const participant = participants.find(
                  p => p.team === "government" && p.speakerRole === role.id
                );
                return (
                  <div
                    key={role.id}
                    className={`p-4 border-2 ${
                      participant ? "border-foreground bg-muted/30" : "border-dashed border-muted-foreground/30"
                    }`}
                  >
                    <p className="font-black uppercase text-sm">{role.label}</p>
                    {participant ? (
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{participant.user?.name || "Unknown"}</span>
                          {participant.userId === room.creatorId && (
                            <Crown className="w-4 h-4" />
                          )}
                        </div>
                        <Badge className={`uppercase font-bold text-xs ${participant.isReady ? "team-gov" : ""}`}>
                          {participant.isReady ? "Ready" : "Not Ready"}
                        </Badge>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">Empty</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Opposition Team */}
          <div className="brutalist-border brutalist-shadow">
            <div className="p-6 team-opp">
              <h3 className="text-xl font-black uppercase tracking-tight">Opposition</h3>
              <p className="text-sm opacity-80">{participants.filter(p => p.team === "opposition").length}/3 speakers</p>
            </div>
            <div className="p-6 space-y-4">
              {SPEAKER_ROLES.opposition.map((role) => {
                const participant = participants.find(
                  p => p.team === "opposition" && p.speakerRole === role.id
                );
                return (
                  <div
                    key={role.id}
                    className={`p-4 border-2 ${
                      participant ? "border-foreground bg-muted/30" : "border-dashed border-muted-foreground/30"
                    }`}
                  >
                    <p className="font-black uppercase text-sm">{role.label}</p>
                    {participant ? (
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{participant.user?.name || "Unknown"}</span>
                          {participant.userId === room.creatorId && (
                            <Crown className="w-4 h-4" />
                          )}
                        </div>
                        <Badge className={`uppercase font-bold text-xs ${participant.isReady ? "team-opp" : ""}`}>
                          {participant.isReady ? "Ready" : "Not Ready"}
                        </Badge>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">Empty</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions Panel */}
          <div className="brutalist-border brutalist-shadow p-6">
            <h3 className="text-xl font-black uppercase tracking-tight mb-6">Your Actions</h3>
            
            {!currentParticipant ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-black uppercase">Select Team</label>
                  <Select 
                    value={selectedTeam || ""} 
                    onValueChange={(v) => {
                      setSelectedTeam(v as "government" | "opposition");
                      setSelectedRole(null);
                    }}
                  >
                    <SelectTrigger className="brutalist-border h-14 font-bold">
                      <SelectValue placeholder="Choose team" />
                    </SelectTrigger>
                    <SelectContent className="brutalist-border">
                      <SelectItem value="government" className="font-bold">Government</SelectItem>
                      <SelectItem value="opposition" className="font-bold">Opposition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedTeam && (
                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase">Select Role</label>
                    <Select value={selectedRole || ""} onValueChange={setSelectedRole}>
                      <SelectTrigger className="brutalist-border h-14 font-bold">
                        <SelectValue placeholder="Choose role" />
                      </SelectTrigger>
                      <SelectContent className="brutalist-border">
                        {getAvailableRoles(selectedTeam).map((role) => (
                          <SelectItem key={role.id} value={role.id} className="font-medium">
                            {role.label}
                          </SelectItem>
                        ))}
                        {getAvailableRoles(selectedTeam).length === 0 && (
                          <div className="p-3 text-sm text-muted-foreground">All roles taken</div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button 
                  onClick={handleJoin}
                  disabled={!selectedTeam || !selectedRole || joinRoom.isPending}
                  className="w-full brutalist-border brutalist-shadow-hover uppercase font-black h-14"
                >
                  {joinRoom.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Join Room"
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="brutalist-border p-4 bg-muted/30">
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Your Position</p>
                  <p className="font-black text-lg uppercase">
                    {getRoleLabel(currentParticipant.speakerRole)}
                  </p>
                  <Badge className={`mt-2 uppercase font-bold ${currentParticipant.team === "government" ? "team-gov" : "team-opp"}`}>
                    {currentParticipant.team}
                  </Badge>
                </div>

                <Button
                  onClick={handleToggleReady}
                  variant={currentParticipant.isReady ? "outline" : "default"}
                  className="w-full brutalist-border uppercase font-black h-14"
                  disabled={setReady.isPending}
                >
                  {currentParticipant.isReady ? "Cancel Ready" : "Ready Up"}
                </Button>

                <Button
                  onClick={handleLeave}
                  variant="outline"
                  className="w-full brutalist-border uppercase font-black h-14"
                  disabled={leaveRoom.isPending}
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Leave Room
                </Button>

                {isCreator && (
                  <Button
                    onClick={handleStart}
                    disabled={!allReady || !motion || startDebate.isPending}
                    className="w-full brutalist-border brutalist-shadow-hover uppercase font-black h-14"
                  >
                    {startDebate.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Start Debate
                      </>
                    )}
                  </Button>
                )}

                {!allReady && participants.length >= 1 && (
                  <p className="text-xs text-center text-muted-foreground uppercase">
                    Waiting for all to ready up...
                  </p>
                )}
                {participants.length < 6 && participants.length >= 1 && allReady && (
                  <p className="text-xs text-center text-muted-foreground uppercase">
                    {6 - participants.length} position(s) open (optional)
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
