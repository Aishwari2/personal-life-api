import React, { useEffect, useState, useRef } from 'react';
import {
  Play, Pause, Trash2, Sun, Moon,
  Check, RotateCcw, BarChart2, ChevronLeft, ChevronRight,
  ExternalLink, Copy, CheckCheck, RefreshCw,
  Edit3, X
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface LearningSession {
  id: number;
  topic: string;
  activity: string;
  duration_minutes: number;
  session_date: string;
  mood: string | null;
}

interface JournalEntry {
  id: number;
  title: string;
  content: string;
  mood?: string;
  fontStyle?: string;
  created_at: string;
}

interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

interface CuriosityQuestion {
  id: number;
  question: string;
  category: string;
  answer_notes: string | null;
  status: string;
  created_at: string;
}

interface VisionPillar {
  id: number;
  title: string;
  emoji: string;
  goal: string;
  manifested: boolean;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const PASTEL_BARS = ['#ff85a2', '#b39ddb', '#80cbc4', '#ffe082', '#ffab91', '#90caf9'];

const JOURNAL_MOOD_STICKERS = ["🌸 Joyful", "☕ Cozy", "🌙 Midnight", "💡 Eureka!", "🌱 Growing", "🧘 Serene"];

const JOURNAL_FONTS = [
  { id: "journal-font-cute", name: "🌸 Cute Rounded" },
  { id: "journal-font-handwritten", name: "✍️ Cozy Diary" },
  { id: "journal-font-indie", name: "🌼 Whimsical Pen" },
  { id: "journal-font-gaegu", name: "🧸 Cute Doodle" },
  { id: "journal-font-script", name: "🎀 Flowing Script" },
  { id: "journal-font-typewriter", name: "📟 Typewriter" },
  { id: "journal-font-bookish", name: "📖 Bookish" }
];

// 30 DISTINCT EMOJIS FOR THE VISION BOARD
const EMOJI_PALETTE = [
  "🧠", "🌌", "💰", "🎨", "🚀", "🌸", "📚", "☕", "💎", "🧘", "🌿", "🪐", "🏹", "🏆", "💡", "🐾",
  "💭", "🫟", "💲", "🆕", "♻️", "🔅", "♾️", "🪷", "💖", "⛱️", "🌈", "🛩️", "🎂", "👑"
];

const DAY_RATINGS = ["🌟 Excellent", "🌸 Very Good", "✨ Good", "☕ Okayish", "🌧️ Tough Day"];

// 10 SURPRISING FACTS ACROSS PSYCHOLOGY, SPACE, BRAIN & BODY
const TEN_SURPRISING_FACTS = [
  { topic: "Brain 🧠", fact: "Your brain generates roughly 20-25 watts of electricity while awake — enough to power a dim lightbulb!" },
  { topic: "Space 🌌", fact: "One day on Venus is longer than an entire year on Venus (it rotates slower than it orbits the Sun)." },
  { topic: "Human Body 🧬", fact: "Your stomach lining completely regenerates every 3 to 4 days to prevent it from digesting itself." },
  { topic: "Psychology 💭", fact: "Writing thoughts down by hand physically engages neural pathways that typing on a keyboard skips entirely." },
  { topic: "Space 🌌", fact: "If two pieces of the same type of metal touch in the vacuum of space, they permanently fuse together (Cold Welding)." },
  { topic: "Memory ⚡", fact: "The 'Spacing Effect' proves that studying for 20 minutes across 3 days yields 2x higher retention than cramming for 2 hours." },
  { topic: "Neuroscience 🔬", fact: "Adult brains continually produce new neurons throughout life in the hippocampus (Neurogenesis)." },
  { topic: "Physics 🪐", fact: "Time physically runs slightly faster on top of a mountain than at sea level due to gravitational time dilation." },
  { topic: "Psychology 🧘", fact: "Listening to gentle acoustic music stimulates the vagus nerve, instantly lowering physical cortisol." },
  { topic: "Cosmos 🌌", fact: "There are more trees on planet Earth (roughly 3 trillion) than there are stars in the Milky Way galaxy (100-400 billion)." }
];

// STUDY TECHNIQUES WITH AUTO-TIMER APPLY
const STUDY_TECHNIQUES = [
  {
    title: "The Feynman Technique",
    desc: "Explain the concept in plain language as if teaching a child. Identify exactly where your explanation stumbles.",
    time: 25,
    tag: "Mastery 🧠"
  },
  {
    title: "Active Recall & Blurting",
    desc: "Read a chapter, close the book, and brain-dump everything onto blank paper from pure memory.",
    time: 20,
    tag: "Memory ⚡"
  },
  {
    title: "The 90-Min Ultradian Block",
    desc: "Align with human 90-minute biological focus rhythms for maximum deep-work absorption.",
    time: 90,
    tag: "Flow State 🔥"
  },
  {
    title: "Interleaving Strategy",
    desc: "Alternate between 2 related subjects (e.g. 20m Math + 20m Code) to strengthen mental neural agility.",
    time: 40,
    tag: "Agility 🎯"
  }
];

// 40+ CURATED BOOKS ACROSS 9 GENRES
const EXPANDED_LIBRARY = [
  // 1. Psychology & Human Behavior 🧠
  { title: "The Principles of Psychology", author: "William James", category: "Psychology 🧠", desc: "The landmark masterwork on habit formation, emotion, and stream of thought.", peekQuote: "Could the young but realize how soon they will become mere walking bundles of habits, they would give more heed to their conduct.", link: "https://gutenberg.org/ebooks/5827" },
  { title: "The Interpretation of Dreams", author: "Sigmund Freud", category: "Psychology 🧠", desc: "The foundational exploration into the unconscious mind, symbols, and psychological analysis.", peekQuote: "The mind is like an iceberg, it floats with one-seventh of its bulk above water.", link: "https://gutenberg.org/ebooks/4387" },
  { title: "The Crowd: A Study of the Popular Mind", author: "Gustave Le Bon", category: "Psychology 🧠", desc: "The pioneering text on collective psychology, mass behavior, and contagion of thought.", peekQuote: "The masses have never thirsted after truth. Whoever can supply them with illusions is easily their master.", link: "https://gutenberg.org/ebooks/445" },
  { title: "Man's Search for Meaning", author: "Viktor Frankl", category: "Psychology 🧠", desc: "A psychological memoir on purpose, resilience, and the inner freedom to choose attitude.", peekQuote: "When we are no longer able to change a situation, we are challenged to change ourselves.", link: "https://archive.org" },

  // 2. Brain, Neuroscience & Body 🔬
  { title: "Advice for a Young Investigator", author: "Santiago Ramón y Cajal", category: "Brain & Body 🔬", desc: "Priceless wisdom from the Nobel-winning father of modern neuroscience.", peekQuote: "Every man can, if he so desires, become the sculptor of his own brain.", link: "https://gutenberg.org" },
  { title: "As a Man Thinketh", author: "James Allen", category: "Brain & Body 🔬", desc: "A timeless reflection on how thought patterns physically sculpt our personality and fate.", peekQuote: "Mind is the Master power that molds and makes, and Man is Mind, and evermore he takes the tool of Thought.", link: "https://gutenberg.org/ebooks/4507" },
  { title: "The Physiology of Mind", author: "Henry Maudsley", category: "Brain & Body 🔬", desc: "Early neuro-biological analysis of mental function and organic human consciousness.", peekQuote: "Consciousness is not co-extensive with mind, but only an illumination of its surface.", link: "https://gutenberg.org/ebooks/39801" },

  // 3. Finance & Wealth Architecture 💰
  { title: "The Richest Man in Babylon", author: "George S. Clason", category: "Finance 💰", desc: "Ancient Babylonian parables on the 7 eternal laws of saving and compounding capital.", peekQuote: "A part of all you earn is yours to keep. Gold clingeth to the protection of the cautious owner.", link: "https://gutenberg.org" },
  { title: "Lombard Street: The Money Market", author: "Walter Bagehot", category: "Finance 💰", desc: "The classic analysis of banking liquidity, panics, and the global circulation of capital.", peekQuote: "Money will not manage itself, and Lombard street has a great deal of money to manage.", link: "https://gutenberg.org/ebooks/3781" },
  { title: "The Theory of Business Enterprise", author: "Thorstein Veblen", category: "Finance 💰", desc: "The brilliant institutional analysis of modern corporate finance, leverage, and machines.", peekQuote: "Invention is the mother of necessity. The business man's place in the economy is to seek profit.", link: "https://gutenberg.org/ebooks/27833" },

  // 4. Economics & Strategy 📈
  { title: "The Wealth of Nations", author: "Adam Smith", category: "Economics 📈", desc: "The foundational masterpiece on division of labor, productivity, and economic freedom.", peekQuote: "It is not from the benevolence of the butcher, the brewer, or the baker that we expect our dinner, but from their regard to their own interest.", link: "https://standardebooks.org/ebooks/adam-smith/the-wealth-of-nations" },
  { title: "Principles of Economics", author: "Alfred Marshall", category: "Economics 📈", desc: "The definitive text synthesizing supply, demand, marginal utility, and economic equilibrium.", peekQuote: "Economics is a study of mankind in the ordinary business of life.", link: "https://gutenberg.org" },
  { title: "The Art of War", author: "Sun Tzu", category: "Strategy 📈", desc: "The world's oldest and most renowned treatise on strategy, psychology, and tactical victory.", peekQuote: "The supreme art of war is to subdue the enemy without fighting.", link: "https://standardebooks.org/ebooks/sun-tzu/the-art-of-war" },

  // 5. Space, Cosmos & Physics 🌌
  { title: "Space, Time and Gravitation", author: "Arthur Eddington", category: "Space 🌌", desc: "The brilliant introduction to Einstein's general relativity and cosmic spacetime curvature.", peekQuote: "We have found a strange footprint on the shores of the unknown... and lo, it is our own.", link: "https://gutenberg.org/ebooks/49635" },
  { title: "Astronomy for Amateurs", author: "Camille Flammarion", category: "Space 🌌", desc: "A poetic, accessible guide to observing constellations, planetary orbits, and the cosmos.", peekQuote: "What is there more sublime than the quiet contemplation of the infinite vault of heaven?", link: "https://gutenberg.org/ebooks/42144" },
  { title: "Relativity: The Special & General Theory", author: "Albert Einstein", category: "Space 🌌", desc: "Albert Einstein's own direct, accessible explanation of the physics of light, time, and gravity.", peekQuote: "Time and space are modes by which we think and not conditions in which we live.", link: "https://gutenberg.org/ebooks/30155" },

  // 6. Indian Traditional Classics & Eastern Wisdom 🪷
  { title: "The Song Celestial (Bhagavad Gita)", author: "Edwin Arnold translation", category: "Indian Classics 🪷", desc: "The sacred dialogue on duty (Dharma), self-mastery, inner equanimity, and devotion.", peekQuote: "You have a right to your labors, but not to the fruits thereof. Act with a calm mind, unattached to outcome.", link: "https://gutenberg.org/ebooks/2388" },
  { title: "The Upanishads", author: "Swami Paramananda translation", category: "Indian Classics 🪷", desc: "The ancient philosophical scriptures exploring Brahman, Atman, and supreme consciousness.", peekQuote: "Lead me from the unreal to the real. Lead me from darkness to light. Lead me from death to immortality.", link: "https://gutenberg.org/ebooks/3283" },
  { title: "Raja Yoga (Self-Mastery)", author: "Swami Vivekananda", category: "Indian Classics 🪷", desc: "Swami Vivekananda's systematic lectures on concentration, meditation, and Patanjali's Yoga Sutras.", peekQuote: "Take up one idea. Make that one idea your life; dream of it; think of it; live on that idea.", link: "https://gutenberg.org" },
  { title: "Gitanjali (Song Offerings)", author: "Rabindranath Tagore", category: "Indian Classics 🪷", desc: "The Nobel Prize-winning collection of poetic devotion, divine beauty, and human longing.", peekQuote: "Where the mind is without fear and the head is held high; into that heaven of freedom, my Father, let my country awake.", link: "https://gutenberg.org/ebooks/7164" },

  // 7. Manipulation, Power & Influence 🎭
  { title: "The Prince", author: "Niccolò Machiavelli", category: "Manipulation 🎭", desc: "The infamous realism manual on political survival, power dynamics, and human pragmatism.", peekQuote: "It is much safer to be feared than loved, if one cannot be both.", link: "https://standardebooks.org/ebooks/niccolo-machiavelli/the-prince" },
  { title: "The Art of Worldly Wisdom", author: "Baltasar Gracián", category: "Manipulation 🎭", desc: "300 tactical aphorisms on discretion, reading human motives, and social strategy.", peekQuote: "Keep something in reserve. Do not display all your resources at once.", link: "https://gutenberg.org" },

  // 8. Philosophy & Mindset 🌿
  { title: "Meditations", author: "Marcus Aurelius", category: "Philosophy 🌿", desc: "Private reflections on calm, discipline, mindfulness, and cosmic duty.", peekQuote: "Dwell on the beauty of life. Watch the stars, and see yourself running with them.", link: "https://standardebooks.org/ebooks/marcus-aurelius/meditations" },
  { title: "Letters to a Young Poet", author: "Rainer Maria Rilke", category: "Philosophy 🌿", desc: "Ten timeless letters on loneliness, patience, artistic craft, and inner growth.", peekQuote: "Be patient toward all that is unsolved in your heart and try to love the questions themselves.", link: "https://gutenberg.org" },

  // 9. AI, Machines & Future Logic 🤖
  { title: "Computing Machinery and Intelligence", author: "Alan Turing", category: "AI & Machines 🤖", desc: "Alan Turing's foundational paper introducing the Turing Test and machine consciousness.", peekQuote: "We can only see a short distance ahead, but we can see plenty there that needs to be done.", link: "https://archive.org" },
  { title: "R.U.R. (Rossum's Universal Robots)", author: "Karel Čapek", category: "AI & Machines 🤖", desc: "The play that coined the world's very word 'robot', exploring artificial workers and humanity.", peekQuote: "The product of the human brain has escaped the control of human hands.", link: "https://gutenberg.org/ebooks/59112" }
];

const QUOTE_DECKS: Record<string, { quote: string; author: string }[]> = {
  "Philosophy & Stoicism 🌿": [
    { quote: "Dwell on the beauty of life. Watch the stars, and see yourself running with them.", author: "Marcus Aurelius" },
    { quote: "We suffer more often in imagination than in reality.", author: "Seneca" },
    { quote: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche" }
  ],
  "Psychology & Mind 🧠": [
    { quote: "The greatest weapon against stress is our ability to choose one thought over another.", author: "William James" },
    { quote: "Until you make the unconscious conscious, it will direct your life and you will call it fate.", author: "Carl Jung" }
  ],
  "Deep Focus & Grit 🔥": [
    { quote: "Consistency always beats intensity every single time.", author: "James Clear" },
    { quote: "Small deeds done are better than great deeds planned.", author: "Peter Marshall" }
  ]
};

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [activeTab, setActiveTab] = useState<'timer' | 'study' | 'techniques' | 'achievements' | 'calendar' | 'library' | 'quotes' | 'sandbox' | 'vision' | 'garden' | 'quests' | 'journal'>('timer');

  // LOCAL-FIRST PERSISTENT STATE
  const [sessions, setSessions] = useState<LearningSession[]>(() => {
    const s = localStorage.getItem('localSessions');
    return s ? JSON.parse(s) : [];
  });
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    const s = localStorage.getItem('localTodos');
    return s ? JSON.parse(s) : [];
  });
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    const s = localStorage.getItem('localJournal');
    return s ? JSON.parse(s) : [];
  });
  const [questions, setQuestions] = useState<CuriosityQuestion[]>(() => {
    const s = localStorage.getItem('localQuestions');
    return s ? JSON.parse(s) : [];
  });
  const [topicStats, setTopicStats] = useState<{ topic: string; minutes: number }[]>([]);
  const [dayRatings, setDayRatings] = useState<Record<string, string>>(() => {
    const s = localStorage.getItem('localDayRatings');
    return s ? JSON.parse(s) : {};
  });

  // Clean Audio Stream
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Timer State
  const [timerMode, setTimerMode] = useState<'stopwatch' | 'pomodoro'>('stopwatch');
  const [pomodoroTargetMins, setPomodoroTargetMins] = useState(25);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerTopic, setTimerTopic] = useState('');
  const [timerActivity, setTimerActivity] = useState('');

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewTopic, setReviewTopic] = useState('');
  const [reviewActivity, setReviewActivity] = useState('');
  const [reviewMinutes, setReviewMinutes] = useState(25);
  const [reviewMood, setReviewMood] = useState('Accomplished ✨');

  // Manual Log State
  const [manualTopic, setManualTopic] = useState('');
  const [manualActivity, setManualActivity] = useState('');
  const [manualDuration, setManualDuration] = useState(30);

  // Milestone Inline Editing State (NO 023 OR NEGATIVE NUMBERS)
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [editingSessionActivity, setEditingSessionActivity] = useState('');
  const [editingSessionTopic, setEditingSessionTopic] = useState('');
  const [editingSessionMinutes, setEditingSessionMinutes] = useState(25);

  // Book Flashcard State
  const [peekedBookTitle, setPeekedBookTitle] = useState<string | null>(null);
  const [bookCategoryFilter, setBookCategoryFilter] = useState('All');

  // Vision Board State (30 Emojis)
  const [visions, setVisions] = useState<VisionPillar[]>(() => {
    const s = localStorage.getItem('userVisions');
    return s ? JSON.parse(s) : [
      { id: 1, title: "Psychology & Mind", emoji: "🧠", goal: "Understand neural plasticity and human behavior.", manifested: false },
      { id: 2, title: "Cosmos & Physics", emoji: "🌌", goal: "Explore spacetime curvature and relativity.", manifested: false },
      { id: 3, title: "Financial Freedom", emoji: "💰", goal: "Master cash-flow and compounding capital.", manifested: false }
    ];
  });
  const [newVisionTitle, setNewVisionTitle] = useState('');
  const [newVisionGoal, setNewVisionGoal] = useState('');
  const [newVisionEmoji, setNewVisionEmoji] = useState('🧠');

  // Quotes Vault State
  const themeKeys = Object.keys(QUOTE_DECKS);
  const [selectedQuoteTheme, setSelectedQuoteTheme] = useState(themeKeys[0]);
  const [quoteDeckIdx, setQuoteDeckIdx] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [onlineQuote, setOnlineQuote] = useState<{ quote: string; author: string } | null>(null);
  const [fetchingOnline, setFetchingOnline] = useState(false);

  // Curiosity Question State
  const [newQuestionText, setNewQuestionText] = useState('');
  const [questionCategory, setQuestionCategory] = useState('Brain 🧠');

  // Live Internet Fact State
  const [onlineFact, setOnlineFact] = useState<string | null>(null);
  const [fetchingFact, setFetchingFact] = useState(false);

  // Calendar State
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(now.toISOString().slice(0, 10));
  const [calLogTopic, setCalLogTopic] = useState('');
  const [calLogActivity, setCalLogActivity] = useState('');
  const [calLogMins, setCalLogMins] = useState(30);
  const [justRated, setJustRated] = useState(false);

  // Quests & Journal
  const [newQuestText, setNewQuestText] = useState('');
  const [editingQuestId, setEditingQuestId] = useState<number | null>(null);
  const [editingQuestText, setEditingQuestText] = useState('');
  const [journalTitle, setJournalTitle] = useState('');
  const [journalContent, setJournalContent] = useState('');
  const [selectedMoodSticker, setSelectedMoodSticker] = useState(JOURNAL_MOOD_STICKERS[0]);
  const [selectedJournalFont, setSelectedJournalFont] = useState(JOURNAL_FONTS[0].id);

  // Auto-Save to LocalStorage
  useEffect(() => { localStorage.setItem('localSessions', JSON.stringify(sessions)); }, [sessions]);
  useEffect(() => { localStorage.setItem('localTodos', JSON.stringify(todos)); }, [todos]);
  useEffect(() => { localStorage.setItem('localJournal', JSON.stringify(journalEntries)); }, [journalEntries]);
  useEffect(() => { localStorage.setItem('localQuestions', JSON.stringify(questions)); }, [questions]);
  useEffect(() => { localStorage.setItem('userVisions', JSON.stringify(visions)); }, [visions]);
  useEffect(() => { localStorage.setItem('localDayRatings', JSON.stringify(dayRatings)); }, [dayRatings]);
  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); }, [theme]);

  // Recalculate Topic Distribution
  useEffect(() => {
    const totals: Record<string, number> = {};
    sessions.forEach(s => {
      totals[s.topic] = (totals[s.topic] || 0) + s.duration_minutes;
    });
    setTopicStats(Object.entries(totals).map(([topic, minutes]) => ({ topic, minutes })));
  }, [sessions]);

  // Cloud Sync on Mount
  useEffect(() => {
    const syncCloud = async () => {
      try {
        const [sessRes, todosRes, jourRes, questRes] = await Promise.all([
          fetch(`${API_BASE}/learning-sessions`),
          fetch(`${API_BASE}/todos`),
          fetch(`${API_BASE}/journal`),
          fetch(`${API_BASE}/questions`),
        ]);
        if (sessRes.ok) {
          const c = await sessRes.json();
          if (c.length > 0) setSessions(c);
        }
        if (todosRes.ok) {
          const c = await todosRes.json();
          if (c.length > 0) setTodos(c);
        }
        if (jourRes.ok) {
          const c = await jourRes.json();
          if (c.length > 0) setJournalEntries(c);
        }
        if (questRes.ok) {
          const c = await questRes.json();
          if (c.length > 0) setQuestions(c);
        }
      } catch (e) {
        console.log('Operating in local-first mode');
      }
    };
    syncCloud();
  }, []);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  // Timer interval engine
  useEffect(() => {
    let interval: any = null;
    if (timerRunning) {
      interval = setInterval(() => {
        if (timerMode === 'stopwatch') {
          setTimerSeconds(s => s + 1);
        } else {
          setTimerSeconds(s => {
            if (s <= 1) {
              clearInterval(interval);
              setTimerRunning(false);
              openReviewModal(pomodoroTargetMins);
              return 0;
            }
            return s - 1;
          });
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerMode, pomodoroTargetMins]);

  const formatTimer = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const openReviewModal = (elapsedMins: number) => {
    setReviewTopic(timerTopic || 'Study Block');
    setReviewActivity(timerActivity || 'Deep focus session');
    setReviewMinutes(Math.max(1, elapsedMins));
    setShowReviewModal(true);
  };

  const saveSessionRecord = async (sessionData: { topic: string; activity: string; duration_minutes: number; mood: string; session_date: string }) => {
    const newSession: LearningSession = { id: Date.now(), ...sessionData };
    setSessions(prev => [newSession, ...prev]);

    try {
      await fetch(`${API_BASE}/learning-sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...sessionData, completed: true }),
      });
    } catch (e) { }
  };

  const handleSaveReviewedSession = () => {
    saveSessionRecord({
      topic: reviewTopic,
      activity: reviewActivity,
      duration_minutes: Math.max(1, Number(reviewMinutes)),
      mood: reviewMood,
      session_date: new Date().toISOString().slice(0, 10)
    });
    setShowReviewModal(false);
    setTimerSeconds(timerMode === 'pomodoro' ? pomodoroTargetMins * 60 : 0);
    setTimerTopic('');
    setTimerActivity('');
    setActiveTab('study');
  };

  const handleManualQuickLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTopic || !manualActivity) return;
    saveSessionRecord({
      topic: manualTopic,
      activity: manualActivity,
      duration_minutes: Math.max(1, Number(manualDuration)),
      mood: 'Focused 😊',
      session_date: new Date().toISOString().slice(0, 10)
    });
    setManualTopic('');
    setManualActivity('');
  };

  const handleDeleteSession = async (id: number) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    try { await fetch(`${API_BASE}/learning-sessions/${id}`, { method: 'DELETE' }); } catch (e) { }
  };

  // Start Editing Milestone (NO 023 AND MIN=1)
  const startEditingSession = (s: LearningSession) => {
    setEditingSessionId(s.id);
    setEditingSessionActivity(s.activity);
    setEditingSessionTopic(s.topic);
    setEditingSessionMinutes(Math.max(1, s.duration_minutes));
  };

  // Save Renamed Milestone
  const saveEditedSession = async (id: number) => {
    const cleanMins = Math.max(1, Number(editingSessionMinutes));
    setSessions(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          activity: editingSessionActivity,
          topic: editingSessionTopic,
          duration_minutes: cleanMins
        };
      }
      return s;
    }));

    setEditingSessionId(null);

    try {
      await fetch(`${API_BASE}/learning-sessions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity: editingSessionActivity,
          topic: editingSessionTopic,
          duration_minutes: cleanMins
        }),
      });
    } catch (e) { }
  };

  // Apply Study Technique to Timer
  const applyTechniqueToTimer = (technique: typeof STUDY_TECHNIQUES[0]) => {
    setTimerMode('pomodoro');
    setPomodoroTargetMins(technique.time);
    setTimerSeconds(technique.time * 60);
    setTimerTopic(technique.title);
    setTimerActivity(`Applying ${technique.title}`);
    setActiveTab('timer');
  };

  // Fetch Live Internet Fact
  const fetchInternetFact = async () => {
    setFetchingFact(true);
    try {
      const res = await fetch("https://uselessfacts.jsph.pl/api/v2/facts/random?language=en");
      const data = await res.json();
      setOnlineFact(data.text);
    } catch (e) {
      setOnlineFact("The human brain generates about 20-25 watts of electrical power while awake — enough to power a lightbulb!");
    } finally {
      setFetchingFact(false);
    }
  };

  // Calendar
  const handleCalendarLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!calLogTopic || !calLogActivity) return;
    saveSessionRecord({
      topic: calLogTopic,
      activity: calLogActivity,
      duration_minutes: Math.max(1, Number(calLogMins)),
      mood: 'Calendar Planted 🌸',
      session_date: selectedDate
    });
    setCalLogTopic('');
    setCalLogActivity('');
  };

  const handleSetDayRating = (rating: string) => {
    setDayRatings(prev => ({ ...prev, [selectedDate]: rating }));
    setJustRated(true);
    setTimeout(() => setJustRated(false), 350);
  };

  // Curiosity Questions
  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText) return;
    const newQ: CuriosityQuestion = {
      id: Date.now(),
      question: newQuestionText,
      category: questionCategory,
      answer_notes: null,
      status: "Unexplored 💭",
      created_at: new Date().toISOString()
    };
    setQuestions(prev => [newQ, ...prev]);
    setNewQuestionText('');

    try {
      await fetch(`${API_BASE}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: newQ.question, category: newQ.category }),
      });
    } catch (e) { }
  };

  const handleToggleQuestionStatus = async (q: CuriosityQuestion) => {
    const newStatus = q.status === "Unexplored 💭" ? "Solved 💡" : "Unexplored 💭";
    setQuestions(prev => prev.map(item => item.id === q.id ? { ...item, status: newStatus } : item));
    try {
      await fetch(`${API_BASE}/questions/${q.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) { }
  };

  const handleDeleteQuestion = async (id: number) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    try { await fetch(`${API_BASE}/questions/${id}`, { method: 'DELETE' }); } catch (e) { }
  };

  // Quests
  const handleAddQuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestText) return;
    const newT: TodoItem = { id: Date.now(), text: newQuestText, completed: false };
    setTodos(prev => [newT, ...prev]);
    setNewQuestText('');
    try {
      await fetch(`${API_BASE}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newT.text }),
      });
    } catch (e) { }
  };

  const handleToggleQuest = async (id: number) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    try { await fetch(`${API_BASE}/todos/${id}/toggle`, { method: 'PUT' }); } catch (e) { }
  };

  const handleDeleteQuest = async (id: number) => {
    setTodos(prev => prev.filter(t => t.id !== id));
    try { await fetch(`${API_BASE}/todos/${id}`, { method: 'DELETE' }); } catch (e) { }
  };

  const saveRenameQuest = async (id: number) => {
    if (!editingQuestText) return;
    setTodos(prev => prev.map(t => t.id === id ? { ...t, text: editingQuestText } : t));
    setEditingQuestId(null);
    try {
      await fetch(`${API_BASE}/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: editingQuestText }),
      });
    } catch (e) { }
  };

  // Journal
  const handleSaveJournal = async () => {
    if (!journalContent) return;
    const newJ: JournalEntry = {
      id: Date.now(),
      title: journalTitle || 'Daily Scrapbook Memory',
      content: journalContent,
      mood: selectedMoodSticker,
      fontStyle: selectedJournalFont,
      created_at: new Date().toISOString()
    };
    setJournalEntries(prev => [newJ, ...prev]);
    setJournalTitle('');
    setJournalContent('');

    try {
      await fetch(`${API_BASE}/journal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newJ.title, content: newJ.content, mood: newJ.mood }),
      });
    } catch (e) { }
  };

  const handleDeleteJournal = async (id: number) => {
    setJournalEntries(prev => prev.filter(j => j.id !== id));
    try { await fetch(`${API_BASE}/journal/${id}`, { method: 'DELETE' }); } catch (e) { }
  };

  // Vision Board
  const handleAddVision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVisionTitle) return;
    const item: VisionPillar = {
      id: Date.now(),
      title: newVisionTitle,
      goal: newVisionGoal || "Self-mastery and learning.",
      emoji: newVisionEmoji || "🧠",
      manifested: false
    };
    setVisions([item, ...visions]);
    setNewVisionTitle('');
    setNewVisionGoal('');
  };

  const toggleManifested = (id: number) => {
    setVisions(visions.map(v => v.id === id ? { ...v, manifested: !v.manifested } : v));
  };

  const deleteVision = (id: number) => {
    setVisions(visions.filter(v => v.id !== id));
  };

  const fetchLiveOnlineQuote = async () => {
    setFetchingOnline(true);
    try {
      const res = await fetch("https://dummyjson.com/quotes/random");
      const data = await res.json();
      setOnlineQuote({ quote: data.quote, author: data.author });
    } catch (err) {
      setOnlineQuote({ quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" });
    } finally {
      setFetchingOnline(false);
    }
  };

  // Calendar Math
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();
  const monthName = new Date(calYear, calMonth).toLocaleString('default', { month: 'long' });
  const sessionsOnDate = sessions.filter(s => s.session_date === selectedDate);
  const journalOnDate = journalEntries.filter(j => j.created_at.slice(0, 10) === selectedDate);

  // Filtered Books
  const filteredBooks = bookCategoryFilter === 'All'
    ? EXPANDED_LIBRARY
    : EXPANDED_LIBRARY.filter(b => b.category.toLowerCase().includes(bookCategoryFilter.toLowerCase()));

  // Garden Stage
  function getGardenStage() {
    const count = sessions.length;
    if (count === 0) return { icon: '🌰', title: 'Little Acorn', next: 1, desc: 'Plant your first study session to germinate your garden!' };
    if (count < 3) return { icon: '🌱', title: 'Curious Sprout', next: 3, desc: 'The first green leaves appear in the gentle morning light.' };
    if (count < 7) return { icon: '🌿', title: 'Flourishing Fern', next: 7, desc: 'Stems are growing strong with consistent study habits.' };
    if (count < 12) return { icon: '🌷', title: 'Blooming Tulip', next: 12, desc: 'Color fills your garden! Real skills are flourishing.' };
    if (count < 20) return { icon: '🪴', title: 'Zen Bonsai Tree', next: 20, desc: 'Disciplined, graceful, and deeply rooted in practice.' };
    if (count < 35) return { icon: '🌸', title: 'Ancient Sakura Blossom', next: 35, desc: 'A breathtaking tree raining fragrant pink petals.' };
    return { icon: '🌌', title: 'Celestial Spirit Forest', next: 50, desc: 'A mystical sanctuary of timeless wisdom and mastery.' };
  }

  const garden = getGardenStage();
  const totalHours = (sessions.reduce((acc, s) => acc + s.duration_minutes, 0) / 60).toFixed(1);

  // 10 Verified Achievements
  const achievements = [
    { id: 1, title: 'First Step', icon: '🐾', quote: 'A journey of a thousand miles begins with a single step.', desc: 'Log 1 learning session', unlocked: sessions.length >= 1 },
    { id: 2, title: 'Green Thumb', icon: '🌱', quote: 'Small seeds grow into mighty trees.', desc: 'Sprout your garden (2+ sessions)', unlocked: sessions.length >= 2 },
    { id: 3, title: 'Curious Cat', icon: '🐱', quote: 'Curiosity is the spark of genius.', desc: 'Study 3 distinct topics', unlocked: topicStats.length >= 3 },
    { id: 4, title: 'Flow State', icon: '🌊', quote: 'Time disappears when you love what you learn.', desc: 'Log a session of 45+ minutes', unlocked: sessions.some(s => s.duration_minutes >= 45) },
    { id: 5, title: 'Deep Roots', icon: '🌿', quote: 'Consistency always beats intensity.', desc: 'Log 5 total sessions', unlocked: sessions.length >= 5 },
    { id: 6, title: 'In Full Bloom', icon: '🌷', quote: 'Bloom where you are planted.', desc: 'Reach 10 sessions in your garden', unlocked: sessions.length >= 10 },
    { id: 7, title: 'Ten-Hour Master', icon: '⏳', quote: 'Dedicated hours compound into miracles.', desc: 'Log 10+ total study hours', unlocked: Number(totalHours) >= 10 },
    { id: 8, title: 'Thought Keeper', icon: '📖', quote: 'Writing is thinking out loud on paper.', desc: 'Save 3 journal entries', unlocked: journalEntries.length >= 3 },
    { id: 9, title: 'Quest Hunter', icon: '🍀', quote: 'Check off small goals to win big victories.', desc: 'Complete 3 daily quests', unlocked: todos.filter(t => t.completed).length >= 3 },
    { id: 10, title: 'Sakura Legend', icon: '🌸', quote: 'You are authoring a life worth celebrating.', desc: 'Reach 20+ study milestones', unlocked: sessions.length >= 20 },
  ];

  const activeDeck = QUOTE_DECKS[selectedQuoteTheme] || [];
  const currentQuoteItem = activeDeck[quoteDeckIdx % activeDeck.length];

  return (
    <div className="little-life-shell">
      {/* Clean 24/7 Lofi Stream */}
      <audio ref={audioRef} src="https://streams.ilovemusic.de/iloveradio17.mp3" preload="none" />

      {/* REVIEW & RENAME COMPLETION MODAL */}
      {showReviewModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span style={{ fontSize: '3rem' }}>🎉</span>
            <h3 style={{ fontSize: '1.8rem', margin: '0.5rem 0' }}>Session Complete!</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>Review or rename your focus block:</p>

            <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>SUBJECT</label>
              <input className="input-cute" value={reviewTopic} onChange={e => setReviewTopic(e.target.value)} />
            </div>

            <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>ACTIVITY</label>
              <input className="input-cute" value={reviewActivity} onChange={e => setReviewActivity(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>MINUTES</label>
                <input
                  type="number"
                  min="1"
                  className="input-cute"
                  value={reviewMinutes || ''}
                  onChange={e => {
                    const clean = parseInt(e.target.value.replace(/^0+/, ''), 10);
                    setReviewMinutes(isNaN(clean) ? 1 : Math.max(1, clean));
                  }}
                />
              </div>
              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>MOOD</label>
                <select className="input-cute" value={reviewMood} onChange={e => setReviewMood(e.target.value)}>
                  <option value="Accomplished ✨">Accomplished ✨</option>
                  <option value="Deep Focus 🎧">Deep Focus 🎧</option>
                  <option value="Calm ☕">Calm ☕</option>
                  <option value="Tired 😴">Tired 😴</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn-cute" style={{ background: 'var(--bg-card-hover)', color: 'var(--text-main)', border: '2px solid var(--border-card)', flex: 1 }} onClick={() => setShowReviewModal(false)}>Cancel</button>
              <button className="btn-cute" style={{ flex: 1 }} onClick={handleSaveReviewedSession}>Plant Milestone 🌱</button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className={`scrapbook-sidebar ${activeTab !== 'timer' ? 'hide-on-mobile-subpages' : ''}`}>
        <div>
          {/* Mochi Mascot */}
          <div className="mascot-card">
            <svg className="cat-svg" viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 36L14 12C14 12 28 18 36 26" fill="#ffe082" stroke="#ffb74d" strokeWidth="3" strokeLinejoin="round" />
              <path d="M78 36L86 12C86 12 72 18 64 26" fill="#ffe082" stroke="#ffb74d" strokeWidth="3" strokeLinejoin="round" />
              <ellipse cx="50" cy="50" rx="36" ry="30" fill="#fff9c4" stroke="#ffb74d" strokeWidth="3" />
              <circle cx="38" cy="48" r="4" fill="#3d3447" />
              <circle cx="62" cy="48" r="4" fill="#3d3447" />
              <circle cx="39" cy="46" r="1.5" fill="white" />
              <circle cx="63" cy="46" r="1.5" fill="white" />
              <polygon points="50,54 46,58 54,58" fill="#ff85a2" />
              <path d="M46 58Q50 63 54 58" stroke="#ff85a2" strokeWidth="2" strokeLinecap="round" />
              <ellipse cx="30" cy="56" rx="5" ry="3" fill="#ff85a2" opacity="0.6" />
              <ellipse cx="70" cy="56" rx="5" ry="3" fill="#ff85a2" opacity="0.6" />
            </svg>
            <h3 style={{ fontSize: '1.25rem', marginTop: '0.4rem' }}>Mochi the Cat</h3>
            <div className="speech-bubble">
              {timerRunning ? "Deep focus flow active! 🎧✨" : "A little progress every day makes a lot of life! 🌸"}
            </div>
          </div>

          {/* Clean Lofi Beats Player */}
          <div className="lofi-widget">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>☕ Cozy Lofi Beats</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isPlaying ? '● Playing Smoothly' : 'Paused'}</p>
              </div>
              <button onClick={toggleAudio} style={{ background: 'var(--accent-pink)', border: 'none', width: 42, height: 42, borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: 2 }} />}
              </button>
            </div>
          </div>

          {/* Vitals Stats */}
          <div style={{ background: 'var(--bg-card)', border: '2px solid var(--border-card)', borderRadius: 18, padding: '1rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Invested Time:</span>
              <strong>{totalHours} hrs</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Sessions:</span>
              <strong>{sessions.length}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Garden Stage:</span>
              <strong>{garden.title}</strong>
            </div>
          </div>
        </div>

        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ background: 'var(--bg-card)', border: '2px solid var(--border-card)', padding: '0.6rem', borderRadius: 999, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '1.25rem' }}>
          {theme === 'dark' ? <Sun size={15} color="#ffd54f" /> : <Moon size={15} color="#b39ddb" />}
          {theme === 'dark' ? 'Cream Paper' : 'Midnight Scrapbook'}
        </button>
      </aside>

      {/* CENTERED MAIN CANVAS */}
      <main className="scrapbook-canvas">
        <div className="canvas-max-wrapper">

          {/* JELLY NAVIGATION ROW */}
          <div className="jelly-row-wrapper">
            <nav className="jelly-row">
              <button className={`jelly-btn ${activeTab === 'timer' ? 'active' : ''}`} onClick={() => setActiveTab('timer')}>
                <div className="jelly-sticker jelly-peach">⏱️</div>
                <span className="jelly-label">Focus</span>
              </button>

              <button className={`jelly-btn ${activeTab === 'study' ? 'active' : ''}`} onClick={() => setActiveTab('study')}>
                <div className="jelly-sticker jelly-pink">🎀</div>
                <span className="jelly-label">Study Log</span>
              </button>

              <button className={`jelly-btn ${activeTab === 'techniques' ? 'active' : ''}`} onClick={() => setActiveTab('techniques')}>
                <div className="jelly-sticker jelly-butter">🧠</div>
                <span className="jelly-label">Techniques</span>
              </button>

              <button className={`jelly-btn ${activeTab === 'achievements' ? 'active' : ''}`} onClick={() => setActiveTab('achievements')}>
                <div className="jelly-sticker jelly-grape">🏆</div>
                <span className="jelly-label">Badges</span>
              </button>

              <button className={`jelly-btn ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>
                <div className="jelly-sticker jelly-lavender">📅</div>
                <span className="jelly-label">Calendar</span>
              </button>

              <button className={`jelly-btn ${activeTab === 'library' ? 'active' : ''}`} onClick={() => setActiveTab('library')}>
                <div className="jelly-sticker jelly-lavender">📚</div>
                <span className="jelly-label">Books</span>
              </button>

              <button className={`jelly-btn ${activeTab === 'quotes' ? 'active' : ''}`} onClick={() => setActiveTab('quotes')}>
                <div className="jelly-sticker jelly-butter">✨</div>
                <span className="jelly-label">Quotes</span>
              </button>

              <button className={`jelly-btn ${activeTab === 'sandbox' ? 'active' : ''}`} onClick={() => setActiveTab('sandbox')}>
                <div className="jelly-sticker jelly-mint">💭</div>
                <span className="jelly-label">Curiosity</span>
              </button>

              <button className={`jelly-btn ${activeTab === 'vision' ? 'active' : ''}`} onClick={() => setActiveTab('vision')}>
                <div className="jelly-sticker jelly-butter">🖼️</div>
                <span className="jelly-label">Vision</span>
              </button>

              <button className={`jelly-btn ${activeTab === 'garden' ? 'active' : ''}`} onClick={() => setActiveTab('garden')}>
                <div className="jelly-sticker jelly-mint">🌱</div>
                <span className="jelly-label">Garden</span>
              </button>

              <button className={`jelly-btn ${activeTab === 'quests' ? 'active' : ''}`} onClick={() => setActiveTab('quests')}>
                <div className="jelly-sticker jelly-butter">🍀</div>
                <span className="jelly-label">Quests</span>
              </button>

              <button className={`jelly-btn ${activeTab === 'journal' ? 'active' : ''}`} onClick={() => setActiveTab('journal')}>
                <div className="jelly-sticker jelly-grape">📖</div>
                <span className="jelly-label">Journal</span>
              </button>
            </nav>
          </div>

          {/* 1. FOCUS TIMER */}
          {activeTab === 'timer' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <button className="btn-cute" style={{ background: timerMode === 'stopwatch' ? 'var(--accent-pink)' : 'var(--bg-card-hover)', color: timerMode === 'stopwatch' ? 'white' : 'var(--text-main)', border: '2px solid var(--border-card)' }} onClick={() => { setTimerMode('stopwatch'); setTimerRunning(false); setTimerSeconds(0); }}>⏱️ Open Stopwatch</button>
                <button className="btn-cute" style={{ background: timerMode === 'pomodoro' ? 'var(--accent-pink)' : 'var(--bg-card-hover)', color: timerMode === 'pomodoro' ? 'white' : 'var(--text-main)', border: '2px solid var(--border-card)' }} onClick={() => { setTimerMode('pomodoro'); setPomodoroTargetMins(25); setTimerSeconds(25 * 60); setTimerRunning(false); }}>⏳ Pomodoro</button>
              </div>

              {timerMode === 'pomodoro' && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {[15, 25, 45, 60, 90].map(mins => (
                    <button key={mins} className="btn-cute" style={{ background: pomodoroTargetMins === mins ? 'var(--accent-lavender)' : 'var(--bg-card)', color: pomodoroTargetMins === mins ? 'white' : 'var(--text-main)', border: '2px solid var(--border-card)', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => { setPomodoroTargetMins(mins); setTimerSeconds(mins * 60); setTimerRunning(false); }}>{mins}m</button>
                  ))}
                </div>
              )}

              <div className="stopwatch-hero">
                <div className="responsive-form-row" style={{ maxWidth: 520, margin: '0 auto 1rem auto' }}>
                  <input className="input-cute" placeholder="Subject..." value={timerTopic} onChange={e => setTimerTopic(e.target.value)} />
                  <input className="input-cute" placeholder="Task..." value={timerActivity} onChange={e => setTimerActivity(e.target.value)} />
                </div>
                <div className="stopwatch-digits">{formatTimer(timerSeconds)}</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                  {!timerRunning ? (
                    <button className="btn-cute" onClick={() => setTimerRunning(true)} style={{ background: 'var(--accent-mint)', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2rem', fontSize: '1.1rem' }}>
                      <Play size={20} fill="white" /> Start Studying
                    </button>
                  ) : (
                    <button className="btn-cute" onClick={() => { setTimerRunning(false); openReviewModal(timerMode === 'stopwatch' ? Math.max(1, Math.round(timerSeconds / 60)) : pomodoroTargetMins); }} style={{ background: 'var(--accent-pink)', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2rem', fontSize: '1.1rem' }}>
                      <Pause size={20} fill="white" /> Finish & Review 🌱
                    </button>
                  )}
                  {timerSeconds > 0 && !timerRunning && (
                    <button onClick={() => setTimerSeconds(timerMode === 'pomodoro' ? pomodoroTargetMins * 60 : 0)} style={{ background: 'var(--bg-card-hover)', border: '2px solid var(--border-card)', borderRadius: 14, padding: '0 1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                      <RotateCcw size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2. STUDY LOG & GRAPH (RECHARTS BAR CHART + SANITIZED EDITING) */}
          {activeTab === 'study' && (
            <div>
              <h2 style={{ fontSize: '2.4rem', marginBottom: '0.25rem', textAlign: 'center' }}>Study Analytics & Graph 🎀</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'center' }}>
                Your visual topic breakdown and verified study session history.
              </p>

              {/* The Recharts Bar Chart */}
              <div style={{ background: 'var(--bg-card)', border: '2px solid var(--border-card)', borderRadius: 28, padding: '2rem', boxShadow: 'var(--shadow-cozy)', marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <BarChart2 size={20} color="var(--accent-pink)" />
                  <h3 style={{ fontSize: '1.3rem' }}>Topic Time Distribution (Minutes)</h3>
                </div>
                {topicStats.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No study minutes recorded yet. Record a session to see your graph grow!</div>
                ) : (
                  <div style={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topicStats}>
                        <XAxis dataKey="topic" stroke="var(--text-muted)" fontSize={12} />
                        <YAxis stroke="var(--text-muted)" fontSize={12} />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)', borderRadius: 14 }} />
                        <Bar dataKey="minutes" radius={[10, 10, 0, 0]}>
                          {topicStats.map((_, i) => (<Cell key={i} fill={PASTEL_BARS[i % PASTEL_BARS.length]} />))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Quick Offline Log Form */}
              <div style={{ background: 'var(--bg-card)', border: '2px solid var(--border-card)', borderRadius: 24, padding: '1.75rem', marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.35rem' }}>Log Offline Work 🎀</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>Studied without running the timer? Quickly record your block here:</p>

                <form onSubmit={handleManualQuickLog}>
                  <div className="responsive-form-row" style={{ marginBottom: '1rem' }}>
                    <input className="input-cute" placeholder="Subject (e.g. Python, Economics)..." value={manualTopic} onChange={e => setManualTopic(e.target.value)} required />
                    <input className="input-cute" placeholder="What did you learn?..." value={manualActivity} onChange={e => setManualActivity(e.target.value)} required />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {[15, 30, 45, 60, 90].map(mins => (
                        <button key={mins} type="button" onClick={() => setManualDuration(mins)} style={{ background: manualDuration === mins ? 'var(--accent-pink)' : 'var(--bg-card-hover)', color: manualDuration === mins ? 'white' : 'var(--text-main)', border: '1px solid var(--border-card)', padding: '0.4rem 0.8rem', borderRadius: 10, cursor: 'pointer', fontWeight: 700 }}>
                          +{mins}m
                        </button>
                      ))}
                    </div>
                    <button type="submit" className="btn-cute">Plant Milestone 🌱</button>
                  </div>
                </form>
              </div>

              {/* Recorded Chapters Feed with Sanitized Edit Mode (NO 023 or NEGATIVE NUMBERS) */}
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Recorded Chapters & Milestones 📜</h3>
              {sessions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 20 }}>No study sessions logged yet!</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {sessions.map(s => (
                    <div key={s.id} style={{ background: 'var(--bg-card)', border: '2px solid var(--border-card)', borderRadius: 18, padding: '1.2rem 1.4rem' }}>

                      {editingSessionId === s.id ? (
                        /* INLINE EDIT MODE WITHOUT AWKWARD ZEROES OR NEGATIVES */
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                          <input
                            className="input-cute"
                            placeholder="Activity title..."
                            value={editingSessionActivity}
                            onChange={e => setEditingSessionActivity(e.target.value)}
                          />
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                              className="input-cute"
                              placeholder="Subject..."
                              value={editingSessionTopic}
                              onChange={e => setEditingSessionTopic(e.target.value)}
                            />
                            <input
                              type="number"
                              min="1"
                              className="input-cute"
                              style={{ width: '90px' }}
                              value={editingSessionMinutes || ''}
                              onChange={e => {
                                const clean = parseInt(e.target.value.replace(/^0+/, ''), 10);
                                setEditingSessionMinutes(isNaN(clean) ? 1 : Math.max(1, clean));
                              }}
                            />
                            <button
                              onClick={() => saveEditedSession(s.id)}
                              style={{ background: 'var(--accent-mint)', border: 'none', borderRadius: 10, padding: '0 1rem', color: 'white', cursor: 'pointer' }}
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => setEditingSessionId(null)}
                              style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-card)', borderRadius: 10, padding: '0 1rem', color: 'var(--text-muted)', cursor: 'pointer' }}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <h4 style={{ fontWeight: 700, fontSize: '1.05rem' }}>{s.activity}</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                              <span style={{ color: 'var(--accent-pink)', fontWeight: 700 }}>{s.topic}</span> • {s.duration_minutes}m • {s.session_date}
                            </p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button
                              onClick={() => startEditingSession(s)}
                              title="Edit / Rename Milestone"
                              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.3rem' }}
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteSession(s.id)}
                              title="Delete milestone"
                              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.3rem' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. STUDY TECHNIQUES & LIVE FACTS */}
          {activeTab === 'techniques' && (
            <div>
              <h2 style={{ fontSize: '2.4rem', marginBottom: '0.25rem', textAlign: 'center' }}>Study Protocols & Facts 🧠</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'center' }}>
                Science-backed learning frameworks and mind-expanding facts!
              </p>

              {/* Live Internet Fact Generator */}
              <div style={{ background: 'var(--bg-card)', border: '2px solid var(--border-card)', borderRadius: 24, padding: '1.75rem', marginBottom: '2.5rem', textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-pink)', textTransform: 'uppercase' }}>Live Internet Science Fact</span>
                <p style={{ fontSize: '1.15rem', fontWeight: 600, margin: '1rem 0', lineHeight: 1.6, color: 'var(--text-main)' }}>
                  {onlineFact || "Click the button below to pull a fresh surprising fact from the web!"}
                </p>
                <button onClick={fetchInternetFact} className="btn-cute" style={{ background: 'var(--accent-mint)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <RefreshCw size={16} className={fetchingFact ? "animate-spin" : ""} />
                  {fetchingFact ? "Fetching Fact..." : "Pull Fresh Fact 🌐"}
                </button>
              </div>

              {/* Techniques with Auto-Timer */}
              <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Study Protocols (Auto-Configure Timer)</h3>
              <div className="technique-grid" style={{ marginBottom: '2.5rem' }}>
                {STUDY_TECHNIQUES.map((tech, i) => (
                  <div key={i} className="technique-card">
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-lavender)' }}>{tech.tag}</span>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0.4rem 0' }}>{tech.title}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{tech.desc}</p>
                    </div>
                    <button onClick={() => applyTechniqueToTimer(tech)} className="btn-cute" style={{ marginTop: '1.25rem', width: '100%' }}>
                      Apply {tech.time}m to Timer ⏱️
                    </button>
                  </div>
                ))}
              </div>

              {/* 10 Curated Surprising Facts */}
              <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>10 Mind-Blowing Facts 🌟</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {TEN_SURPRISING_FACTS.map((f, idx) => (
                  <div key={idx} style={{ background: 'var(--bg-card)', border: '2px solid var(--border-card)', borderRadius: 16, padding: '1rem 1.25rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-pink)' }}>{f.topic}</span>
                    <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', marginTop: '0.2rem', lineHeight: 1.5 }}>{f.fact}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. ACHIEVEMENTS & MILESTONES CABINET */}
          {activeTab === 'achievements' && (
            <div>
              <h2 style={{ fontSize: '2.4rem', marginBottom: '0.25rem', textAlign: 'center' }}>Achievement Cabinet 🏆</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'center' }}>
                Every badge carries encouraging lore and unlocks from your real study milestones!
              </p>

              <div className="badges-grid">
                {achievements.map(a => (
                  <div key={a.id} className={`badge-card ${a.unlocked ? '' : 'locked'}`}>
                    <div className="badge-icon">{a.icon}</div>
                    <div>
                      <h4 style={{ fontWeight: 700, fontSize: '1.1rem' }}>{a.title}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{a.desc}</p>
                      <p style={{ fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--accent-pink)', marginTop: '0.35rem' }}>
                        "{a.quote}"
                      </p>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: a.unlocked ? 'var(--accent-mint)' : 'var(--text-muted)', marginTop: '0.4rem', display: 'inline-block' }}>
                        {a.unlocked ? '✓ UNLOCKED' : '🔒 LOCKED'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. CALENDAR & MOOD RATING */}
          {activeTab === 'calendar' && (
            <div>
              <h2 style={{ fontSize: '2.4rem', marginBottom: '0.25rem', textAlign: 'center' }}>Activity Calendar & Mood 📅</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'center' }}>
                Rate your day with an animated stamp, log past sessions for any date, and inspect your milestones!
              </p>

              <div className="calendar-card">
                <div className="calendar-nav-bar">
                  <button className="btn-cute" style={{ background: 'var(--bg-card-hover)', color: 'var(--text-main)', border: '2px solid var(--border-card)', padding: '0.5rem 1rem' }} onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else { setCalMonth(m => m - 1); } }}>
                    <ChevronLeft size={18} /> Prev
                  </button>
                  <h3 style={{ fontSize: '1.6rem' }}>{monthName} {calYear}</h3>
                  <button className="btn-cute" style={{ background: 'var(--bg-card-hover)', color: 'var(--text-main)', border: '2px solid var(--border-card)', padding: '0.5rem 1rem' }} onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else { setCalMonth(m => m + 1); } }}>
                    Next <ChevronRight size={18} />
                  </button>
                </div>

                <div className="calendar-grid">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (<div key={d} className="calendar-header-day">{d}</div>))}
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => (<div key={`empty-${i}`} className="calendar-cell-empty" />))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const dateStr = `${calYear}-${(calMonth + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
                    const daySessions = sessions.filter(s => s.session_date === dateStr);
                    const dayRating = dayRatings[dateStr];
                    const isSelected = selectedDate === dateStr;
                    return (
                      <div key={dayNum} className={`calendar-cell ${daySessions.length > 0 ? 'has-activity' : ''} ${isSelected ? 'selected' : ''}`} onClick={() => setSelectedDate(dateStr)}>
                        <span>{dayNum}</span>
                        {daySessions.length > 0 && <span style={{ fontSize: '0.7rem' }}>🌸</span>}
                        {dayRating && <span style={{ fontSize: '0.65rem' }}>{dayRating.split(" ")[0]}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Day Rating Selector with Animated Stamp */}
              <div style={{ background: 'var(--bg-card)', border: '2px solid var(--border-card)', borderRadius: 24, padding: '1.75rem', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Rate Your Day on {selectedDate}:</h3>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                  {DAY_RATINGS.map(r => (
                    <button
                      key={r}
                      onClick={() => handleSetDayRating(r)}
                      className={`btn-cute ${dayRatings[selectedDate] === r && justRated ? 'stamp-bounce' : ''}`}
                      style={{
                        background: dayRatings[selectedDate] === r ? 'var(--accent-pink)' : 'var(--bg-card-hover)',
                        color: dayRatings[selectedDate] === r ? 'white' : 'var(--text-main)',
                        border: '1px solid var(--border-card)', padding: '0.4rem 0.8rem', fontSize: '0.8rem'
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Log Milestone Directly on {selectedDate}:</h4>
                <form onSubmit={handleCalendarLogSubmit} className="responsive-form-row">
                  <input className="input-cute" placeholder="Subject..." value={calLogTopic} onChange={e => setCalLogTopic(e.target.value)} required />
                  <input className="input-cute" placeholder="What did you do?..." value={calLogActivity} onChange={e => setCalLogActivity(e.target.value)} required />
                  <input
                    type="number"
                    min="1"
                    className="input-cute"
                    style={{ width: '90px' }}
                    value={calLogMins || ''}
                    onChange={e => {
                      const clean = parseInt(e.target.value.replace(/^0+/, ''), 10);
                      setCalLogMins(isNaN(clean) ? 1 : Math.max(1, clean));
                    }}
                  />
                  <button type="submit" className="btn-cute" style={{ whiteSpace: 'nowrap' }}>Plant for Date 🌸</button>
                </form>
              </div>

              <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Milestones on {selectedDate}:</h3>
              {sessionsOnDate.length === 0 && journalOnDate.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 20 }}>No records on this date.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {sessionsOnDate.map(s => (
                    <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', border: '2px solid var(--border-card)', borderRadius: 18, padding: '1.2rem 1.4rem' }}>
                      <div>
                        <h4 style={{ fontWeight: 700, fontSize: '1.05rem' }}>{s.activity}</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}><span style={{ color: 'var(--accent-pink)', fontWeight: 700 }}>{s.topic}</span> • {s.duration_minutes}m</p>
                      </div>
                      <button onClick={() => handleDeleteSession(s.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 6. 40+ BOOKS LIBRARY WITH FLASHCARD PEEKS */}
          {activeTab === 'library' && (
            <div>
              <h2 style={{ fontSize: '2.4rem', marginBottom: '0.25rem', textAlign: 'center' }}>The Master Bookshelf 📚</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'center' }}>
                Curated public domain classics. Click "Peek Inside 🔍" to sample any book!
              </p>

              {/* Genre Filter Chips */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2rem' }}>
                {['All', 'Psychology', 'Brain', 'Finance', 'Economics', 'Space', 'Indian Classics', 'Manipulation', 'Philosophy', 'AI'].map(genre => (
                  <button
                    key={genre}
                    onClick={() => setBookCategoryFilter(genre)}
                    style={{
                      background: bookCategoryFilter === genre ? 'var(--accent-pink)' : 'var(--bg-card)',
                      color: bookCategoryFilter === genre ? 'white' : 'var(--text-main)',
                      border: '2px solid var(--border-card)', borderRadius: 999, padding: '0.35rem 0.85rem',
                      fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    {genre}
                  </button>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.4rem' }}>
                {filteredBooks.map((b, idx) => {
                  const isFlipped = peekedBookTitle === b.title;
                  return (
                    <div key={idx} className="book-card-flipper">
                      {!isFlipped ? (
                        <div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-pink)' }}>{b.category}</span>
                          <h4 style={{ fontWeight: 700, fontSize: '1.15rem', marginTop: '0.25rem' }}>{b.title}</h4>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{b.author}</p>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.5 }}>{b.desc}</p>
                        </div>
                      ) : (
                        <div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-mint)' }}>ICONIC EXCERPT PEEK 🔍</span>
                          <div className="book-peek-quote-box">"{b.peekQuote}"</div>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>— {b.author}</p>
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem' }}>
                        <button
                          onClick={() => setPeekedBookTitle(isFlipped ? null : b.title)}
                          className="btn-cute"
                          style={{ background: 'var(--bg-card-hover)', color: 'var(--text-main)', border: '1px solid var(--border-card)', padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                        >
                          {isFlipped ? "Flip Back ↩" : "Peek Inside 🔍"}
                        </button>
                        <a href={b.link} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-mint)', textDecoration: 'none' }}>
                          Read Free <ExternalLink size={13} />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 7. QUOTES & WISDOM VAULT */}
          {activeTab === 'quotes' && (
            <div>
              <h2 style={{ fontSize: '2.4rem', marginBottom: '0.25rem', textAlign: 'center' }}>Wisdom & Quotes Sanctuary ✨</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'center' }}>
                Browse themed quote decks or fetch fresh live quotes from across the internet!
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
                {themeKeys.map((themeName) => (
                  <button
                    key={themeName}
                    onClick={() => { setSelectedQuoteTheme(themeName); setQuoteDeckIdx(0); setOnlineQuote(null); }}
                    style={{
                      background: selectedQuoteTheme === themeName ? 'rgba(255, 117, 151, 0.15)' : 'var(--bg-card)',
                      borderColor: selectedQuoteTheme === themeName ? 'var(--accent-pink)' : 'var(--border-card)',
                      borderWidth: '2px', borderStyle: 'solid', borderRadius: 18, padding: '1rem',
                      textAlign: 'center', cursor: 'pointer', color: 'var(--text-main)'
                    }}
                  >
                    <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{themeName}</p>
                  </button>
                ))}
              </div>

              <div style={{ background: 'var(--bg-card)', border: '2px solid var(--border-card)', borderRadius: 28, padding: '2.5rem', textAlign: 'center', boxShadow: 'var(--shadow-cozy)', marginBottom: '2.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-pink)', textTransform: 'uppercase' }}>
                  {onlineQuote ? "Live Web Stream ✨" : selectedQuoteTheme}
                </span>
                <p className="quote-vault-text" style={{ margin: '1rem 0' }}>
                  "{onlineQuote ? onlineQuote.quote : currentQuoteItem?.quote}"
                </p>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-pink)', textTransform: 'uppercase' }}>
                  — {onlineQuote ? onlineQuote.author : currentQuoteItem?.author}
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                  {!onlineQuote && (
                    <button className="btn-cute" style={{ background: 'var(--bg-card-hover)', color: 'var(--text-main)', border: '2px solid var(--border-card)', padding: '0.5rem 0.9rem' }} onClick={() => setQuoteDeckIdx(prev => (prev === 0 ? activeDeck.length - 1 : prev - 1))}>
                      <ChevronLeft size={18} />
                    </button>
                  )}
                  <button className="btn-cute" onClick={() => { navigator.clipboard.writeText(`"${onlineQuote ? onlineQuote.quote : currentQuoteItem?.quote}"`); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); }}>
                    {isCopied ? <CheckCheck size={16} /> : <Copy size={16} />} {isCopied ? 'Copied!' : 'Copy Quote'}
                  </button>
                  <button className="btn-cute" style={{ background: 'var(--accent-mint)' }} onClick={fetchLiveOnlineQuote}>
                    <RefreshCw size={16} className={fetchingOnline ? "animate-spin" : ""} /> {fetchingOnline ? "Fetching..." : "Fetch Live Quote ✨"}
                  </button>
                  {!onlineQuote && (
                    <button className="btn-cute" style={{ background: 'var(--bg-card-hover)', color: 'var(--text-main)', border: '2px solid var(--border-card)', padding: '0.5rem 0.9rem' }} onClick={() => setQuoteDeckIdx(prev => (prev + 1) % activeDeck.length)}>
                      <ChevronRight size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 8. CURIOSITY SANDBOX */}
          {activeTab === 'sandbox' && (
            <div>
              <h2 style={{ fontSize: '2.4rem', marginBottom: '0.25rem', textAlign: 'center' }}>Curiosity Sandbox 💭</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'center' }}>
                Never break study flow to Google a rabbit-hole. Dump questions here and research them when you have time!
              </p>

              <form onSubmit={handleAddQuestion} className="responsive-form-row" style={{ background: 'var(--bg-card)', border: '2px solid var(--border-card)', borderRadius: 20, padding: '1.25rem', marginBottom: '2rem' }}>
                <input className="input-cute" placeholder="What question just popped into your mind?..." value={newQuestionText} onChange={e => setNewQuestionText(e.target.value)} required />
                <select className="input-cute" style={{ width: '180px' }} value={questionCategory} onChange={e => setQuestionCategory(e.target.value)}>
                  <option value="Brain 🧠">Brain 🧠</option>
                  <option value="Space 🌌">Space 🌌</option>
                  <option value="Money 💰">Money 💰</option>
                  <option value="Philosophy 🌿">Philosophy 🌿</option>
                  <option value="General 💭">General 💭</option>
                </select>
                <button type="submit" className="btn-cute" style={{ whiteSpace: 'nowrap' }}>Dump Question 💭</button>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {questions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 20 }}>No questions dumped yet!</div>
                ) : (
                  questions.map(q => (
                    <div key={q.id} className="question-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-lavender)' }}>{q.category}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span onClick={() => handleToggleQuestionStatus(q)} className="question-status-tag" style={{ background: q.status === 'Solved 💡' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255, 133, 162, 0.15)', color: q.status === 'Solved 💡' ? 'var(--accent-mint)' : 'var(--accent-pink)' }}>
                            {q.status} (Click to toggle)
                          </span>
                          <button onClick={() => handleDeleteQuestion(q.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                        </div>
                      </div>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{q.question}</h4>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 9. VISION BOARD (30 EMOJIS - CLEAN LABEL) */}
          {activeTab === 'vision' && (
            <div>
              <h2 style={{ fontSize: '2.4rem', marginBottom: '0.25rem', textAlign: 'center' }}>Scrapbook Vision Board 🖼️</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'center' }}>
                Pick an icon, pin your life pillars, and stamp them as Manifested ✨!
              </p>

              <form onSubmit={handleAddVision} style={{ background: 'var(--bg-card)', border: '2px solid var(--border-card)', borderRadius: 20, padding: '1.5rem', marginBottom: '2rem' }}>
                <div className="responsive-form-row" style={{ marginBottom: '1rem' }}>
                  <input className="input-cute" placeholder="Goal (e.g. Master Neuroplasticity)..." value={newVisionTitle} onChange={e => setNewVisionTitle(e.target.value)} required />
                  <input className="input-cute" placeholder="Milestone / Description..." value={newVisionGoal} onChange={e => setNewVisionGoal(e.target.value)} />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                    SELECT ICON:
                  </label>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {EMOJI_PALETTE.map(em => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setNewVisionEmoji(em)}
                        style={{
                          background: newVisionEmoji === em ? 'var(--accent-pink)' : 'var(--bg-card-hover)',
                          border: '1px solid var(--border-card)', borderRadius: 10, padding: '0.35rem 0.65rem',
                          fontSize: '1.2rem', cursor: 'pointer'
                        }}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit" className="btn-cute">Pin Vision Card 📌</button>
              </form>

              <div className="vision-board-grid">
                {visions.map(v => (
                  <div key={v.id} className="polaroid-card">
                    <div>
                      <div className="polaroid-photo-box" style={{ background: v.manifested ? 'linear-gradient(135deg, #a8edea, #fed6e3)' : 'var(--bg-card-hover)' }}>{v.emoji}</div>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.35rem' }}>{v.title}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{v.goal}</p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem' }}>
                      <button
                        onClick={() => toggleManifested(v.id)}
                        className="btn-cute"
                        style={{ background: v.manifested ? 'var(--accent-mint)' : 'var(--bg-card-hover)', color: v.manifested ? 'white' : 'var(--text-main)', border: '1px solid var(--border-card)', padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                      >
                        {v.manifested ? "Manifested ✨" : "In Progress 🌱"}
                      </button>
                      <button onClick={() => deleteVision(v.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 10. GARDEN (WITH 5 GENTLE FLOATING SAKURA PETALS!) */}
          {activeTab === 'garden' && (
            <div>
              <h2 style={{ fontSize: '2.4rem', marginBottom: '0.25rem', textAlign: 'center' }}>Your Living Garden 🌱</h2>
              <div className="garden-card">
                {/* 5 Gentle Floating Sakura Petals */}
                <div className="floating-petal" style={{ left: '15%', animationDelay: '0s' }}>🌸</div>
                <div className="floating-petal" style={{ left: '35%', animationDelay: '2s' }}>🌸</div>
                <div className="floating-petal" style={{ left: '55%', animationDelay: '1s' }}>🌸</div>
                <div className="floating-petal" style={{ left: '75%', animationDelay: '3.5s' }}>🌸</div>
                <div className="floating-petal" style={{ left: '90%', animationDelay: '2.5s' }}>🌸</div>

                <div className="plant-display">{garden.icon}</div>
                <h3 style={{ fontSize: '2rem', marginBottom: '0.35rem' }}>{garden.title}</h3>
                <p style={{ color: 'var(--text-muted)' }}>{garden.desc}</p>
                <div className="garden-progress-bar"><div className="garden-progress-fill" style={{ width: `${Math.min(100, (sessions.length / garden.next) * 100)}%` }} /></div>
              </div>
            </div>
          )}

          {/* 11. DAILY QUESTS */}
          {activeTab === 'quests' && (
            <div>
              <h2 style={{ fontSize: '2.4rem', marginBottom: '0.25rem', textAlign: 'center' }}>Daily Quests 🍀</h2>
              <form onSubmit={handleAddQuest} className="responsive-form-row" style={{ marginBottom: '1.5rem' }}>
                <input className="input-cute" placeholder="Write your custom quest..." value={newQuestText} onChange={e => setNewQuestText(e.target.value)} />
                <button type="submit" className="btn-cute" style={{ whiteSpace: 'nowrap' }}>Add Quest</button>
              </form>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {todos.map(t => (
                  <div key={t.id} className={`todo-quest-item ${t.completed ? 'completed' : ''}`}>
                    {editingQuestId === t.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                        <input className="input-cute" style={{ padding: '0.4rem 0.75rem' }} value={editingQuestText} onChange={e => setEditingQuestText(e.target.value)} autoFocus onKeyDown={e => e.key === 'Enter' && saveRenameQuest(t.id)} />
                        <button onClick={() => saveRenameQuest(t.id)} style={{ background: 'var(--accent-mint)', border: 'none', borderRadius: 8, padding: '0.4rem 0.6rem', color: 'white', cursor: 'pointer' }}><Check size={16} /></button>
                        <button onClick={() => setEditingQuestId(null)} style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-card)', borderRadius: 8, padding: '0.4rem 0.6rem', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={16} /></button>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }} onClick={() => handleToggleQuest(t.id)}>
                          <input type="checkbox" checked={t.completed} readOnly />
                          <span style={{ fontWeight: 600 }}>{t.text} {t.completed && <span style={{ color: 'var(--accent-pink)', marginLeft: '0.5rem' }}>🐾 Completed!</span>}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button onClick={() => { setEditingQuestId(t.id); setEditingQuestText(t.text); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Edit3 size={16} /></button>
                          <button onClick={() => handleDeleteQuest(t.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 12. JOURNAL (SEPARATE DIARY FONT AND MOOD STICKER CARDS) */}
          {activeTab === 'journal' && (
            <div>
              <h2 style={{ fontSize: '2.4rem', marginBottom: '0.25rem', textAlign: 'center' }}>Daily Scrapbook Journal 📖</h2>
              <div style={{ background: 'var(--bg-card)', border: '2px solid var(--border-card)', borderRadius: 24, padding: '1.75rem', marginBottom: '2rem' }}>
                <input className="input-cute" placeholder="Title..." value={journalTitle} onChange={e => setJournalTitle(e.target.value)} style={{ marginBottom: '1.25rem' }} />

                {/* 1. SEPARATE DIARY FONT SECTION */}
                <div style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-card)', borderRadius: 16, padding: '0.85rem 1rem', marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                    1. CHOOSE DIARY FONT STYLE:
                  </label>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {JOURNAL_FONTS.map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setSelectedJournalFont(f.id)}
                        style={{
                          background: selectedJournalFont === f.id ? 'var(--accent-pink)' : 'var(--bg-card)',
                          color: selectedJournalFont === f.id ? 'white' : 'var(--text-main)',
                          border: '1px solid var(--border-card)', borderRadius: 8, padding: '0.3rem 0.6rem',
                          fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
                        }}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. SEPARATE MOOD STICKER SECTION */}
                <div style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-card)', borderRadius: 16, padding: '0.85rem 1rem', marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                    2. CHOOSE TODAY'S MOOD STICKER:
                  </label>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {JOURNAL_MOOD_STICKERS.map(s => (
                      <button key={s} type="button" onClick={() => setSelectedMoodSticker(s)} style={{ background: selectedMoodSticker === s ? 'var(--accent-lavender)' : 'var(--bg-card)', color: selectedMoodSticker === s ? 'white' : 'var(--text-main)', border: '1px solid var(--border-card)', borderRadius: 10, padding: '0.35rem 0.75rem', cursor: 'pointer' }}>{s}</button>
                    ))}
                  </div>
                </div>

                {/* Smooth font transition textarea */}
                <textarea
                  className={`input-cute journal-writing-area ${selectedJournalFont}`}
                  rows={4}
                  placeholder="Write freely in your chosen diary font..."
                  value={journalContent}
                  onChange={e => setJournalContent(e.target.value)}
                />
                <button className="btn-cute" onClick={handleSaveJournal} style={{ marginTop: '1rem' }}>Save Memory 🌸</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {journalEntries.map(j => (
                  <div key={j.id} className="journal-scrapbook-card">
                    <div className="washi-tape-pin" />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h4 style={{ fontWeight: 700, fontSize: '1.15rem' }}>{j.title}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {j.mood && <span className="mood-badge-tag">{j.mood}</span>}
                        <button onClick={() => handleDeleteJournal(j.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                    <p className={`journal-writing-area ${j.fontStyle || 'journal-font-cute'}`} style={{ whiteSpace: 'pre-wrap' }}>{j.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}