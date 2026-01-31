import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Users,
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
      refetchInterval: 3000, // Poll every 3 seconds for updates
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

  // Check if current user is in the room
  const currentParticipant = roomData?.participants.find(p => p.userId === user?.id);
  const isCreator = roomData?.room.creatorId === user?.id;
  const allReady = roomData?.participants && roomData.participants.length >= 1 && 
    roomData.participants.every(p => p.isReady);

  // Redirect to debate if already in progress
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    navigate("/");
    return null;
  }

  if (error || !roomData) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container flex h-16 items-center gap-4">
            <Link href="/lobby">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="font-semibold text-lg">Room Not Found</h1>
          </div>
        </header>
        <main className="container py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">
                The room with code <strong>{roomCode}</strong> was not found or has been closed.
              </p>
              <Link href="/lobby">
                <Button>Back to Lobby</Button>
              </Link>
            </CardContent>
          </Card>
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/lobby">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-semibold text-lg">Debate Room</h1>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{roomCode}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopyCode}>
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
            </div>
          </div>
          <Badge variant={room.status === "waiting" ? "secondary" : "default"}>
            {room.status === "waiting" ? "Waiting for players" : room.status}
          </Badge>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Motion Card */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Motion</CardTitle>
              </CardHeader>
              <CardContent>
                {motion ? (
                  <div className="space-y-3">
                    <p className="text-xl font-semibold">{motion.motion}</p>
                    <p className="text-muted-foreground">{motion.backgroundContext}</p>
                    {motion.keyStakeholders && (
                      <div className="flex flex-wrap gap-2">
                        {(motion.keyStakeholders as string[]).map((s, i) => (
                          <Badge key={i} variant="outline">{s}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No motion set yet. The room creator needs to generate one.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Government Team */}
          <Card className="border-2 border-blue-500/30">
            <CardHeader className="bg-blue-500/10">
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Users className="w-5 h-5" />
                Government (Proposition)
              </CardTitle>
              <CardDescription>
                {participants.filter(p => p.team === "government").length}/3 speakers
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {SPEAKER_ROLES.government.map((role) => {
                const participant = participants.find(
                  p => p.team === "government" && p.speakerRole === role.id
                );
                return (
                  <div
                    key={role.id}
                    className={`p-3 rounded-lg border ${
                      participant ? "bg-blue-500/5 border-blue-500/30" : "border-dashed"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{role.label}</p>
                        {participant ? (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm">{participant.user?.name || "Unknown"}</span>
                            {participant.userId === room.creatorId && (
                              <Crown className="w-3 h-3 text-yellow-500" />
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">Empty</p>
                        )}
                      </div>
                      {participant && (
                        <Badge variant={participant.isReady ? "default" : "secondary"}>
                          {participant.isReady ? "Ready" : "Not Ready"}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Opposition Team */}
          <Card className="border-2 border-red-500/30">
            <CardHeader className="bg-red-500/10">
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Users className="w-5 h-5" />
                Opposition
              </CardTitle>
              <CardDescription>
                {participants.filter(p => p.team === "opposition").length}/3 speakers
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {SPEAKER_ROLES.opposition.map((role) => {
                const participant = participants.find(
                  p => p.team === "opposition" && p.speakerRole === role.id
                );
                return (
                  <div
                    key={role.id}
                    className={`p-3 rounded-lg border ${
                      participant ? "bg-red-500/5 border-red-500/30" : "border-dashed"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{role.label}</p>
                        {participant ? (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm">{participant.user?.name || "Unknown"}</span>
                            {participant.userId === room.creatorId && (
                              <Crown className="w-3 h-3 text-yellow-500" />
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">Empty</p>
                        )}
                      </div>
                      {participant && (
                        <Badge variant={participant.isReady ? "default" : "secondary"}>
                          {participant.isReady ? "Ready" : "Not Ready"}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Actions Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Your Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!currentParticipant ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Team</label>
                    <Select 
                      value={selectedTeam || ""} 
                      onValueChange={(v) => {
                        setSelectedTeam(v as "government" | "opposition");
                        setSelectedRole(null);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a team" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="government">
                          <span className="text-blue-600">Government (Proposition)</span>
                        </SelectItem>
                        <SelectItem value="opposition">
                          <span className="text-red-600">Opposition</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedTeam && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select Role</label>
                      <Select value={selectedRole || ""} onValueChange={setSelectedRole}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableRoles(selectedTeam).map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.label}
                            </SelectItem>
                          ))}
                          {getAvailableRoles(selectedTeam).length === 0 && (
                            <div className="p-2 text-sm text-muted-foreground">
                              All roles taken
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Button 
                    onClick={handleJoin}
                    disabled={!selectedTeam || !selectedRole || joinRoom.isPending}
                    className="w-full"
                  >
                    {joinRoom.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Join Room"
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Your Position</p>
                    <p className="font-medium">
                      {getRoleLabel(currentParticipant.speakerRole)}
                    </p>
                    <Badge 
                      variant="outline" 
                      className={currentParticipant.team === "government" ? "text-blue-600" : "text-red-600"}
                    >
                      {currentParticipant.team === "government" ? "Government" : "Opposition"}
                    </Badge>
                  </div>

                  <Button
                    onClick={handleToggleReady}
                    variant={currentParticipant.isReady ? "secondary" : "default"}
                    className="w-full"
                    disabled={setReady.isPending}
                  >
                    {currentParticipant.isReady ? "Cancel Ready" : "Ready Up"}
                  </Button>

                  <Button
                    onClick={handleLeave}
                    variant="outline"
                    className="w-full"
                    disabled={leaveRoom.isPending}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Leave Room
                  </Button>

                  {isCreator && (
                    <Button
                      onClick={handleStart}
                      disabled={!allReady || !motion || startDebate.isPending}
                      className="w-full"
                    >
                      {startDebate.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Start Debate
                        </>
                      )}
                    </Button>
                  )}

                  {!allReady && participants.length >= 1 && (
                    <p className="text-xs text-center text-muted-foreground">
                      Waiting for all participants to ready up...
                    </p>
                  )}
                  {participants.length < 6 && participants.length >= 1 && allReady && (
                    <p className="text-xs text-center text-muted-foreground">
                      {6 - participants.length} position(s) still open (optional)
                    </p>
                  )}
                  {participants.length === 0 && (
                    <p className="text-xs text-center text-muted-foreground">
                      Join the room to get started
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
