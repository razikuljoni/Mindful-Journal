import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Volume2, VolumeX, CheckCircle2, Wind } from "lucide-react";
import { useCreateBreathingSession, useGetBreathingStats } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// ─── Breathing techniques ────────────────────────────────────────────────────
interface Phase {
  label: string;
  seconds: number;
  color: string;
  scale: number;
}

interface Technique {
  id: "box" | "478" | "deep-belly" | "coherent";
  name: string;
  description: string;
  emoji: string;
  phases: Phase[];
  defaultSets: number;
  benefit: string;
}

const TECHNIQUES: Technique[] = [
  {
    id: "box",
    name: "Box Breathing",
    description: "4-4-4-4 • Used by Navy SEALs to stay calm under pressure",
    emoji: "⬜",
    benefit: "Reduces stress, improves focus",
    defaultSets: 4,
    phases: [
      { label: "Breathe In", seconds: 4, color: "#8B9D77", scale: 1.4 },
      { label: "Hold", seconds: 4, color: "#D4956A", scale: 1.4 },
      { label: "Breathe Out", seconds: 4, color: "#6B8CAE", scale: 0.7 },
      { label: "Hold", seconds: 4, color: "#B8A398", scale: 0.7 },
    ],
  },
  {
    id: "478",
    name: "4-7-8 Breathing",
    description: "4-7-8 • The \"relaxing breath\" — calms in 60 seconds",
    emoji: "🌙",
    benefit: "Reduces anxiety, aids sleep",
    defaultSets: 4,
    phases: [
      { label: "Breathe In", seconds: 4, color: "#8B9D77", scale: 1.4 },
      { label: "Hold", seconds: 7, color: "#D4956A", scale: 1.4 },
      { label: "Breathe Out", seconds: 8, color: "#6B8CAE", scale: 0.7 },
    ],
  },
  {
    id: "deep-belly",
    name: "Deep Belly Breathing",
    description: "5-5 • Activates the parasympathetic nervous system",
    emoji: "🌊",
    benefit: "Lowers heart rate, reduces tension",
    defaultSets: 6,
    phases: [
      { label: "Breathe In", seconds: 5, color: "#8B9D77", scale: 1.45 },
      { label: "Breathe Out", seconds: 5, color: "#6B8CAE", scale: 0.65 },
    ],
  },
  {
    id: "coherent",
    name: "Coherent Breathing",
    description: "5.5-5.5 • The resonance frequency of the heart",
    emoji: "💛",
    benefit: "Heart rate variability, deep calm",
    defaultSets: 5,
    phases: [
      { label: "Breathe In", seconds: 5, color: "#8B9D77", scale: 1.4 },
      { label: "Breathe Out", seconds: 5, color: "#6B8CAE", scale: 0.7 },
    ],
  },
];

// ─── Web Audio tones ──────────────────────────────────────────────────────────
function useAudioContext() {
  const ctxRef = useRef<AudioContext | null>(null);
  const getCtx = useCallback(() => {
    if (!ctxRef.current || ctxRef.current.state === "closed") {
      ctxRef.current = new AudioContext();
    }
    return ctxRef.current;
  }, []);
  return getCtx;
}

function playTone(getCtx: () => AudioContext, freq: number, duration: number, vol = 0.2) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = "sine";
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.05);
    gain.gain.linearRampToValueAtTime(0, now + duration - 0.05);
    osc.start(now);
    osc.stop(now + duration);
  } catch (_) {
    // silently ignore if audio context is unavailable
  }
}

// Frequencies per phase type
const PHASE_TONES: Record<string, number> = {
  "Breathe In": 396,
  "Hold": 528,
  "Breathe Out": 285,
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function BreathePage() {
  const [selectedTechnique, setSelectedTechnique] = useState<Technique>(TECHNIQUES[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [currentSecond, setCurrentSecond] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [targetSets, setTargetSets] = useState(TECHNIQUES[0].defaultSets);
  const [isComplete, setIsComplete] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  const getCtx = useAudioContext();
  const createSession = useCreateBreathingSession();
  const { data: stats, refetch: refetchStats } = useGetBreathingStats();
  const { toast } = useToast();

  const currentPhase = selectedTechnique.phases[currentPhaseIndex];
  const totalPhaseDuration = currentPhase?.seconds ?? 1;

  // Reset when technique changes
  useEffect(() => {
    setIsRunning(false);
    setCurrentPhaseIndex(0);
    setCurrentSecond(0);
    setCurrentSet(1);
    setIsComplete(false);
    setTargetSets(selectedTechnique.defaultSets);
  }, [selectedTechnique]);

  // Core timer
  useEffect(() => {
    if (!isRunning || isComplete) return;

    const interval = setInterval(() => {
      setCurrentSecond((prev) => {
        const next = prev + 1;
        if (next >= totalPhaseDuration) {
          // Move to next phase
          const nextPhaseIdx = (currentPhaseIndex + 1) % selectedTechnique.phases.length;
          const isEndOfSet = nextPhaseIdx === 0;

          if (isEndOfSet) {
            const nextSet = currentSet + 1;
            if (nextSet > targetSets) {
              // Done!
              setIsRunning(false);
              setIsComplete(true);
              const elapsed = sessionStartTime
                ? Math.round((Date.now() - sessionStartTime) / 1000)
                : targetSets * selectedTechnique.phases.reduce((s, p) => s + p.seconds, 0);
              saveSession(elapsed);
              return 0;
            }
            setCurrentSet(nextSet);
          }

          setCurrentPhaseIndex(nextPhaseIdx);
          const nextPhase = selectedTechnique.phases[nextPhaseIdx];
          if (soundEnabled) {
            playTone(getCtx, PHASE_TONES[nextPhase.label] ?? 396, Math.min(nextPhase.seconds, 1.5));
          }
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isComplete, currentPhaseIndex, currentPhase, currentSet, targetSets, selectedTechnique, soundEnabled, sessionStartTime, totalPhaseDuration]);

  const saveSession = useCallback(
    (durationSeconds: number) => {
      createSession.mutate(
        {
          data: {
            technique: selectedTechnique.id,
            setsCompleted: currentSet,
            durationSeconds,
          },
        },
        {
          onSuccess: () => {
            refetchStats();
            toast({
              title: "Session saved ✨",
              description: `${currentSet} set${currentSet > 1 ? "s" : ""} of ${selectedTechnique.name} complete.`,
            });
          },
          onError: () => {
            toast({
              title: "Couldn't save session",
              description: "Something went wrong. Please try again.",
              variant: "destructive",
            });
          },
        }
      );
    },
    [selectedTechnique, currentSet, createSession, refetchStats, toast]
  );

  const handleStart = () => {
    if (isComplete) {
      // Reset
      setCurrentPhaseIndex(0);
      setCurrentSecond(0);
      setCurrentSet(1);
      setIsComplete(false);
    }
    if (!isRunning && soundEnabled) {
      playTone(getCtx, PHASE_TONES[selectedTechnique.phases[0].label] ?? 396, 1.5);
    }
    setSessionStartTime(Date.now());
    setIsRunning(true);
  };

  const handlePause = () => setIsRunning(false);

  const handleReset = () => {
    setIsRunning(false);
    setCurrentPhaseIndex(0);
    setCurrentSecond(0);
    setCurrentSet(1);
    setIsComplete(false);
    setSessionStartTime(null);
  };

  const circleScale = isRunning || isComplete
    ? currentPhase?.scale ?? 1
    : 1;

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <header className="space-y-1">
        <h1 className="text-3xl md:text-4xl font-serif text-foreground flex items-center gap-3">
          <Wind className="w-8 h-8 text-primary opacity-80" aria-hidden="true" />
          Breathing
        </h1>
        <p className="text-muted-foreground text-lg">
          Guided breathing exercises to calm your mind and body.
        </p>
      </header>

      {/* Technique selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {TECHNIQUES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => { if (!isRunning) setSelectedTechnique(t); }}
            disabled={isRunning}
            aria-pressed={selectedTechnique.id === t.id}
            className={cn(
              "flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-sm font-medium transition-all duration-200",
              selectedTechnique.id === t.id
                ? "border-primary bg-primary/10 text-[#7f341f] shadow-sm"
                : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
              isRunning && selectedTechnique.id !== t.id && "opacity-40 cursor-not-allowed"
            )}
          >
            <span className="text-xl" aria-hidden="true">{t.emoji}</span>
            <span className="leading-tight text-center">{t.name}</span>
          </button>
        ))}
      </div>

      {/* Main exercise area */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Circle animation */}
        <Card className="lg:col-span-3 bg-card overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center py-10 gap-8">
            {/* Animated circle */}
            <div className="relative flex items-center justify-center w-56 h-56">
              {/* Outer pulse rings */}
              {isRunning && (
                <>
                  <motion.div
                    className="absolute rounded-full border-2 border-primary/20"
                    animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                    style={{ width: 200, height: 200 }}
                  />
                  <motion.div
                    className="absolute rounded-full border-2 border-primary/10"
                    animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
                    transition={{ duration: 2, delay: 0.6, repeat: Infinity, ease: "easeOut" }}
                    style={{ width: 200, height: 200 }}
                  />
                </>
              )}

              {/* Main breathing circle */}
              <motion.div
                className="rounded-full flex flex-col items-center justify-center gap-1 shadow-lg"
                style={{
                  width: 160,
                  height: 160,
                  background: isComplete
                    ? "linear-gradient(135deg, #8B9D77, #6B8CAE)"
                    : `linear-gradient(135deg, ${currentPhase?.color ?? "#C5B5A8"}, ${currentPhase?.color ?? "#C5B5A8"}88)`,
                }}
                animate={{ scale: circleScale }}
                transition={{
                  duration: totalPhaseDuration,
                  ease: currentPhase?.label === "Breathe In" ? "easeIn" : currentPhase?.label === "Breathe Out" ? "easeOut" : "linear",
                }}
              >
                <AnimatePresence mode="wait">
                  {isComplete ? (
                    <motion.div
                      key="complete"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center gap-1"
                    >
                      <CheckCircle2 className="w-8 h-8 text-white" />
                      <span className="text-white text-sm font-medium">Done!</span>
                    </motion.div>
                  ) : isRunning ? (
                    <motion.div
                      key={`${currentPhaseIndex}-${currentSecond}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center gap-0.5"
                    >
                      <span className="text-white/90 text-xs font-medium uppercase tracking-widest">
                        {currentPhase?.label}
                      </span>
                      <span className="text-white text-3xl font-light">
                        {totalPhaseDuration - currentSecond}
                      </span>
                    </motion.div>
                  ) : (
                    <motion.div key="idle" className="text-white/80 text-sm font-medium">
                      Ready
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Progress arc would go here - using a simpler indicator */}
            </div>

            {/* Phase progress dots */}
            {isRunning && !isComplete && (
              <div className="flex items-center gap-2">
                {selectedTechnique.phases.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "rounded-full transition-all duration-300",
                      i === currentPhaseIndex
                        ? "w-8 h-2 bg-primary"
                        : i < currentPhaseIndex
                        ? "w-2 h-2 bg-primary/40"
                        : "w-2 h-2 bg-muted"
                    )}
                  />
                ))}
              </div>
            )}

            {/* Set counter */}
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>Set</span>
              <div className="flex gap-1.5">
                {Array.from({ length: targetSets }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-2.5 h-2.5 rounded-full transition-colors duration-300",
                      i < currentSet - 1
                        ? "bg-primary"
                        : i === currentSet - 1 && isRunning
                        ? "bg-primary/60 ring-2 ring-primary/30"
                        : "bg-muted"
                    )}
                  />
                ))}
              </div>
              <span>{currentSet} / {targetSets}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-full min-w-11 min-h-11"
                onClick={handleReset}
                aria-label="Reset breathing session"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
              </Button>

              {isRunning ? (
                <Button
                  type="button"
                  size="lg"
                  className="rounded-full px-10 text-base"
                  onClick={handlePause}
                >
                  <Pause className="w-5 h-5 mr-2" aria-hidden="true" /> Pause
                </Button>
              ) : (
                <Button
                  type="button"
                  size="lg"
                  className="rounded-full px-10 text-base"
                  onClick={handleStart}
                >
                  <Play className="w-5 h-5 mr-2" aria-hidden="true" />
                  {isComplete ? "Again" : "Start"}
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-full min-w-11 min-h-11"
                onClick={() => setSoundEnabled(!soundEnabled)}
                aria-label={soundEnabled ? "Mute session sound" : "Enable session sound"}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" aria-hidden="true" /> : <VolumeX className="w-4 h-4" aria-hidden="true" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Technique info */}
          <Card className="bg-card">
            <CardHeader className="pb-3">
              <h2 className="text-lg font-semibold leading-none tracking-tight">{selectedTechnique.name}</h2>
              <CardDescription>{selectedTechnique.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Badge variant="outline" className="bg-card text-xs font-medium text-foreground">
                <span aria-hidden="true">✨ </span>{selectedTechnique.benefit}
              </Badge>

              {/* Phase guide */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phases</p>
                {selectedTechnique.phases.map((phase, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors duration-300",
                      isRunning && i === currentPhaseIndex
                        ? "bg-primary/10 text-primary font-medium"
                        : "bg-muted/50 text-muted-foreground"
                    )}
                  >
                    <span>{phase.label}</span>
                    <span>{phase.seconds}s</span>
                  </div>
                ))}
              </div>

              {/* Sets control */}
              {!isRunning && !isComplete && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sets</p>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full w-11 h-11 p-0"
                      onClick={() => setTargetSets(Math.max(1, targetSets - 1))}
                      aria-label="Decrease sets"
                    >−</Button>
                    <span className="text-lg font-medium w-6 text-center">{targetSets}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full w-11 h-11 p-0"
                      onClick={() => setTargetSets(Math.min(20, targetSets + 1))}
                      aria-label="Increase sets"
                    >+</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          {stats && (
            <Card className="bg-card">
              <CardHeader className="pb-3">
                <h2 className="text-base font-semibold leading-none tracking-tight">Your Progress</h2>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex flex-col items-center justify-center bg-muted/50 rounded-xl py-3">
                  <span className="text-2xl font-serif text-foreground">{stats.totalSessions}</span>
                  <span className="text-muted-foreground text-xs">Total sessions</span>
                </div>
                <div className="flex flex-col items-center justify-center bg-muted/50 rounded-xl py-3">
                  <span className="text-2xl font-serif text-foreground">{stats.totalMinutes}</span>
                  <span className="text-muted-foreground text-xs">Minutes breathed</span>
                </div>
                <div className="flex flex-col items-center justify-center bg-muted/50 rounded-xl py-3">
                  <span className="text-2xl font-serif text-foreground">{stats.currentStreak}</span>
                  <span className="text-muted-foreground text-xs">Day streak</span>
                </div>
                <div className="flex flex-col items-center justify-center bg-muted/50 rounded-xl py-3">
                  <span className="text-2xl font-serif text-foreground">{stats.thisWeekSessions}</span>
                  <span className="text-muted-foreground text-xs">This week</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
