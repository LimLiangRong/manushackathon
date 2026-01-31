import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";
import { useLocation, Link } from "wouter";
import { 
  ArrowLeft, 
  Sparkles, 
  Copy, 
  Check,
  Loader2,
  Users,
  Clock,
  Info
} from "lucide-react";

const TOPIC_AREAS = [
  { id: "politics", label: "Politics & Governance", icon: "🏛️" },
  { id: "ethics", label: "Ethics & Philosophy", icon: "⚖️" },
  { id: "technology", label: "Technology & Innovation", icon: "💻" },
  { id: "economics", label: "Economics & Business", icon: "📈" },
  { id: "social", label: "Social Issues", icon: "👥" },
  { id: "environment", label: "Environment & Climate", icon: "🌍" },
  { id: "education", label: "Education", icon: "📚" },
  { id: "health", label: "Health & Medicine", icon: "🏥" },
];

const DIFFICULTY_LEVELS = [
  { id: "novice", label: "Novice", description: "Simple, clear-cut issues" },
  { id: "intermediate", label: "Intermediate", description: "Nuanced topics" },
  { id: "advanced", label: "Advanced", description: "Complex issues" },
];

export default function CreateRoom() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  
  const [topicArea, setTopicArea] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("intermediate");
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<number | null>(null);
  const [motion, setMotion] = useState<{
    motion: string;
    backgroundContext: string;
    keyStakeholders: string[];
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const createRoom = trpc.room.create.useMutation({
    onSuccess: (data) => {
      setRoomCode(data.roomCode);
      setRoomId(data.roomId);
      toast.success("Room created! Now generate a motion.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create room");
    },
  });

  const generateMotion = trpc.motion.generate.useMutation({
    onSuccess: (data) => {
      setMotion({
        motion: data.motion,
        backgroundContext: data.backgroundContext,
        keyStakeholders: data.keyStakeholders,
      });
      toast.success("Motion generated!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate motion");
    },
  });

  if (authLoading) {
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

  const handleCreateRoom = () => {
    createRoom.mutate({ format: "asian_parliamentary" });
  };

  const handleGenerateMotion = () => {
    if (!roomId || !topicArea) {
      toast.error("Please select a topic area first");
      return;
    }
    generateMotion.mutate({
      roomId,
      topicArea: topicArea as any,
      difficulty: difficulty as any,
    });
  };

  const handleCopyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      toast.success("Room code copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGoToRoom = () => {
    if (roomCode) {
      navigate(`/room/${roomCode}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex h-16 items-center gap-4">
          <Link href="/lobby">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-semibold text-lg">Create Debate Room</h1>
        </div>
      </header>

      <main className="container py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Step 1: Create Room */}
          <Card className={roomCode ? "opacity-60" : ""}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <CardTitle>Create Room</CardTitle>
                  <CardDescription>
                    Generate a unique room code for your debate
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!roomCode ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3 mb-3">
                      <Users className="w-5 h-5 text-primary" />
                      <span className="font-medium">Asian Parliamentary Format</span>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-8">
                      <li>• 2 teams of 3 debaters each</li>
                      <li>• 6 substantive speeches (7 min each)</li>
                      <li>• 2 reply speeches (4 min each)</li>
                      <li>• Points of Information allowed</li>
                    </ul>
                  </div>
                  <Button 
                    onClick={handleCreateRoom} 
                    disabled={createRoom.isPending}
                    className="w-full"
                  >
                    {createRoom.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Room"
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div>
                    <p className="text-sm text-muted-foreground">Room Code</p>
                    <p className="text-3xl font-mono font-bold tracking-wider">{roomCode}</p>
                  </div>
                  <Button variant="outline" size="icon" onClick={handleCopyCode}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Generate Motion */}
          <Card className={!roomCode ? "opacity-60 pointer-events-none" : ""}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <CardTitle>Generate Motion</CardTitle>
                  <CardDescription>
                    AI will create a debate motion based on your preferences
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Topic Area</label>
                  <Select value={topicArea} onValueChange={setTopicArea}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {TOPIC_AREAS.map((topic) => (
                        <SelectItem key={topic.id} value={topic.id}>
                          <span className="flex items-center gap-2">
                            <span>{topic.icon}</span>
                            <span>{topic.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty</label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTY_LEVELS.map((level) => (
                        <SelectItem key={level.id} value={level.id}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleGenerateMotion}
                disabled={!topicArea || generateMotion.isPending}
                className="w-full gap-2"
              >
                {generateMotion.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Motion
                  </>
                )}
              </Button>

              {motion && (
                <div className="mt-4 p-4 rounded-lg border bg-card">
                  <h3 className="font-semibold text-lg mb-2">{motion.motion}</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Background Context:</p>
                      <p>{motion.backgroundContext}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Key Stakeholders:</p>
                      <div className="flex flex-wrap gap-2">
                        {motion.keyStakeholders.map((stakeholder, i) => (
                          <Badge key={i} variant="secondary">{stakeholder}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 3: Share & Start */}
          <Card className={!motion ? "opacity-60 pointer-events-none" : ""}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <CardTitle>Share & Start</CardTitle>
                  <CardDescription>
                    Share the room code with other debaters and begin
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 flex items-start gap-3">
                <Info className="w-5 h-5 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Next Steps:</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Share the room code <strong>{roomCode}</strong> with 5 other debaters</li>
                    <li>Each debater joins and selects their team and speaker role</li>
                    <li>Once all 6 positions are filled and ready, start the debate</li>
                  </ol>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleCopyCode} className="flex-1 gap-2">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  Copy Room Code
                </Button>
                <Button onClick={handleGoToRoom} className="flex-1">
                  Go to Room
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
