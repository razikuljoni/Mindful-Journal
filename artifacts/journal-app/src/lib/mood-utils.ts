export const MOOD_COLORS = {
  awful: "bg-[#d86b6b] text-white",
  bad: "bg-[#e59a72] text-white",
  okay: "bg-[#e2c076] text-white",
  good: "bg-[#8fa88c] text-white",
  great: "bg-[#5f806d] text-white",
};

export const MOOD_EMOJIS = {
  awful: "🌧️",
  bad: "☁️",
  okay: "⛅",
  good: "🌤️",
  great: "☀️",
};

export const MOOD_LABELS = {
  awful: "Awful",
  bad: "Bad",
  okay: "Okay",
  good: "Good",
  great: "Great",
};

export function getMoodColor(mood: string | null | undefined): string {
  if (!mood) return "bg-muted text-muted-foreground";
  return MOOD_COLORS[mood as keyof typeof MOOD_COLORS] || "bg-muted";
}

export function getMoodEmoji(mood: string | null | undefined): string {
  if (!mood) return "😶";
  return MOOD_EMOJIS[mood as keyof typeof MOOD_EMOJIS] || "😶";
}

export function getMoodNumber(mood: string): number {
  const map: Record<string, number> = { awful: 1, bad: 2, okay: 3, good: 4, great: 5 };
  return map[mood] || 3;
}

export function getMoodString(num: number | null | undefined): string {
  if (!num) return "okay";
  const map: Record<number, string> = { 1: "awful", 2: "bad", 3: "okay", 4: "good", 5: "great" };
  return map[num] || "okay";
}
