import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ChevronRight, ChevronDown, CheckCircle2, Dices } from "lucide-react";
import { MINDFUL_ACTIVITIES, CATEGORY_COLORS, type MindfulActivity } from "@/lib/activities";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

// ─── Yoga poses ───────────────────────────────────────────────────────────────
const YOGA_POSES = [
  {
    name: "Mountain Pose",
    sanskrit: "Tadasana",
    emoji: "🏔️",
    duration: "30–60 sec",
    level: "Beginner",
    description: "The foundation of all standing poses. Stand tall with feet together, arms at sides, weight evenly distributed.",
    benefits: ["Improves posture", "Strengthens legs", "Increases body awareness"],
    cue: "Imagine a string pulling the crown of your head toward the ceiling.",
  },
  {
    name: "Child's Pose",
    sanskrit: "Balasana",
    emoji: "🧸",
    duration: "1–3 min",
    level: "Beginner",
    description: "A resting pose. Kneel on the floor, sit back on your heels, and fold forward with arms extended or alongside your body.",
    benefits: ["Relieves back tension", "Calms the mind", "Stretches hips and thighs"],
    cue: "Breathe into your back — feel your ribcage expand with each inhale.",
  },
  {
    name: "Cat-Cow Stretch",
    sanskrit: "Marjaryasana-Bitilasana",
    emoji: "🐈",
    duration: "1–2 min",
    level: "Beginner",
    description: "On hands and knees, alternate arching your back toward the ceiling (cat) then dropping your belly toward the floor (cow).",
    benefits: ["Warms the spine", "Relieves back pain", "Improves coordination"],
    cue: "Link movement with breath: exhale to cat, inhale to cow.",
  },
  {
    name: "Warrior I",
    sanskrit: "Virabhadrasana I",
    emoji: "⚔️",
    duration: "30–45 sec each side",
    level: "Intermediate",
    description: "Lunge with front knee bent at 90°, back leg straight, arms raised overhead, hips square to the front.",
    benefits: ["Strengthens legs and core", "Opens hips and chest", "Builds confidence"],
    cue: "Press firmly through your back foot — feel rooted and powerful.",
  },
  {
    name: "Standing Forward Fold",
    sanskrit: "Uttanasana",
    emoji: "🙇",
    duration: "45–60 sec",
    level: "Beginner",
    description: "Stand with feet hip-width apart, hinge at the hips, and let your upper body hang heavy toward the floor.",
    benefits: ["Releases hamstrings", "Calms nervous system", "Relieves headaches"],
    cue: "Bend your knees slightly — the goal is relaxation, not straightness.",
  },
  {
    name: "Legs Up the Wall",
    sanskrit: "Viparita Karani",
    emoji: "🦵",
    duration: "3–10 min",
    level: "Beginner",
    description: "Lie on your back with legs extended straight up against a wall. Arms rest open at your sides.",
    benefits: ["Reduces swollen ankles", "Calms anxiety", "Relieves lower back pain"],
    cue: "This is pure restoration — close your eyes and simply breathe.",
  },
];

// ─── Focus game ───────────────────────────────────────────────────────────────
function FocusGame() {
  const COLORS = ["#D4956A", "#8B9D77", "#6B8CAE", "#B78AB4", "#C5A158"];
  const COLOR_NAMES = ["Terracotta", "Sage", "Sky", "Lavender", "Amber"];
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSeq, setUserSeq] = useState<number[]>([]);
  const [lit, setLit] = useState<number | null>(null);
  const [phase, setPhase] = useState<"idle" | "showing" | "playing" | "success" | "fail">("idle");
  const [score, setScore] = useState(0);

  const startGame = () => {
    const first = Math.floor(Math.random() * 5);
    const newSeq = [first];
    setSequence(newSeq);
    setUserSeq([]);
    setScore(0);
    flashSequence(newSeq);
  };

  const flashSequence = (seq: number[]) => {
    setPhase("showing");
    let i = 0;
    const show = () => {
      if (i >= seq.length) {
        setLit(null);
        setTimeout(() => setPhase("playing"), 500);
        return;
      }
      setLit(seq[i]);
      i++;
      setTimeout(() => { setLit(null); setTimeout(show, 300); }, 700);
    };
    setTimeout(show, 500);
  };

  const handleColorTap = (idx: number) => {
    if (phase !== "playing") return;
    const newUser = [...userSeq, idx];
    setUserSeq(newUser);

    if (newUser[newUser.length - 1] !== sequence[newUser.length - 1]) {
      setPhase("fail");
      return;
    }
    if (newUser.length === sequence.length) {
      const newScore = score + 1;
      setScore(newScore);
      setTimeout(() => {
        const next = [...sequence, Math.floor(Math.random() * 5)];
        setSequence(next);
        setUserSeq([]);
        flashSequence(next);
      }, 500);
      setPhase("success");
    }
  };

  return (
    <Card className="bg-card">
      <CardHeader>
        <h2 className="text-xl flex items-center gap-2 font-semibold leading-none tracking-tight">
          <Dices className="w-5 h-5 text-primary" aria-hidden="true" /> Color Memory
        </h2>
        <CardDescription>Watch the sequence, repeat it. A mindful attention workout.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Score</span>
          <span className="font-serif text-2xl text-foreground">{score}</span>
        </div>

        {/* Color grid */}
        <div className="grid grid-cols-5 gap-2">
          {COLORS.map((color, i) => (
            <motion.button
              key={i}
              onClick={() => handleColorTap(i)}
              disabled={phase !== "playing"}
              whileTap={{ scale: 0.92 }}
              animate={{ scale: lit === i ? 1.12 : 1, opacity: lit === i ? 1 : 0.75 }}
              transition={{ duration: 0.15 }}
              className="aspect-square rounded-2xl shadow-sm cursor-pointer disabled:cursor-default transition-opacity"
              style={{ backgroundColor: color, boxShadow: lit === i ? `0 0 20px ${color}80` : undefined }}
              aria-label={`${COLOR_NAMES[i]} memory tile`}
            />
          ))}
        </div>

        {/* Status */}
        <AnimatePresence mode="wait">
          {phase === "idle" && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Button className="w-full rounded-xl" onClick={startGame}>
                <Play className="w-4 h-4 mr-2" /> Start Game
              </Button>
            </motion.div>
          )}
          {phase === "showing" && (
            <motion.p key="showing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-muted-foreground text-sm py-2">
              Watch carefully…
            </motion.p>
          )}
          {phase === "playing" && (
            <motion.p key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-primary text-sm font-medium py-2">
              Your turn! Repeat the sequence.
            </motion.p>
          )}
          {phase === "success" && (
            <motion.p key="success" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-center text-emerald-600 text-sm font-medium py-2">
              ✓ Well done! Next round…
            </motion.p>
          )}
          {phase === "fail" && (
            <motion.div key="fail" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-2">
              <p className="text-center text-rose-500 text-sm font-medium">✗ Game over! Score: {score}</p>
              <Button variant="outline" size="sm" className="rounded-xl" onClick={startGame}>Try again</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// ─── Activity card ────────────────────────────────────────────────────────────
function ActivityCard({ activity, defaultOpen = false }: { activity: MindfulActivity; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [done, setDone] = useState(false);

  return (
    <Card className={cn("bg-card transition-all duration-200", done && "border-primary/30 bg-primary/5")}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full text-left"
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">{activity.emoji}</span>
              <div>
                <h2 className="text-base font-semibold leading-none tracking-tight">{activity.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className={cn("text-xs", CATEGORY_COLORS[activity.category])}>
                    {activity.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">⏱ {activity.duration}</span>
                </div>
              </div>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200", open && "rotate-180")} aria-hidden="true" />
          </div>
        </CardHeader>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <CardContent className="pt-0 pb-4 space-y-4">
              <p className="text-muted-foreground text-sm leading-relaxed">{activity.description}</p>
              {activity.steps && (
                <ol className="space-y-2">
                  {activity.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-foreground/80 leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              )}
              <Button
                variant={done ? "secondary" : "default"}
                size="sm"
                className="rounded-xl"
                onClick={() => setDone(!done)}
              >
                {done ? (
                  <><CheckCircle2 className="w-4 h-4 mr-2 text-primary" /> Completed</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4 mr-2" /> Mark complete</>
                )}
              </Button>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MindfulPage() {
  const [yogaOpen, setYogaOpen] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"activities" | "yoga" | "game">("activities");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-serif text-foreground flex items-center gap-3">
          <Sparkles className="w-7 h-7 text-primary opacity-80" aria-hidden="true" />
          Mindful Activities
        </h1>
        <p className="text-muted-foreground text-lg">
          Small practices that add up to big change.
        </p>
      </header>

      {/* Tab selector */}
      <div className="flex gap-2 border-b border-border pb-0">
        {(["activities", "yoga", "game"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            aria-pressed={activeTab === tab}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-200 capitalize",
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab === "activities" ? "Daily Practices" : tab === "yoga" ? "Yoga Guide" : "Focus Game"}
          </button>
        ))}
      </div>

      {/* Activities tab */}
      {activeTab === "activities" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {MINDFUL_ACTIVITIES.length} practices — from breathing to creative flow.
            </p>
            <Link href="/breathe">
              <Button variant="outline" size="sm" className="rounded-xl gap-2">
                🌬️ Breathing <ChevronRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {MINDFUL_ACTIVITIES.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Yoga tab */}
      {activeTab === "yoga" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Beginner-friendly poses with breath cues. Hold each pose with gentle attention.
          </p>
          <div className="space-y-3">
            {YOGA_POSES.map((pose, idx) => (
              <Card key={pose.name} className="bg-card">
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => setYogaOpen(yogaOpen === idx ? null : idx)}
                  aria-expanded={yogaOpen === idx}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl" aria-hidden="true">{pose.emoji}</span>
                        <div>
                          <h2 className="text-base font-semibold leading-none tracking-tight">{pose.name}</h2>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground italic">{pose.sanskrit}</span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <Badge variant="secondary" className="text-xs">{pose.level}</Badge>
                            <span className="text-xs text-muted-foreground">⏱ {pose.duration}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200", yogaOpen === idx && "rotate-180")} aria-hidden="true" />
                    </div>
                  </CardHeader>
                </button>

                <AnimatePresence>
                  {yogaOpen === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <CardContent className="pt-0 pb-5 space-y-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">{pose.description}</p>
                        <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
                          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Teacher's cue</p>
                          <p className="text-sm text-foreground italic">"{pose.cue}"</p>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Benefits</p>
                          <div className="flex flex-wrap gap-2">
                            {pose.benefits.map((b) => (
                              <Badge key={b} variant="secondary" className="text-xs rounded-full">{b}</Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Game tab */}
      {activeTab === "game" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md">
          <div className="space-y-3 mb-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Mindfulness isn't just about stillness — it's about training your attention. This color memory game exercises your focus in a playful way. A few rounds a day strengthens your ability to stay present.
            </p>
          </div>
          <FocusGame />
        </motion.div>
      )}
    </motion.div>
  );
}

// Missing import for Play button in FocusGame
function Play({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
