import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
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
  ArrowRight
} from "lucide-react";

const TOPIC_AREAS = [
  { id: "politics", label: "Politics & Governance" },
  { id: "ethics", label: "Ethics & Philosophy" },
  { id: "technology", label: "Technology & Innovation" },
  { id: "economics", label: "Economics & Business" },
  { id: "social", label: "Social Issues" },
  { id: "environment", label: "Environment & Climate" },
  { id: "education", label: "Education" },
  { id: "health", label: "Health & Medicine" },
];

const DIFFICULTY_LEVELS = [
  { id: "novice", label: "Novice" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
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
      toast.success("Room created!");
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-foreground border-t-transparent animate-spin" />
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b-4 border-foreground">
        <div className="container flex items-center gap-6 h-20">
          <Link href="/lobby">
            <Button variant="ghost" size="icon" className="brutalist-border">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <span className="text-2xl font-black tracking-tighter uppercase">
            [CREATE ROOM]
          </span>
        </div>
      </nav>

      <main className="container pt-28 pb-12">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Step 1: Create Room */}
          <div className={`brutalist-border brutalist-shadow p-8 ${roomCode ? "opacity-60" : ""}`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 brutalist-border flex items-center justify-center font-black text-2xl team-gov">
                01
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">Create Room</h2>
                <p className="text-muted-foreground">Generate a unique room code</p>
              </div>
            </div>
            
            {!roomCode ? (
              <div className="space-y-6">
                <div className="brutalist-border p-6">
                  <p className="font-black uppercase mb-4">Asian Parliamentary Format</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>• 2 teams of 3 debaters</div>
                    <div>• 6 substantive speeches</div>
                    <div>• 7 minutes per speech</div>
                    <div>• POIs allowed</div>
                  </div>
                </div>
                <Button 
                  onClick={handleCreateRoom} 
                  disabled={createRoom.isPending}
                  className="w-full brutalist-border brutalist-shadow-hover transition-all uppercase font-black tracking-wider h-14 text-lg"
                >
                  {createRoom.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Room"
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-6 brutalist-border bg-muted/30">
                <div>
                  <p className="text-sm uppercase font-bold text-muted-foreground mb-1">Room Code</p>
                  <p className="text-5xl font-mono font-black tracking-widest">{roomCode}</p>
                </div>
                <Button variant="outline" size="icon" onClick={handleCopyCode} className="brutalist-border h-14 w-14">
                  {copied ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                </Button>
              </div>
            )}
          </div>

          {/* Step 2: Generate Motion */}
          <div className={`brutalist-border brutalist-shadow p-8 ${!roomCode ? "opacity-40 pointer-events-none" : ""}`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 brutalist-border flex items-center justify-center font-black text-2xl team-gov">
                02
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">Generate Motion</h2>
                <p className="text-muted-foreground">AI creates a debate motion</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-black uppercase">Topic Area</label>
                  <Select value={topicArea} onValueChange={setTopicArea}>
                    <SelectTrigger className="brutalist-border h-14 font-bold">
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                    <SelectContent className="brutalist-border">
                      {TOPIC_AREAS.map((topic) => (
                        <SelectItem key={topic.id} value={topic.id} className="font-medium">
                          {topic.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-black uppercase">Difficulty</label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger className="brutalist-border h-14 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="brutalist-border">
                      {DIFFICULTY_LEVELS.map((level) => (
                        <SelectItem key={level.id} value={level.id} className="font-medium">
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
                className="w-full brutalist-border brutalist-shadow-hover transition-all uppercase font-black tracking-wider h-14 text-lg gap-3"
              >
                {generateMotion.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Motion
                  </>
                )}
              </Button>

              {motion && (
                <div className="brutalist-border p-6 mt-6">
                  <h3 className="text-xl font-black uppercase mb-4">{motion.motion}</h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="font-bold uppercase text-muted-foreground mb-2">Background:</p>
                      <p className="leading-relaxed">{motion.backgroundContext}</p>
                    </div>
                    <div>
                      <p className="font-bold uppercase text-muted-foreground mb-2">Stakeholders:</p>
                      <div className="flex flex-wrap gap-2">
                        {motion.keyStakeholders.map((stakeholder, i) => (
                          <Badge key={i} className="brutalist-border uppercase font-bold">
                            {stakeholder}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Share & Start */}
          <div className={`brutalist-border brutalist-shadow p-8 ${!motion ? "opacity-40 pointer-events-none" : ""}`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 brutalist-border flex items-center justify-center font-black text-2xl team-gov">
                03
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">Share & Start</h2>
                <p className="text-muted-foreground">Invite debaters and begin</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="brutalist-border p-6 bg-muted/30">
                <p className="font-black uppercase mb-4">Next Steps:</p>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Share code <span className="font-mono font-black text-foreground">{roomCode}</span> with 5 debaters</li>
                  <li>Each debater selects team and speaker role</li>
                  <li>Start when ready (can start with fewer than 6)</li>
                </ol>
              </div>

              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={handleCopyCode} 
                  className="flex-1 brutalist-border uppercase font-black h-14 gap-2"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  Copy Code
                </Button>
                <Button 
                  onClick={handleGoToRoom} 
                  className="flex-1 brutalist-border brutalist-shadow-hover transition-all uppercase font-black h-14 gap-2"
                >
                  Go to Room
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
