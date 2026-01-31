import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { 
  Users, 
  Mic, 
  Brain, 
  MessageSquare, 
  Clock, 
  Award,
  ArrowRight,
  Sparkles,
  Target,
  BarChart3
} from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">DebateArena</span>
          </div>
          <nav className="flex items-center gap-4">
            {loading ? (
              <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
            ) : isAuthenticated ? (
              <>
                <Link href="/lobby">
                  <Button variant="ghost">Debate Lobby</Button>
                </Link>
                <Link href="/profile">
                  <Button variant="outline">
                    {user?.name || "Profile"}
                  </Button>
                </Link>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button>Sign In</Button>
              </a>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-destructive/5" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Debate Practice
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Master Competitive Debating with{" "}
              <span className="text-primary">AI Assistance</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Practice real debates with real opponents. Our AI facilitates, transcribes, 
              and provides expert feedback to accelerate your debate skills.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <Link href="/room/create">
                    <Button size="lg" className="gap-2">
                      Create Debate Room
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/lobby">
                    <Button size="lg" variant="outline">
                      Join Existing Room
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <a href={getLoginUrl()}>
                    <Button size="lg" className="gap-2">
                      Get Started Free
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </a>
                  <Button size="lg" variant="outline" disabled>
                    Watch Demo
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything You Need to Excel</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform combines real human debate with AI-powered tools to give you 
              the most effective practice experience possible.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Live 3v3 Debates</CardTitle>
                <CardDescription>
                  Two teams of three debaters compete in real-time using Asian Parliamentary format
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>AI Motion Generation</CardTitle>
                <CardDescription>
                  Get unique debate motions tailored to your topic interests and skill level
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Automated Timekeeping</CardTitle>
                <CardDescription>
                  AI manages speaker turns, time limits, and POI windows automatically
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Mic className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Real-Time Transcription</CardTitle>
                <CardDescription>
                  Every speech is transcribed live with speaker labels and timestamps
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Argument Mindmap</CardTitle>
                <CardDescription>
                  Visualize the debate flow with AI-extracted arguments, rebuttals, and clashes
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Expert Feedback</CardTitle>
                <CardDescription>
                  Receive detailed post-debate analysis with personalized improvement suggestions
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes and experience professional-level debate practice
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Create or Join", desc: "Start a new debate room or join an existing one with a room code" },
              { step: "2", title: "Pick Your Role", desc: "Choose your team and speaker position in the Asian Parliamentary format" },
              { step: "3", title: "Debate Live", desc: "Engage in real-time debate with AI managing time and transcription" },
              { step: "4", title: "Get Feedback", desc: "Review AI-generated analysis, mindmaps, and personalized coaching" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <Award className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl font-bold mb-4">Ready to Improve Your Debate Skills?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Join debaters who are using AI-assisted practice to prepare for competitions.
          </p>
          {isAuthenticated ? (
            <Link href="/room/create">
              <Button size="lg" variant="secondary" className="gap-2">
                Start Your First Debate
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <a href={getLoginUrl()}>
              <Button size="lg" variant="secondary" className="gap-2">
                Sign Up Now
                <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">DebateArena</span>
          </div>
          <p className="text-sm text-muted-foreground">
            AI-Powered Debate Practice Platform for Coach Firoze
          </p>
        </div>
      </footer>
    </div>
  );
}
