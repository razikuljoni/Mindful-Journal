import { useGetTodayPrompt, useCreateEntry } from "@workspace/api-client-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { MOOD_EMOJIS, getMoodNumber } from "@/lib/mood-utils";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Write() {
  const [, setLocation] = useLocation();
  const { data: prompt } = useGetTodayPrompt();
  const createEntry = useCreateEntry();
  const { toast } = useToast();

  const promptId = prompt && prompt.id > 0 ? prompt.id : null;

  const [content, setContent] = useState("");
  const [mood, setMood] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    if (!content.trim()) return;

    createEntry.mutate({
      data: {
        content,
        promptId,
        moodRating: mood ? getMoodNumber(mood) : null,
        date: format(new Date(), "yyyy-MM-dd"),
      }
    }, {
      onSuccess: () => {
        setIsSaved(true);
        toast({
          title: "Saved beautifully",
          description: "Your reflection has been recorded.",
        });
        setTimeout(() => {
          setLocation("/");
        }, 1500);
      },
      onError: () => {
        toast({
          title: "Couldn't save entry",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto h-[calc(100vh-120px)] md:h-[calc(100vh-64px)] flex flex-col pt-4 md:pt-0"
    >
      <div className="flex items-center justify-between mb-8 px-2">
        <Link href="/" className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <span className="text-sm font-medium text-muted-foreground">
          {format(new Date(), "MMMM do, yyyy")}
        </span>
      </div>

      <div className="flex-1 flex flex-col relative bg-card rounded-3xl shadow-sm border border-card-border overflow-hidden">
        {/* Header / Prompt */}
        <div className="p-8 md:p-12 pb-6 bg-primary/5 border-b border-border/50">
          <p className="text-sm font-medium text-primary mb-3 tracking-wide uppercase">Today's Prompt</p>
          <h2 className="font-serif text-2xl md:text-3xl text-foreground leading-relaxed">
            {prompt?.text || "What's on your mind today?"}
          </h2>
        </div>

        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing..."
            className="w-full h-full resize-none bg-transparent p-8 md:p-12 text-lg leading-relaxed focus:outline-none placeholder:text-muted-foreground/50 text-foreground font-sans"
          />
        </div>

        {/* Footer / Controls */}
        <div className="p-6 md:px-12 md:py-6 border-t border-border/50 bg-background/50 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground font-medium mr-2">How are you feeling?</span>
            {Object.entries(MOOD_EMOJIS).map(([moodKey, emoji]) => (
              <button
                key={moodKey}
                onClick={() => setMood(moodKey)}
                className={cn(
                  "text-2xl transition-all duration-200 hover:scale-110",
                  mood === moodKey ? "scale-125 drop-shadow-md grayscale-0" : "grayscale opacity-50 hover:grayscale-0 hover:opacity-100"
                )}
                title={moodKey}
              >
                {emoji}
              </button>
            ))}
          </div>

          <Button 
            onClick={handleSave} 
            disabled={!content.trim() || createEntry.isPending || isSaved}
            className="w-full sm:w-auto rounded-full px-8 h-12 text-base transition-all duration-300"
            variant={isSaved ? "secondary" : "default"}
          >
            <AnimatePresence mode="wait">
              {createEntry.isPending ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Loader2 className="w-5 h-5 animate-spin" />
                </motion.div>
              ) : isSaved ? (
                <motion.div key="saved" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Saved
                </motion.div>
              ) : (
                <motion.div key="save" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Save Entry
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
