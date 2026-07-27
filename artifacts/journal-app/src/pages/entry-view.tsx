import { useGetEntry, useDeleteEntry, useUpdateEntry, getListEntriesQueryKey, getGetEntryQueryKey } from "@workspace/api-client-react";
import { useParams, useLocation } from "wouter";
import { useState } from "react";
import { format } from "date-fns";
import { ArrowLeft, Trash2, Edit3, CalendarIcon, Check, X } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MOOD_EMOJIS, MOOD_LABELS, getMoodString, getMoodNumber } from "@/lib/mood-utils";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function EntryView() {
  const { id } = useParams<{ id: string }>();
  const entryId = Number(id);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: entry, isLoading, isError } = useGetEntry(entryId, { 
    query: { enabled: !!entryId && !isNaN(entryId), queryKey: getGetEntryQueryKey(entryId) } 
  });
  
  const deleteMutation = useDeleteEntry();
  const updateMutation = useUpdateEntry();

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editMood, setEditMood] = useState<string | null>(null);

  if (isLoading) {
    return <div className="animate-pulse p-8 space-y-4 max-w-3xl mx-auto">
      <div className="h-8 w-24 bg-muted rounded"></div>
      <div className="h-10 w-3/4 bg-muted rounded mt-8"></div>
      <div className="h-40 w-full bg-muted rounded"></div>
    </div>;
  }

  if (isError) {
    return <div className="text-center p-20 text-muted-foreground">Failed to load entry. Please try again later.</div>;
  }

  if (!entry) {
    return <div className="text-center p-20 text-muted-foreground">Entry not found.</div>;
  }

  const startEditing = () => {
    setEditContent(entry.content);
    setEditMood(entry.moodRating ? getMoodString(entry.moodRating) : null);
    setIsEditing(true);
  };

  const handleSave = () => {
    updateMutation.mutate(
      { 
        id: entryId, 
        data: { 
          content: editContent,
          moodRating: editMood ? getMoodNumber(editMood) : null
        } 
      },
      {
        onSuccess: (updated) => {
          queryClient.setQueryData(getGetEntryQueryKey(entryId), updated);
          setIsEditing(false);
          toast({ title: "Entry updated" });
        },
        onError: () => {
          toast({
            title: "Couldn't update entry",
            description: "Something went wrong. Please try again.",
            variant: "destructive",
          });
        }
      }
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(
      { id: entryId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListEntriesQueryKey() });
          toast({ title: "Entry deleted" });
          setLocation("/entries");
        },
        onError: () => {
          toast({
            title: "Couldn't delete entry",
            description: "Something went wrong. Please try again.",
            variant: "destructive",
          });
        }
      }
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto pb-12"
    >
      <div className="flex items-center justify-between mb-8">
        <Link href="/entries" className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Journal
        </Link>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <Button variant="ghost" size="sm" onClick={startEditing} className="text-muted-foreground hover:text-foreground">
                <Edit3 className="w-4 h-4 mr-2" /> Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This cannot be undone. The entry will be permanently removed from your journal.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete Entry
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={updateMutation.isPending}>
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
                <Check className="w-4 h-4 mr-2" /> Save
              </Button>
            </>
          )}
        </div>
      </div>

      <article className="bg-card rounded-3xl p-8 md:p-12 shadow-sm border border-card-border relative overflow-hidden">
        
        {/* Header Info */}
        <header className="mb-10 pb-6 border-b border-border/50 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-muted-foreground">
            <CalendarIcon className="w-5 h-5 opacity-70" />
            <time dateTime={entry.date} className="font-medium text-lg text-foreground">
              {format(new Date(entry.date), "EEEE, MMMM do, yyyy")}
            </time>
          </div>

          {!isEditing ? (
            entry.moodRating && (
              <div className="flex items-center gap-2 bg-background px-4 py-2 rounded-full border border-border">
                <span className="text-2xl">{MOOD_EMOJIS[getMoodString(entry.moodRating) as keyof typeof MOOD_EMOJIS]}</span>
                <span className="text-sm font-medium capitalize">{getMoodString(entry.moodRating)}</span>
              </div>
            )
          ) : (
            <div className="flex items-center gap-2 bg-background px-3 py-1.5 rounded-full border border-border">
              {Object.entries(MOOD_EMOJIS).map(([moodKey, emoji]) => (
                <button
                  key={moodKey}
                  onClick={() => setEditMood(moodKey)}
                  className={cn(
                    "text-xl p-1 transition-all duration-200 rounded-full",
                    editMood === moodKey ? "scale-125 bg-accent" : "grayscale opacity-50 hover:grayscale-0 hover:opacity-100"
                  )}
                  title={moodKey}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </header>

        {/* Prompt */}
        {entry.promptText && (
          <div className="mb-8 p-6 bg-primary/5 rounded-2xl border border-primary/10">
            <p className="text-sm font-medium text-primary mb-2 uppercase tracking-wide">Prompt</p>
            <h2 className="font-serif text-xl md:text-2xl text-foreground">
              {entry.promptText}
            </h2>
          </div>
        )}

        {/* Content */}
        {isEditing ? (
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full min-h-[300px] resize-y bg-transparent text-lg md:text-xl leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-xl p-4 -ml-4"
          />
        ) : (
          <div className="prose prose-lg dark:prose-invert max-w-none font-sans text-foreground/90 leading-loose">
            {entry.content.split('\n').map((paragraph, i) => (
              <p key={i} className="min-h-[1.5rem]">{paragraph}</p>
            ))}
          </div>
        )}

      </article>
    </motion.div>
  );
}
