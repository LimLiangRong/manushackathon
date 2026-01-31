import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  MessageSquare
} from "lucide-react";

export default function Lobby() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [roomCode, setRoomCode] = useState("");
  
  const { data: activeRooms, isLoading, refetch } = trpc.room.listActive.useQuery(undefined, {
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const debateHistory = trpc.profile.getDebateHistory.useQuery();

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="font-semibold text-lg">Debate Lobby</h1>
          </div>
          <Link href="/room/create">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Room
            </Button>
          </Link>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Join by Code */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Join by Room Code</CardTitle>
                <CardDescription>
                  Enter a 6-character room code to join a specific debate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter room code (e.g., ABC123)"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="font-mono text-lg tracking-wider"
                  />
                  <Button onClick={handleJoinByCode} disabled={roomCode.length !== 6}>
                    <Search className="w-4 h-4 mr-2" />
                    Join
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Active Rooms */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Active Debate Rooms</CardTitle>
                  <CardDescription>
                    Rooms waiting for participants to join
                  </CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => refetch()}>
                  <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : activeRooms && activeRooms.length > 0 ? (
                  <div className="space-y-3">
                    {activeRooms.map((room) => (
                      <div
                        key={room.id}
                        className="p-4 rounded-lg border hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono font-bold text-lg">
                                {room.roomCode}
                              </span>
                              <Badge variant="secondary">
                                {room.format.replace("_", " ")}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(room.createdAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                Waiting for players
                              </span>
                            </div>
                          </div>
                          <Link href={`/room/${room.roomCode}`}>
                            <Button size="sm">Join</Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No active rooms at the moment</p>
                    <p className="text-sm">Create a new room to start debating!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Welcome, {user.name || "Debater"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Debates Completed</span>
                  <span className="font-bold">{user.debatesCompleted || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Experience</span>
                  <Badge variant="outline" className="capitalize">
                    {user.experienceLevel || "Not set"}
                  </Badge>
                </div>
                <Link href="/profile">
                  <Button variant="outline" className="w-full">
                    Edit Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Debates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Recent Debates</CardTitle>
              </CardHeader>
              <CardContent>
                {debateHistory.isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                    ))}
                  </div>
                ) : debateHistory.data && debateHistory.data.length > 0 ? (
                  <div className="space-y-2">
                    {debateHistory.data.slice(0, 5).map((room) => (
                      <Link key={room.id} href={`/review/${room.roomCode}`}>
                        <div className="p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-sm">{room.roomCode}</span>
                            <Badge 
                              variant={room.status === "completed" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {room.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatDate(room.createdAt)}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No debates yet. Join or create a room to get started!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
