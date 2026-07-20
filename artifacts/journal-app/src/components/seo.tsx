import { useEffect } from "react";
import { useLocation } from "wouter";

const siteUrl = "https://mindful-journal.vercel.app";
const siteName = "Mental Wellness Journal";

type PageMetadata = Readonly<{
  title: string;
  description: string;
}>;

const metadataByPath: Readonly<Record<string, PageMetadata>> = {
  "/": {
    title: `${siteName} | Mindful Reflection`,
    description: "A mindful space for daily reflection, mood tracking, breathing exercises, and personal wellbeing insights.",
  },
  "/write": {
    title: `Write a Journal Entry | ${siteName}`,
    description: "Create a mindful journal entry and make space for daily reflection.",
  },
  "/entries": {
    title: `Journal Entries | ${siteName}`,
    description: "Review your personal journal entries and reflect on your wellbeing journey.",
  },
  "/calendar": {
    title: `Reflection Calendar | ${siteName}`,
    description: "Explore your journaling rhythm and revisit reflections by date.",
  },
  "/insights": {
    title: `Wellbeing Insights | ${siteName}`,
    description: "Explore mindful journaling insights, moods, and patterns over time.",
  },
  "/breathe": {
    title: `Breathing Exercises | ${siteName}`,
    description: "Take a mindful pause with guided breathing exercises for calm and focus.",
  },
  "/mindful": {
    title: `Mindful Practices | ${siteName}`,
    description: "Build a more mindful daily routine with simple wellbeing practices.",
  },
};

const entryMetadata: PageMetadata = {
  title: `Journal Entry | ${siteName}`,
  description: "Reflect on a personal journal entry in Mental Wellness Journal.",
};

function setMetaContent(id: string, content: string) {
  const element = document.getElementById(id);

  if (element instanceof HTMLMetaElement) {
    element.content = content;
  }
}

export function Seo() {
  const [location] = useLocation();
  const metadata = metadataByPath[location] ?? (location.startsWith("/entries/") ? entryMetadata : metadataByPath["/"]);
  const canonicalUrl = `${siteUrl}${location === "/" ? "/" : location}`;

  useEffect(() => {
    document.title = metadata.title;

    setMetaContent("og-title", metadata.title);
    setMetaContent("og-description", metadata.description);
    setMetaContent("og-url", canonicalUrl);
    setMetaContent("twitter-title", metadata.title);
    setMetaContent("twitter-description", metadata.description);
    setMetaContent("twitter-url", canonicalUrl);

    const description = document.querySelector('meta[name="description"]');
    if (description instanceof HTMLMetaElement) {
      description.content = metadata.description;
    }

    const canonical = document.getElementById("canonical-url");
    if (canonical instanceof HTMLLinkElement) {
      canonical.href = canonicalUrl;
    }
  }, [canonicalUrl, metadata]);

  return null;
}
