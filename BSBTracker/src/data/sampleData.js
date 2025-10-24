export const heroStats = [
  { label: "Athletes tracked", value: "1,200+" },
  { label: "Routes logged", value: "18,450" },
  { label: "Competitions hosted", value: "42" },
];

export const features = [
  {
    title: "Route Tracking",
    description:
      "Log attempts, record sends, and watch your progress climb with interactive charts and personal bests.",
  },
  {
    title: "Competition Ready",
    description:
      "Display live leaderboards in your gym or event venue with a layout designed for large screens.",
  },
  {
    title: "Team Insights",
    description:
      "Highlight team performance with curated stats, score breakdowns, and season recaps.",
  },
  {
    title: "Event Planning",
    description:
      "Organise seasons with static schedules, route previews, and promotional spotlights.",
  },
];

export const testimonials = [
  {
    quote:
      "BSBTracker turned our comp nights into a polished production. The static leaderboard demo helped land us new sponsors.",
    author: "Tara López, Head Setter @ Blue Swan Bouldering",
  },
  {
    quote:
      "A perfect portfolio piece—clean design, clear storytelling, and just the right amount of interactivity.",
    author: "Derrick Wells, Product Designer",
  },
];

export const events = [
  {
    id: "spring-showdown",
    name: "Spring Showdown",
    date: "April 12, 2025",
    location: "Blue Swan Bouldering",
    description:
      "A friendly community comp showcasing brand-new problems from the setting team.",
  },
  {
    id: "summer-series",
    name: "Summer Series Finals",
    date: "July 27, 2025",
    location: "Blue Swan Bouldering",
    description:
      "Season finale with rotating judges, finals spotlight, and DJ set to close the night.",
  },
  {
    id: "autumn-classic",
    name: "Autumn Classic",
    date: "October 19, 2025",
    location: "Blue Swan Bouldering",
    description:
      "A routesetting showcase featuring classic comp-style blocs across every grade range.",
  },
];

export const leaderboardTeams = [
  {
    id: "aurora-ascenders",
    name: "Aurora Ascenders",
    totalScore: 9860,
    averageScore: 492,
    color: "from-yellow-200 to-amber-200",
  },
  {
    id: "nebula-nomads",
    name: "Nebula Nomads",
    totalScore: 9540,
    averageScore: 477,
    color: "from-indigo-200 to-blue-200",
  },
  {
    id: "gravity-guild",
    name: "Gravity Guild",
    totalScore: 9125,
    averageScore: 456,
    color: "from-emerald-200 to-teal-200",
  },
  {
    id: "crux-collective",
    name: "Crux Collective",
    totalScore: 8790,
    averageScore: 439,
    color: "from-rose-200 to-pink-200",
  },
  {
    id: "dyno-dynasty",
    name: "Dyno Dynasty",
    totalScore: 8455,
    averageScore: 423,
    color: "from-slate-200 to-slate-100",
  },
];

export const routeSpotlights = [
  {
    id: "startrail",
    name: "Startrail",
    grade: "V5",
    setter: "Alex Rivera",
    description:
      "Powerful compression on volumes culminating in a committing paddle dyno finish.",
  },
  {
    id: "lunar-bridge",
    name: "Lunar Bridge",
    grade: "V3",
    setter: "Mina Patel",
    description:
      "Technical balance climb with heel hooks and high tension across a sweeping arete.",
  },
  {
    id: "midnight-script",
    name: "Midnight Script",
    grade: "V7",
    setter: "Jaiden Huang",
    description:
      "Crimpy boulder that rewards precision footwork and decisive movement between micro edges.",
  },
];

export const faqs = [
  {
    question: "Is this connected to a live database?",
    answer:
      "No. This portfolio edition is a static build that mirrors the look and feel of the production app without requiring Supabase or authentication.",
  },
  {
    question: "Can I integrate it with my own backend?",
    answer:
      "Absolutely. The UI components are framework-agnostic and can be wired up to any API or static data source.",
  },
  {
    question: "Where can I learn more about the real product?",
    answer:
      "Reach out via the contact links in the footer and I’ll gladly share a guided tour of the live platform.",
  },
];
