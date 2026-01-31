import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Save, User, Trophy, X } from "lucide-react";
import { Link } from "wouter";

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

const EXPERIENCE_LEVELS = [
  { id: "novice", label: "Novice", description: "New to competitive debating" },
  { id: "intermediate", label: "Intermediate", description: "Some tournament experience" },
  { id: "advanced", label: "Advanced", description: "Regular tournament participant" },
  { id: "expert", label: "Expert", description: "National/international level debater" },
];

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<string>("");
  const [background, setBackground] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  
  const updateProfile = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
      setExperienceLevel(user.experienceLevel || "");
      setBackground(user.background || "");
      setSelectedTopics(user.topicalInterests || []);
    }
  }, [user]);

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

  const toggleTopic = (topicId: string) => {
    if (selectedTopics.includes(topicId)) {
      setSelectedTopics(selectedTopics.filter(t => t !== topicId));
    } else if (selectedTopics.length < 5) {
      setSelectedTopics([...selectedTopics, topicId]);
    } else {
      toast.error("You can select up to 5 topics");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({
      name,
      bio,
      experienceLevel: experienceLevel as any,
      background,
      topicalInterests: selectedTopics,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex h-16 items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-semibold text-lg">Your Profile</h1>
        </div>
      </header>

      <main className="container py-8">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Tell us about yourself so we can match you with suitable debate partners
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Short Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="A brief introduction about yourself..."
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    {bio.length}/500 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="background">Debate Background</Label>
                  <Textarea
                    id="background"
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    placeholder="Your debate experience, training, achievements..."
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    {background.length}/1000 characters
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Experience Level */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Experience Level
                </CardTitle>
                <CardDescription>
                  Help us match you with debaters of similar skill
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERIENCE_LEVELS.map((level) => (
                      <SelectItem key={level.id} value={level.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{level.label}</span>
                          <span className="text-xs text-muted-foreground">{level.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Topic Interests */}
            <Card>
              <CardHeader>
                <CardTitle>Topical Interests</CardTitle>
                <CardDescription>
                  Select up to 5 topics you're interested in debating (selected: {selectedTopics.length}/5)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {TOPIC_AREAS.map((topic) => {
                    const isSelected = selectedTopics.includes(topic.id);
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => toggleTopic(topic.id)}
                        className={`
                          p-3 rounded-lg border-2 text-left transition-all
                          ${isSelected 
                            ? "border-primary bg-primary/5" 
                            : "border-border hover:border-primary/50"
                          }
                        `}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{topic.icon}</span>
                          <span className="font-medium text-sm">{topic.label}</span>
                          {isSelected && (
                            <X className="w-4 h-4 ml-auto text-primary" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                {selectedTopics.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedTopics.map((topicId) => {
                      const topic = TOPIC_AREAS.find(t => t.id === topicId);
                      return (
                        <Badge key={topicId} variant="secondary" className="gap-1">
                          {topic?.icon} {topic?.label}
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Your Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <div className="text-3xl font-bold text-primary">
                      {user.debatesCompleted || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Debates Completed</div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <div className="text-3xl font-bold text-primary">
                      {user.profileCompleted ? "✓" : "—"}
                    </div>
                    <div className="text-sm text-muted-foreground">Profile Status</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <Link href="/">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={updateProfile.isPending} className="gap-2">
                {updateProfile.isPending ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Profile
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
