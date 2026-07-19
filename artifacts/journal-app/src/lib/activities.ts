export interface MindfulActivity {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: "movement" | "breathing" | "meditation" | "reflection" | "nature" | "creative";
  emoji: string;
  steps?: string[];
}

export const MINDFUL_ACTIVITIES: MindfulActivity[] = [
  {
    id: "morning-stretch",
    title: "Morning Full-Body Stretch",
    description: "Gently wake up your body with a 5-minute stretch routine.",
    duration: "5 min",
    category: "movement",
    emoji: "🧘",
    steps: [
      "Stand tall, reach arms overhead — hold 5 seconds",
      "Roll your neck slowly side to side — 5 reps each",
      "Forward fold: let your arms dangle — hold 20 seconds",
      "Gentle chest opener: hands behind back — hold 15 seconds",
      "End with 3 deep belly breaths",
    ],
  },
  {
    id: "box-breathing",
    title: "Box Breathing",
    description: "A simple 4-4-4-4 breathing pattern to calm your nervous system.",
    duration: "4 min",
    category: "breathing",
    emoji: "🌬️",
    steps: [
      "Breathe IN for 4 seconds",
      "HOLD for 4 seconds",
      "Breathe OUT for 4 seconds",
      "HOLD for 4 seconds",
      "Repeat 4–8 times",
    ],
  },
  {
    id: "gratitude-walk",
    title: "Gratitude Walk",
    description: "A slow, mindful walk noticing 5 things you appreciate.",
    duration: "10 min",
    category: "nature",
    emoji: "🌿",
    steps: [
      "Step outside or find a quiet space",
      "Walk slowly — no destination, no phone",
      "Notice 5 things you're grateful for as you walk",
      "Touch a leaf, smell a flower, feel the breeze",
      "Return feeling refreshed and present",
    ],
  },
  {
    id: "body-scan",
    title: "5-Minute Body Scan",
    description: "Travel through your body with awareness, releasing held tension.",
    duration: "5 min",
    category: "meditation",
    emoji: "🔍",
    steps: [
      "Lie down or sit comfortably — close your eyes",
      "Start at your feet — notice any sensation without judgment",
      "Slowly move attention up: calves → knees → hips → belly",
      "Continue: chest → shoulders → arms → hands → neck → face",
      "Take a final deep breath and gently open your eyes",
    ],
  },
  {
    id: "grounding-54321",
    title: "5-4-3-2-1 Grounding",
    description: "Bring yourself back to the present by engaging all five senses.",
    duration: "3 min",
    category: "meditation",
    emoji: "⚡",
    steps: [
      "Name 5 things you can SEE",
      "Name 4 things you can TOUCH — then touch them",
      "Name 3 things you can HEAR",
      "Name 2 things you can SMELL",
      "Name 1 thing you can TASTE",
    ],
  },
  {
    id: "digital-detox",
    title: "Screen-Free Hour",
    description: "Give your mind a rest from screens and notifications.",
    duration: "60 min",
    category: "reflection",
    emoji: "📵",
    steps: [
      "Put your phone in another room (or turn it off)",
      "Choose one simple activity: reading, drawing, cooking, or just sitting",
      "Notice how your mind gradually quiets",
      "When urges to check arise — breathe through them",
      "Reflect on how you feel after",
    ],
  },
  {
    id: "mindful-tea",
    title: "Mindful Tea (or Coffee) Ritual",
    description: "Transform your morning drink into a full sensory meditation.",
    duration: "10 min",
    category: "meditation",
    emoji: "☕",
    steps: [
      "Prepare your drink slowly, noticing each step",
      "Hold the cup — feel its warmth in your hands",
      "Inhale the aroma before the first sip",
      "Drink slowly — notice taste, temperature, sensation",
      "Finish in silence, without phone or media",
    ],
  },
  {
    id: "journaling-3-things",
    title: "Three Things Journaling",
    description: "Write down 3 things you're grateful for and 3 intentions for the day.",
    duration: "5 min",
    category: "reflection",
    emoji: "📖",
    steps: [
      "Open your journal (or a blank page)",
      "Write 3 specific things you're grateful for today",
      "Write 3 intentions or values to guide your day",
      "Read them aloud once",
      "Close the journal and breathe in the moment",
    ],
  },
  {
    id: "shoulder-roll",
    title: "Desk Tension Release",
    description: "Quick movement breaks to release stress stored in your body.",
    duration: "3 min",
    category: "movement",
    emoji: "💪",
    steps: [
      "Roll shoulders forward 5 times, then backward 5 times",
      "Tilt ear to shoulder — hold 15 seconds each side",
      "Chest press: push hands together — hold 10 seconds",
      "Stand and shake your arms and legs for 30 seconds",
      "Finish with 3 deep breaths",
    ],
  },
  {
    id: "loving-kindness",
    title: "Loving-Kindness Meditation",
    description: "Send compassion to yourself and others with gentle affirmations.",
    duration: "7 min",
    category: "meditation",
    emoji: "💛",
    steps: [
      "Close your eyes and breathe deeply",
      "Think of yourself — silently say: 'May I be happy. May I be healthy. May I be at peace.'",
      "Bring to mind someone you love — send them the same wishes",
      "Extend to a neutral person, then to someone difficult",
      "Finally send to all beings everywhere",
    ],
  },
  {
    id: "nature-sounds",
    title: "Nature Sound Immersion",
    description: "Sit quietly with nature sounds playing and let your mind settle.",
    duration: "10 min",
    category: "nature",
    emoji: "🌊",
    steps: [
      "Find a comfortable seat",
      "Play rain, ocean, or forest sounds (or go outside)",
      "Close your eyes and simply listen",
      "When thoughts arise, gently return to the sound",
      "Notice how your body relaxes with each minute",
    ],
  },
  {
    id: "creative-doodling",
    title: "Mindful Doodling",
    description: "Freeform drawing as a moving meditation — no skill needed.",
    duration: "10 min",
    category: "creative",
    emoji: "✏️",
    steps: [
      "Grab any paper and a pen",
      "Start with a shape — any shape — in the center",
      "Build outward slowly, following your instincts",
      "No plan, no judgment — just fill the page",
      "Notice how absorbed and calm you feel",
    ],
  },
  {
    id: "478-breath",
    title: "4-7-8 Breathing",
    description: "The sleep-inducing breath that calms your nervous system in minutes.",
    duration: "5 min",
    category: "breathing",
    emoji: "😴",
    steps: [
      "Exhale completely through your mouth",
      "Breathe IN through nose for 4 seconds",
      "HOLD your breath for 7 seconds",
      "Exhale completely through mouth for 8 seconds",
      "Repeat 4 cycles",
    ],
  },
  {
    id: "cold-splash",
    title: "Cold Water Reset",
    description: "A 30-second cold water splash to instantly boost alertness and mood.",
    duration: "2 min",
    category: "movement",
    emoji: "💧",
    steps: [
      "Go to a sink or shower",
      "Splash cold water on your face 5 times",
      "Or hold cold water on your wrists for 30 seconds",
      "Take 3 deep slow breaths while feeling the sensation",
      "Notice how alert and refreshed you feel",
    ],
  },
];

/** Pick a deterministic activity for today */
export function getTodayActivity(): MindfulActivity {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return MINDFUL_ACTIVITIES[dayOfYear % MINDFUL_ACTIVITIES.length];
}

export const CATEGORY_COLORS: Record<MindfulActivity["category"], string> = {
  movement: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  breathing: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  meditation: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  reflection: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  nature: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  creative: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
};
