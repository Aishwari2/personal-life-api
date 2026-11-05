import React, { useEffect, useState, useRef } from 'react';
import {
  Play, Pause, Volume2, Plus, Trash2, Sun, Moon,
  Sparkles, Award, Heart, Check, BookOpen, Clock, Coffee,
  Bell, RotateCcw, BarChart2, ChevronLeft, ChevronRight,
  ExternalLink, Copy, CheckCheck, RefreshCw, Compass, Lightbulb, FileText
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
  created_at: string;
}

interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

const API_BASE = 'http://127.0.0.1:8000';
const LOFI_STREAM = "https://stream.zeno.fm/f3wvbbqmdg8uv";
const PASTEL_BARS = ['#ff85a2', '#b39ddb', '#80cbc4', '#ffe082', '#ffab91', '#90caf9'];

// Themed Quote Decks
const QUOTE_DECKS: Record<string, { quote: string; author: string }[]> = {
  "Philosophy & Stoicism 🌿": [
    { quote: "Dwell on the beauty of life. Watch the stars, and see yourself running with them.", author: "Marcus Aurelius" },
    { quote: "We suffer more often in imagination than in reality.", author: "Seneca" },
    { quote: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche" },
    { quote: "Waste no more time arguing about what a good man should be. Be one.", author: "Marcus Aurelius" },
    { quote: "The key is to keep company only with people who uplift you.", author: "Epictetus" }
  ],
  "Creativity & Art 🎨": [
    { quote: "Have no fear of perfection — you'll never reach it.", author: "Salvador Dalí" },
    { quote: "You can't use up creativity. The more you use, the more you have.", author: "Maya Angelou" },
    { quote: "Creativity takes courage.", author: "Henri Matisse" },
    { quote: "Art enables us to find ourselves and lose ourselves at the same time.", author: "Thomas Merton" }
  ],
  "Deep Focus & Grit 🔥": [
    { quote: "Consistency always beats intensity every single time.", author: "James Clear" },
    { quote: "Small deeds done are better than great deeds planned.", author: "Peter Marshall" },
    { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { quote: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" }
  ],
  "Cozy Peace & Solitude ☕": [
    { quote: "You do not have to be good. You only have to let the soft animal of your body love what it loves.", author: "Mary Oliver" },
    { quote: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott" },
    { quote: "In the depth of winter, I finally learned that within me there lay an invincible summer.", author: "Albert Camus" },
    { quote: "There is no friend as loyal as a book.", author: "Ernest Hemingway" }
  ]
};

// Daily Concepts ("Learn Something New Every Day")
const DAILY_DISCOVERIES = [
  {
    title: "The Feynman Technique",
    category: "Learning Science",
    icon: "🧠",
    summary: "The ultimate test of understanding: try to explain a complex topic in simple language as if you are teaching an 8-year-old. Wherever you get stuck, that is where your gap in understanding lies!"
  },
  {
    title: "The Pareto Principle (80/20 Rule)",
    category: "Productivity",
    icon: "⚖️",
    summary: "In almost any field, roughly 80% of your results come from 20% of your efforts. Identify the 20% of skills or habits that give you the highest growth and double down on them."
  },
  {
    title: "Neuroplasticity",
    category: "Biology & Mind",
    icon: "🌱",
    summary: "Your brain is not fixed. Every single time you practice a difficult concept or problem, physical neural pathways thicken and forge new connections. Effort physically reorganizes your brain."
  },
  {
    title: "Kaizen (Continuous Improvement)",
    category: "Japanese Philosophy",
    icon: "🌸",
    summary: "The art of getting just 1% better every day. Small, gradual improvements compound exponentially over months and years without ever causing burnout."
  }
];

// Curated Free Classics with Free Online Readers & Free PDFs
const FREE_BOOK_LIBRARY = [
  { title: "The Little Prince", author: "Saint-Exupéry", category: "Philosophy", desc: "A poetic journey exploring what is truly invisible to the eye.", format: "Free PDF & Web", link: "https://gutenberg.org" },
  { title: "Meditations", author: "Marcus Aurelius", category: "Mindset", desc: "Private emperor reflections on calm, discipline, and nature.", format: "Free EPUB & Web", link: "https://standardebooks.org/ebooks/marcus-aurelius/meditations" },
  { title: "Letters to a Young Poet", author: "Rilke", category: "Art & Poetry", desc: "Ten timeless letters on loneliness, patience, and craft.", format: "Free Web Reader", link: "https://gutenberg.org" },
  { title: "Frankenstein", author: "Mary Shelley", category: "Sci-Fi", desc: "The foundational classic of science and human creation.", format: "Free PDF & Web", link: "https://standardebooks.org/ebooks/mary-shelley/frankenstein" },
  { title: "The Prophet", author: "Kahlil Gibran", category: "Wisdom", desc: "Poetic reflections on love, work, pain, and joy.", format: "Free EPUB & Web", link: "https://standardebooks.org/ebooks/kahlil-gibran/the-prophet" },
  { title: "Walden", author: "Henry David Thoreau", category: "Nature", desc: "A manifesto on deliberate, simple living in nature.", format: "Free PDF & Web", link: "https://standardebooks.org/ebooks/henry-david-thoreau/walden" },
  { title: "Alice in Wonderland", author: "Lewis Carroll", category: "Classics", desc: "The whimsical adventure into absurdity and childhood.", format: "Free Web Reader", link: "https://standardebooks.org/ebooks/lewis-carroll/alices-adventures-in-wonderland" },
  { title: "The Art of War", author: "Sun Tzu", category: "Strategy", desc: "Timeless ancient wisdom on conflict and self-mastery.", format: "Free PDF & Web", link: "https://standardebooks.org/ebooks/sun-tzu/the-art-of-war" }
];

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [activeTab, setActiveTab] = useState<'timer' | 'reading' | 'garden' | 'quests' | 'achievements' | 'journal'>('timer');

  // Backend Data
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [topicStats, setTopicStats] = useState<{ topic: string; minutes: number }[]>([]);

  // Lofi Audio
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Quote Decks State
  const themeKeys = Object.keys(QUOTE_DECKS);
  const [selectedTheme, setSelectedTheme] = useState(themeKeys[0]);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  // Online API Quote State
  const [onlineQuote, setOnlineQuote] = useState<{ quote: string; author: string } | null>(null);
  const [fetchingOnline, setFetchingOnline] = useState(false);

  // Automatically picks today's concept based on the calendar day of the month!
  const [discoveryIndex, setDiscoveryIndex] = useState(() => new Date().getDate() % DAILY_DISCOVERIES.length);

  // Timer State
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerTopic, setTimerTopic] = useState('');
  const [timerActivity, setTimerActivity] = useState('');
  const [notificationsAllowed, setNotificationsAllowed] = useState(false);

  // Forms
  const [newQuestText, setNewQuestText] = useState('');
  const [journalTitle, setJournalTitle] = useState('');
  const [journalContent, setJournalContent] = useState('');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Fetch Live Quotes from an Open Web API
  const fetchLiveOnlineQuote = async () => {
    setFetchingOnline(true);
    try {
      // Fallback-safe open quote API
      const res = await fetch("https://dummyjson.com/quotes/random");
      const data = await res.json();
      setOnlineQuote({ quote: data.quote, author: data.author });
    } catch (err) {
      setOnlineQuote({ quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" });
    } finally {
      setFetchingOnline(false);
    }
  };

  // Stopwatch interval counter
  useEffect(() => {
    let interval: any = null;
    if (timerRunning) {
      interval = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTimer = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Fetch all backend data
  const fetchData = async () => {
    try {
      const [sessRes, todosRes, topicsRes, jourRes] = await Promise.all([
        fetch(`${API_BASE}/learning-sessions`),
        fetch(`${API_BASE}/todos`),
        fetch(`${API_BASE}/analytics/topics`),
        fetch(`${API_BASE}/journal`),
      ]);
      setSessions(await sessRes.json());
      setTodos(await todosRes.json());
      setTopicStats(await topicsRes.json());
      setJournalEntries(await jourRes.json());
    } catch (e) {
      console.error('Error fetching data:', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(e => console.error(e));
      setIsPlaying(true);
    }
  };

  // Copy Quote Handler
  const handleCopy = (text: string, author: string) => {
    navigator.clipboard.writeText(`"${text}" — ${author}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Stop Timer & Auto-Record
  const handleStopAndSaveTimer = async () => {
    setTimerRunning(false);
    const mins = Math.max(1, Math.round(timerSeconds / 60));

    await fetch(`${API_BASE}/learning-sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: timerTopic || 'Focus Flow',
        activity: timerActivity || 'Timer study session',
        duration_minutes: mins,
        mood: 'Accomplished ✨',
        completed: true,
      }),
    });

    setTimerSeconds(0);
    setTimerTopic('');
    setTimerActivity('');
    fetchData();
    setActiveTab('garden');
  };

  // Quests
  const handleAddQuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestText) return;
    await fetch(`${API_BASE}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newQuestText }),
    });
    setNewQuestText('');
    fetchData();
  };

  const handleToggleQuest = async (id: number) => {
    await fetch(`${API_BASE}/todos/${id}/toggle`, { method: 'PUT' });
    fetchData();
  };

  const handleDeleteQuest = async (id: number) => {
    await fetch(`${API_BASE}/todos/${id}`, { method: 'DELETE' });
    fetchData();
  };

  // Journal
  const handleSaveJournal = async () => {
    if (!journalContent) return;
    await fetch(`${API_BASE}/journal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: journalTitle || 'Daily Reflection',
        content: journalContent,
        mood: 'Cozy ☕',
      }),
    });
    setJournalTitle('');
    setJournalContent('');
    fetchData();
  };

  // Exports
  const handleExportJSON = async () => {
    const res = await fetch(`${API_BASE}/backup/export`);
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `little-life-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleExportCSV = () => {
    if (sessions.length === 0) {
      alert("No sessions logged yet!");
      return;
    }
    const headers = ["ID", "Topic", "Activity", "Duration_Minutes", "Session_Date", "Mood"];
    const rows = sessions.map(s => [s.id, `"${s.topic}"`, `"${s.activity}"`, s.duration_minutes, s.session_date, `"${s.mood || 'Focused'}"`]);
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `little-life-sessions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // Garden Stage
  function getGardenStage() {
    const count = sessions.length;
    if (count === 0) return { icon: '🌰', title: 'Little Acorn', next: 1, desc: 'Plant your first study session to watch it germinate!' };
    if (count < 3) return { icon: '🌱', title: 'Curious Sprout', next: 3, desc: 'The first green leaves appear in the gentle morning light.' };
    if (count < 7) return { icon: '🌿', title: 'Flourishing Fern', next: 7, desc: 'Stems are growing strong with consistent study habits.' };
    if (count < 12) return { icon: '🌷', title: 'Blooming Tulip', next: 12, desc: 'Color fills your garden! Real skills are flourishing.' };
    if (count < 20) return { icon: '🪴', title: 'Zen Bonsai Tree', next: 20, desc: 'Disciplined, graceful, and deeply rooted in practice.' };
    if (count < 35) return { icon: '🌸', title: 'Ancient Sakura Blossom', next: 35, desc: 'A breathtaking tree raining fragrant pink petals.' };
    return { icon: '🌌', title: 'Celestial Spirit Forest', next: 50, desc: 'A mystical sanctuary of timeless wisdom and mastery.' };
  }

  const garden = getGardenStage();
  const totalHours = (sessions.reduce((acc, s) => acc + s.duration_minutes, 0) / 60).toFixed(1);

  // Active Quote in current deck
  const activeDeck = QUOTE_DECKS[selectedTheme] || [];
  const currentQuoteItem = activeDeck[quoteIndex % activeDeck.length];
  const currentDiscovery = DAILY_DISCOVERIES[discoveryIndex % DAILY_DISCOVERIES.length];

  return (
    <div className="little-life-shell">
      <audio ref={audioRef} src={LOFI_STREAM} preload="none" />

      {/* ===================================================================== */}
      {/* SIDEBAR                                                               */}
      {/* ===================================================================== */}
      <aside className="scrapbook-sidebar">
        <div>
          {/* Mochi Cat */}
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
              {timerRunning
                ? "Shh... Deep focus mode active! 🎧✨"
                : "Explore our library or read today's discovery! 📖🌱"}
            </div>
          </div>

          {/* Lofi Radio */}
          <div className="lofi-widget">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>Cozy Radio ☕</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isPlaying ? '● Live Beats' : 'Paused'}</p>
              </div>
              <button
                onClick={toggleAudio}
                style={{
                  background: 'var(--accent-pink)', border: 'none', width: 40, height: 40,
                  borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer'
                }}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: 2 }} />}
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{ background: 'var(--bg-card)', border: '2px solid var(--border-card)', borderRadius: 18, padding: '1rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Invested Time:</span>
              <strong>{totalHours} hrs</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Garden Stage:</span>
              <strong>{garden.title}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Sessions:</span>
              <strong>{sessions.length}</strong>
            </div>
          </div>

          {/* Data Exports */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1rem' }}>
            <button
              onClick={handleExportJSON}
              style={{
                background: 'var(--bg-card)', border: '2px dashed var(--border-card)',
                borderRadius: 10, padding: '0.5rem', fontSize: '0.75rem', fontWeight: 700,
                cursor: 'pointer', color: 'var(--text-main)'
              }}
            >
              📥 JSON Backup
            </button>
            <button
              onClick={handleExportCSV}
              style={{
                background: 'var(--bg-card)', border: '2px dashed var(--border-card)',
                borderRadius: 10, padding: '0.5rem', fontSize: '0.75rem', fontWeight: 700,
                cursor: 'pointer', color: 'var(--accent-mint)'
              }}
            >
              📊 Excel CSV
            </button>
          </div>
        </div>

        {/* Theme Switcher */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          style={{
            background: 'var(--bg-card)', border: '2px solid var(--border-card)',
            padding: '0.6rem', borderRadius: 999, cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600,
            fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '1.25rem'
          }}
        >
          {theme === 'dark' ? <Sun size={15} color="#ffd54f" /> : <Moon size={15} color="#b39ddb" />}
          {theme === 'dark' ? 'Cream Paper' : 'Midnight Scrapbook'}
        </button>
      </aside>

      {/* ===================================================================== */}
      {/* MAIN CANVAS                                                           */}
      {/* ===================================================================== */}
      <main className="scrapbook-canvas">

        {/* 6 JELLY PORTALS */}
        <nav className="jelly-row">
          <button className={`jelly-btn ${activeTab === 'timer' ? 'active' : ''}`} onClick={() => setActiveTab('timer')}>
            <div className="jelly-sticker jelly-peach">⏱️</div>
            <span className="jelly-label">Focus Timer</span>
          </button>

          <button className={`jelly-btn ${activeTab === 'reading' ? 'active' : ''}`} onClick={() => setActiveTab('reading')}>
            <div className="jelly-sticker jelly-butter">📚</div>
            <span className="jelly-label">Library & Wisdom</span>
          </button>

          <button className={`jelly-btn ${activeTab === 'garden' ? 'active' : ''}`} onClick={() => setActiveTab('garden')}>
            <div className="jelly-sticker jelly-mint">🌱</div>
            <span className="jelly-label">Garden</span>
          </button>

          <button className={`jelly-btn ${activeTab === 'quests' ? 'active' : ''}`} onClick={() => setActiveTab('quests')}>
            <div className="jelly-sticker jelly-lavender">🍀</div>
            <span className="jelly-label">Quests</span>
          </button>

          <button className={`jelly-btn ${activeTab === 'achievements' ? 'active' : ''}`} onClick={() => setActiveTab('achievements')}>
            <div className="jelly-sticker jelly-pink">🏆</div>
            <span className="jelly-label">Achievements</span>
          </button>

          <button className={`jelly-btn ${activeTab === 'journal' ? 'active' : ''}`} onClick={() => setActiveTab('journal')}>
            <div className="jelly-sticker jelly-grape">📖</div>
            <span className="jelly-label">Journal</span>
          </button>
        </nav>

        {/* =================================================================== */}
        {/* 1. LIBRARY, THEMED QUOTE DECKS & DAILY DISCOVERY                    */}
        {/* =================================================================== */}
        {activeTab === 'reading' && (
          <div style={{ maxWidth: 840, margin: '0 auto', width: '100%' }}>
            <h2 style={{ fontSize: '2.4rem', marginBottom: '0.25rem' }}>The Reading Sanctuary & Wisdom 📚</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Select a quote theme, fetch live quotes from the web, or read today's concept discovery.
            </p>

            {/* A. Theme Selector Cards */}
            <div className="theme-selector-grid">
              {themeKeys.map((themeName) => (
                <button
                  key={themeName}
                  className={`theme-card-btn ${selectedTheme === themeName ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedTheme(themeName);
                    setQuoteIndex(0);
                    setOnlineQuote(null);
                  }}
                >
                  <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{themeName}</p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {QUOTE_DECKS[themeName].length} curated quotes
                  </span>
                </button>
              ))}
            </div>

            {/* B. The Clean Quote Reader Deck */}
            <div className="quote-deck-card">
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-pink)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {onlineQuote ? "Live Web Stream ✨" : selectedTheme}
              </span>

              <p className="quote-deck-text">
                "{onlineQuote ? onlineQuote.quote : currentQuoteItem?.quote}"
              </p>
              <p className="quote-deck-author">
                — {onlineQuote ? onlineQuote.author : currentQuoteItem?.author}
              </p>

              {/* Reader Controls */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
                {!onlineQuote && (
                  <button
                    className="btn-cute"
                    style={{ background: 'var(--bg-card-hover)', color: 'var(--text-main)', border: '2px solid var(--border-card)', padding: '0.6rem 1rem' }}
                    onClick={() => setQuoteIndex(prev => (prev === 0 ? activeDeck.length - 1 : prev - 1))}
                  >
                    <ChevronLeft size={18} />
                  </button>
                )}

                <button
                  className="btn-cute"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem' }}
                  onClick={() => handleCopy(
                    onlineQuote ? onlineQuote.quote : currentQuoteItem?.quote,
                    onlineQuote ? onlineQuote.author : currentQuoteItem?.author
                  )}
                >
                  {isCopied ? <CheckCheck size={16} /> : <Copy size={16} />}
                  {isCopied ? 'Copied to Clipboard!' : 'Copy Quote'}
                </button>

                {/* Fetch Live Online Quote Button */}
                <button
                  className="btn-cute"
                  style={{ background: 'var(--accent-mint)', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem' }}
                  onClick={fetchLiveOnlineQuote}
                >
                  <RefreshCw size={16} className={fetchingOnline ? "animate-spin" : ""} />
                  {fetchingOnline ? "Fetching..." : "Fetch Live Quote ✨"}
                </button>

                {!onlineQuote && (
                  <button
                    className="btn-cute"
                    style={{ background: 'var(--bg-card-hover)', color: 'var(--text-main)', border: '2px solid var(--border-card)', padding: '0.6rem 1rem' }}
                    onClick={() => setQuoteIndex(prev => (prev + 1) % activeDeck.length)}
                  >
                    <ChevronRight size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* C. Daily Topic Discovery ("Learn Something New") */}
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Today's Concept Discovery 🌱</h3>
            <div className="discovery-card">
              <div className="discovery-icon">{currentDiscovery.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-mint)', textTransform: 'uppercase' }}>
                    {currentDiscovery.category}
                  </span>
                  <button
                    onClick={() => setDiscoveryIndex(prev => (prev + 1) % DAILY_DISCOVERIES.length)}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-pink)', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}
                  >
                    Next Concept ➔
                  </button>
                </div>
                <h4 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{currentDiscovery.title}</h4>
                <p style={{ color: 'var(--text-main)', lineHeight: 1.6, marginTop: '0.4rem', fontSize: '0.95rem' }}>
                  {currentDiscovery.summary}
                </p>
              </div>
            </div>

            {/* D. Free Books & PDF Vault */}
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Free Public Domain Books & PDFs 📖</h3>
            <div className="book-shelf-grid">
              {FREE_BOOK_LIBRARY.map((book, idx) => (
                <div key={idx} className="book-card">
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-pink)' }}>{book.category}</span>
                      <span className="badge-pdf">{book.format}</span>
                    </div>
                    <h4 style={{ fontWeight: 700, fontSize: '1.15rem' }}>{book.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>{book.author}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: 1.4 }}>{book.desc}</p>
                  </div>
                  <a
                    href={book.link}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                      fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-mint)',
                      textDecoration: 'none', marginTop: '1.25rem'
                    }}
                  >
                    Open Free Edition <ExternalLink size={13} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* 2. FOCUS TIMER                                                      */}
        {/* =================================================================== */}
        {activeTab === 'timer' && (
          <div style={{ maxWidth: 780, margin: '0 auto', width: '100%' }}>
            <h2 style={{ fontSize: '2.4rem', marginBottom: '0.25rem' }}>Focus Stopwatch ⏱️</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Study as long as you want! Whether it is 13 minutes or 2 hours, it records the exact time.
            </p>

            <div className="stopwatch-hero">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', maxWidth: 520, margin: '0 auto 1.5rem auto' }}>
                <input
                  className="input-cute"
                  placeholder="Subject (e.g. Python, Literature)..."
                  value={timerTopic}
                  onChange={e => setTimerTopic(e.target.value)}
                />
                <input
                  className="input-cute"
                  placeholder="Task (e.g. Reading chapter 4)..."
                  value={timerActivity}
                  onChange={e => setTimerActivity(e.target.value)}
                />
              </div>

              <div className="stopwatch-digits">{formatTimer(timerSeconds)}</div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                {!timerRunning ? (
                  <button
                    className="btn-cute"
                    onClick={() => setTimerRunning(true)}
                    style={{ background: 'var(--accent-mint)', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2rem', fontSize: '1.1rem' }}
                  >
                    <Play size={20} fill="white" /> Start Studying
                  </button>
                ) : (
                  <button
                    className="btn-cute"
                    onClick={handleStopAndSaveTimer}
                    style={{ background: 'var(--accent-pink)', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2rem', fontSize: '1.1rem' }}
                  >
                    <Pause size={20} fill="white" /> Finish & Water Garden 🌱
                  </button>
                )}

                {timerSeconds > 0 && !timerRunning && (
                  <button
                    onClick={() => setTimerSeconds(0)}
                    style={{ background: 'var(--bg-card-hover)', border: '2px solid var(--border-card)', borderRadius: 14, padding: '0 1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    <RotateCcw size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* 3. ACTIVITY GARDEN                                                  */}
        {/* =================================================================== */}
        {activeTab === 'garden' && (
          <div style={{ maxWidth: 820, margin: '0 auto', width: '100%' }}>
            <h2 style={{ fontSize: '2.4rem', marginBottom: '0.25rem' }}>Your Living Garden 🌱</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Your digital ecosystem grows with each verified study session.
            </p>

            <div className="floating-petal" style={{ left: '25%' }}>🌸</div>
            <div className="floating-petal" style={{ left: '55%', animationDelay: '2s' }}>🌸</div>
            <div className="floating-petal" style={{ left: '75%', animationDelay: '4s' }}>🌸</div>

            <div className="garden-card">
              <div className="plant-display">{garden.icon}</div>
              <h3 style={{ fontSize: '2rem', marginBottom: '0.35rem' }}>{garden.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>{garden.desc}</p>

              <div className="garden-progress-bar">
                <div className="garden-progress-fill" style={{ width: `${Math.min(100, (sessions.length / garden.next) * 100)}%` }} />
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                {sessions.length} / {garden.next} sessions to evolve to the next stage ✨
              </p>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '2px solid var(--border-card)', borderRadius: 28, padding: '2rem', boxShadow: 'var(--shadow-cozy)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <BarChart2 size={20} color="var(--accent-pink)" />
                <h3 style={{ fontSize: '1.3rem' }}>Topic Time Distribution (Minutes)</h3>
              </div>

              {topicStats.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No topic metrics recorded yet. Use the timer above!
                </div>
              ) : (
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topicStats}>
                      <XAxis dataKey="topic" stroke="var(--text-muted)" fontSize={12} />
                      <YAxis stroke="var(--text-muted)" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--bg-card)',
                          borderColor: 'var(--border-card)',
                          borderRadius: 14
                        }}
                      />
                      <Bar dataKey="minutes" radius={[10, 10, 0, 0]}>
                        {topicStats.map((_, i) => (
                          <Cell key={i} fill={PASTEL_BARS[i % PASTEL_BARS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* 4. DAILY QUESTS                                                     */}
        {/* =================================================================== */}
        {activeTab === 'quests' && (
          <div style={{ maxWidth: 820, margin: '0 auto', width: '100%' }}>
            <h2 style={{ fontSize: '2.4rem', marginBottom: '0.25rem' }}>Daily Quests 🍀</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Create and check off your personal daily goals.</p>

            <form onSubmit={handleAddQuest} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <input
                className="input-cute"
                placeholder="Write your custom quest (e.g. Read 15 mins, code a feature)..."
                value={newQuestText}
                onChange={e => setNewQuestText(e.target.value)}
              />
              <button type="submit" className="btn-cute" style={{ whiteSpace: 'nowrap' }}>Add Quest</button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {todos.map(t => (
                <div key={t.id} className={`todo-quest-item ${t.completed ? 'completed' : ''}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} onClick={() => handleToggleQuest(t.id)}>
                    <input type="checkbox" checked={t.completed} readOnly />
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{t.text}</span>
                  </div>
                  <button onClick={() => handleDeleteQuest(t.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* 5. ACHIEVEMENTS CABINET                                             */}
        {/* =================================================================== */}
        {activeTab === 'achievements' && (
          <div style={{ maxWidth: 820, margin: '0 auto', width: '100%' }}>
            <h2 style={{ fontSize: '2.4rem', marginBottom: '0.25rem' }}>Achievement Cabinet 🏆</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Each badge carries words of encouragement and proves your real growth.
            </p>

            <div className="badges-grid">
              {[
                { id: 1, title: 'First Step', icon: '🐾', quote: 'A journey of a thousand miles begins with a single step.', desc: 'Log 1 learning session', unlocked: sessions.length >= 1 },
                { id: 2, title: 'Green Thumb', icon: '🌱', quote: 'Small seeds grow into mighty trees.', desc: 'Sprout your garden (2+ sessions)', unlocked: sessions.length >= 2 },
                { id: 3, title: 'Curious Cat', icon: '🐱', quote: 'Curiosity is the spark of genius.', desc: 'Study 3 distinct topics', unlocked: topicStats.length >= 3 },
                { id: 4, title: 'Flow State', icon: '🌊', quote: 'Time disappears when you love what you learn.', desc: 'Log a session of 45+ minutes', unlocked: sessions.some(s => s.duration_minutes >= 45) },
                { id: 5, title: 'Deep Roots', icon: '🌿', quote: 'Consistency always beats intensity.', desc: 'Log 5 total sessions', unlocked: sessions.length >= 5 },
                { id: 6, title: 'In Full Bloom', icon: '🌷', quote: 'Bloom where you are planted.', desc: 'Reach 10 sessions in your garden', unlocked: sessions.length >= 10 }
              ].map(a => (
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

        {/* =================================================================== */}
        {/* 6. SCRAPBOOK JOURNAL                                                */}
        {/* =================================================================== */}
        {activeTab === 'journal' && (
          <div style={{ maxWidth: 820, margin: '0 auto', width: '100%' }}>
            <h2 style={{ fontSize: '2.4rem', marginBottom: '0.25rem' }}>Daily Scrapbook Journal 📖</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Reflections, thoughts, and discoveries.</p>

            <div style={{ background: 'var(--bg-card)', border: '2px solid var(--border-card)', borderRadius: 24, padding: '1.75rem', boxShadow: 'var(--shadow-cozy)', marginBottom: '2rem' }}>
              <input
                className="input-cute"
                placeholder="Title of this memory..."
                value={journalTitle}
                onChange={e => setJournalTitle(e.target.value)}
                style={{ marginBottom: '1rem', fontWeight: 700 }}
              />
              <textarea
                className="input-cute"
                rows={4}
                placeholder="What was on your mind today? Write freely..."
                value={journalContent}
                onChange={e => setJournalContent(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button className="btn-cute" onClick={handleSaveJournal}>Save Entry 🌸</button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {journalEntries.map(entry => (
                <div key={entry.id} style={{ background: 'var(--bg-card)', border: '2px solid var(--border-card)', borderRadius: 18, padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontWeight: 700 }}>{entry.title}</h4>
                    <button
                      onClick={async () => { await fetch(`${API_BASE}/journal/${entry.id}`, { method: 'DELETE' }); fetchData(); }}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <p style={{ fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{entry.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}