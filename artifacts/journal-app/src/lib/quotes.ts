export interface Quote {
  text: string;
  author: string;
}

export const MINDFUL_QUOTES: Quote[] = [
  { text: "The present moment is the only moment available to us, and it is the door to all moments.", author: "Thich Nhat Hanh" },
  { text: "In today's rush, we all think too much, seek too much, want too much and forget about the joy of just being.", author: "Eckhart Tolle" },
  { text: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott" },
  { text: "You are the sky. Everything else is just the weather.", author: "Pema Chödrön" },
  { text: "Within you, there is a stillness and a sanctuary to which you can retreat at any time.", author: "Hermann Hesse" },
  { text: "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.", author: "Buddha" },
  { text: "Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.", author: "Thich Nhat Hanh" },
  { text: "The quieter you become, the more you can hear.", author: "Ram Dass" },
  { text: "Life is available only in the present moment.", author: "Thich Nhat Hanh" },
  { text: "Nothing is worth more than this day.", author: "Johann Wolfgang von Goethe" },
  { text: "Be where you are; otherwise you will miss your life.", author: "Buddha" },
  { text: "Wherever you are, be all there.", author: "Jim Elliot" },
  { text: "Tension is who you think you should be. Relaxation is who you are.", author: "Chinese Proverb" },
  { text: "The most precious gift we can offer anyone is our attention.", author: "Thich Nhat Hanh" },
  { text: "Peace begins with a smile.", author: "Mother Teresa" },
  { text: "Your calm mind is the ultimate weapon against your challenges.", author: "Bryant McGill" },
  { text: "You can't calm the storm, so stop trying. What you can do is calm yourself.", author: "Timber Hawkeye" },
  { text: "Breathe. Let go. And remind yourself that this very moment is the only one you know you have for sure.", author: "Oprah Winfrey" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
  { text: "The only way to live is by accepting each minute as an unrepeatable miracle.", author: "Tara Brach" },
  { text: "Awareness is the greatest agent for change.", author: "Eckhart Tolle" },
  { text: "Mindfulness is a way of befriending ourselves and our experience.", author: "Jon Kabat-Zinn" },
  { text: "Respond, don't react. Listen, don't talk. Think, don't assume.", author: "Raji Lukkoor" },
  { text: "Every moment is a fresh beginning.", author: "T.S. Eliot" },
  { text: "Not all those who wander are lost.", author: "J.R.R. Tolkien" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { text: "In the midst of movement and chaos, keep stillness inside of you.", author: "Deepak Chopra" },
  { text: "Comparison is the thief of joy.", author: "Theodore Roosevelt" },
  { text: "You yourself, as much as anybody in the entire universe, deserve your love and affection.", author: "Buddha" },
  { text: "Health is the greatest gift, contentment the greatest wealth, faithfulness the best relationship.", author: "Buddha" },
  { text: "The thing about meditation is: you become more and more you.", author: "David Lynch" },
  { text: "Smile, breathe, and go slowly.", author: "Thich Nhat Hanh" },
  { text: "One conscious breath in and out is a meditation.", author: "Eckhart Tolle" },
  { text: "We cannot control the wind, but we can direct the sail.", author: "Aristotle" },
  { text: "The goal of meditation isn't to control your thoughts, it's to stop letting them control you.", author: "Unknown" },
  { text: "Don't believe everything you think. Thoughts are just that — thoughts.", author: "Allan Lokos" },
  { text: "Happiness is not something ready made. It comes from your own actions.", author: "Dalai Lama" },
  { text: "It's not about having enough time, it's about making enough time.", author: "Rachael Bermingham" },
  { text: "A journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
  { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
  { text: "Act as if what you do makes a difference. It does.", author: "William James" },
  { text: "Only I can change my life. No one can do it for me.", author: "Carol Burnett" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "In any given moment, we have two options: to step forward into growth or back into safety.", author: "Abraham Maslow" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Vulnerability is not winning or losing; it's having the courage to show up and be seen.", author: "Brené Brown" },
  { text: "Sometimes the most important thing in a whole day is the rest we take between two deep breaths.", author: "Etty Hillesum" },
  { text: "We are shaped by our thoughts; we become what we think.", author: "Buddha" },
  { text: "The greatest weapon against stress is our ability to choose one thought over another.", author: "William James" },
  { text: "You don't have to control your thoughts. You just have to stop letting them control you.", author: "Dan Millman" },
];

/** Pick a deterministic quote for today, rotating through the full list */
export function getTodayQuote(): Quote {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return MINDFUL_QUOTES[dayOfYear % MINDFUL_QUOTES.length];
}
