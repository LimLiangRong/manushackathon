import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";
import { useLocation, Link } from "wouter";
import { 
  ArrowLeft, 
  Plus, 
  Users, 
  Clock, 
  Search,
  RefreshCw,
  ArrowRight
} from "lucide-react";

export default function Lobby() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [roomCode, setRoomCode] = useState("");
  
  const { data: activeRooms, isLoading, refetch } = trpc.room.listActive.useQuery(undefined, {
    refetchInterval: 10000,
  });

  const debateHistory = trpc.profile.getDebateHistory.useQuery();

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

  const handleJoinByCode = () => {
    if (roomCode.length !== 6) {
      toast.error("Room code must be 6 characters");
      return;
    }
    navigate(`/room/${roomCode.toUpperCase()}`);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b-4 border-foreground">
        <div className="container flex items-center justify-between h-20">
          <div className="flex items-center gap-6">
            <Link href="/">
              <Button variant="ghost" size="icon" className="brutalist-border">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <span className="text-2xl font-black tracking-tighter uppercase">
              [LOBBY]
            </span>
          </div>
          <Link href="/room/create">
            <Button className="brutalist-border brutalist-shadow-hover transition-all uppercase font-black tracking-wider px-6 py-3 h-auto">
              <Plus className="w-5 h-5 mr-2" />
              Create Room
            </Button>
          </Link>
        </div>
      </nav>

      <main className="container pt-28 pb-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Join by Code */}
            <div className="brutalist-border brutalist-shadow p-8">
              <h2 className="text-2xl font-black uppercase tracking-tight mb-2">
                Join by Code
              </h2>
              <p className="text-muted-foreground mb-6">
                Enter a 6-character room code to join a specific debate
              </p>
              <div className="flex gap-4">
                <Input
                  placeholder="ABC123"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="brutalist-border font-mono text-2xl tracking-widest h-14 px-4"
                />
                <Button 
                  onClick={handleJoinByCode} 
                  disabled={roomCode.length !== 6}
                  className="brutalist-border brutalist-shadow-hover transition-all uppercase font-black tracking-wider px-8 h-14"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Join
                </Button>
              </div>
            </div>

            {/* Active Rooms */}
            <div className="brutalist-border brutalist-shadow p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">
                    Active Rooms
                  </h2>
                  <p className="text-muted-foreground">
                    Rooms waiting for participants
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => refetch()}
                  className="brutalist-border"
                >
                  <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
                </Button>
              </div>
              
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-muted animate-pulse" />
                  ))}
                </div>
              ) : activeRooms && activeRooms.length > 0 ? (
                <div className="space-y-4">
                  {activeRooms.map((room) => (
                    <div
                      key={room.id}
                      className="brutalist-border p-6 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-4 mb-2">
                            <span className="font-mono font-black text-3xl">
                              {room.roomCode}
                            </span>
                            <Badge className="brutalist-border uppercase font-bold">
                              {room.format.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <span className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {formatDate(room.createdAt)}
                            </span>
                            <span className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              Waiting for players
                            </span>
                          </div>
                        </div>
                        <Link href={`/room/${room.roomCode}`}>
                          <Button className="brutalist-border brutalist-shadow-hover transition-all uppercase font-black">
                            Join
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border-4 border-dashed border-muted-foreground/30">
                  <p className="text-2xl font-black uppercase mb-2">No Active Rooms</p>
                  <p className="text-muted-foreground">Create a new room to start debating!</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* User Info */}
            <div className="brutalist-border brutalist-shadow p-6">
              <h3 className="text-xl font-black uppercase tracking-tight mb-4">
                {user.name || "Debater"}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b-2 border-foreground">
                  <span className="uppercase font-bold text-sm text-muted-foreground">Debates</span>
                  <span className="font-black text-2xl">{user.debatesCompleted || 0}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b-2 border-foreground">
                  <span className="uppercase font-bold text-sm text-muted-foreground">Level</span>
                  <span className="font-black uppercase">{user.experienceLevel || "—"}</span>
                </div>
                <Link href="/profile">
                  <Button variant="outline" className="w-full brutalist-border uppercase font-bold mt-4">
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </div>

            {/* Recent Debates */}
            <div className="brutalist-border brutalist-shadow p-6">
              <h3 className="text-xl font-black uppercase tracking-tight mb-4">
                Recent Debates
              </h3>
              {debateHistory.isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse" />
                  ))}
                </div>
              ) : debateHistory.data && debateHistory.data.length > 0 ? (
                <div className="space-y-3">
                  {debateHistory.data.slice(0, 5).map((room) => (
                    <Link key={room.id} href={`/review/${room.roomCode}`}>
                      <div className="p-4 border-2 border-foreground hover:bg-muted/30 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-lg">{room.roomCode}</span>
                          <Badge 
                            variant={room.status === "completed" ? "default" : "secondary"}
                            className="uppercase font-bold text-xs"
                          >
                            {room.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 uppercase">
                          {formatDate(room.createdAt)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8 border-2 border-dashed">
                  No debates yet
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
