import React, { useEffect, useState, useRef } from 'react';
import {
  Play, Pause, Trash2, Sun, Moon,
  Check, RotateCcw, BarChart2, ChevronLeft, ChevronRight,
  ExternalLink, Copy, CheckCheck, RefreshCw,
  Edit3, X, Sparkles, Lightbulb, Compass, Heart, HelpCircle
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

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const LOFI_STREAM = "https://stream.zeno.fm/f3wvbbqmdg8uv";
const PASTEL_BARS = ['#ff85a2', '#b39ddb', '#80cbc4', '#ffe082', '#ffab91', '#90caf9'];

const JOURNAL_MOOD_STICKERS = ["🌸 Joyful", "☕ Cozy", "🌙 Midnight", "💡 Eureka!", "🌱 Growing", "🧘 Serene"];

// Study Techniques with Auto-Timer Configurations
const STUDY_TECHNIQUES = [
  {
    title: "The Feynman Technique",
    desc: "Explain the concept in plain English as if teaching a child. Identify exactly where your explanation stumbles.",
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
    title: "The Deep Focus Ultradian Block",
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

// Aesthetic Scrapbook Vision Board Pillars
const VISION_PILLARS = [
  { title: "Neuroscience & Mind", emoji: "🧠", color: "linear-gradient(135deg, #a8edea, #fed6e3)", goal: "Understand neural plasticity, cognitive models, and human behavior." },
  { title: "Cosmos & Astrophysics", emoji: "🌌", color: "linear-gradient(135deg, #c471ed, #f64f59)", goal: "Explore spacetime curvature, quantum gravity, and stellar evolution." },
  { title: "Financial Independence", emoji: "💰", color: "linear-gradient(135deg, #ffe259, #ffa751)", goal: "Master cash-flow mechanics, compounding capital, and wealth architecture." },
  { title: "Creative Software Craft", emoji: "🎨", color: "linear-gradient(135deg, #ff9a9e, #fecfef)", goal: "Build digital software tools that delight the human soul." }
];

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [activeTab, setActiveTab] = useState<'timer' | 'sandbox' | 'vision' | 'techniques' | 'calendar' | 'library' | 'quotes' | 'garden' | 'quests' | 'journal'>('timer');

  // Backend Data
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [questions, setQuestions] = useState<CuriosityQuestion[]>([]);
  const [topicStats, setTopicStats] = useState<{ topic: string; minutes: number }[]>([]);

  // Lofi Audio
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Notifications Toggle
  const [alertsEnabled, setAlertsEnabled] = useState(() => localStorage.getItem('alertsEnabled') === 'true');

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

  // Curiosity Question State
  const [newQuestionText, setNewQuestionText] = useState('');
  const [questionCategory, setQuestionCategory] = useState('Brain 🧠');

  // Online Quote / Fact State
  const [onlineFact, setOnlineFact] = useState<string | null>(null);
  const [fetchingFact, setFetchingFact] = useState(false);

  // Calendar State
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(now.toISOString().slice(0, 10));

  // Quests & Journal
  const [newQuestText, setNewQuestText] = useState('');
  const [editingQuestId, setEditingQuestId] = useState<number | null>(null);
  const [editingQuestText, setEditingQuestText] = useState('');
  const [journalTitle, setJournalTitle] = useState('');
  const [journalContent, setJournalContent] = useState('');
  const [selectedMoodSticker, setSelectedMoodSticker] = useState(JOURNAL_MOOD_STICKERS[0]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Fetch all backend data
  const fetchData = async () => {
    try {
      const [sessRes, todosRes, topicsRes, jourRes, questRes] = await Promise.all([
        fetch(`${API_BASE}/learning-sessions`),
        fetch(`${API_BASE}/todos`),
        fetch(`${API_BASE}/analytics/topics`),
        fetch(`${API_BASE}/journal`),
        fetch(`${API_BASE}/questions`),
      ]);
      setSessions(await sessRes.json());
      setTodos(await todosRes.json());
      setTopicStats(await topicsRes.json());
      setJournalEntries(await jourRes.json());
      setQuestions(await questRes.json());
    } catch (e) {
      console.error('API connection error:', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch Fresh Internet Fact
  const fetchInternetFact = async () => {
    setFetchingFact(true);
    try {
      const res = await fetch("https://uselessfacts.jsph.pl/api/v2/facts/random?language=en");
      const data = await res.json();
      setOnlineFact(data.text);
    } catch (e) {
      setOnlineFact("The human brain generates about 23 watts of electrical power — enough to power a small lightbulb!");
    } finally {
      setFetchingFact(false);
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
    setReviewTopic(timerTopic || 'Curiosity Exploration');
    setReviewActivity(timerActivity || 'Deep learning session');
    setReviewMinutes(elapsedMins);
    setShowReviewModal(true);
  };

  const handleSaveReviewedSession = async () => {
    await fetch(`${API_BASE}/learning-sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: reviewTopic,
        activity: reviewActivity,
        duration_minutes: Number(reviewMinutes),
        mood: reviewMood,
        completed: true,
      }),
    });
    setShowReviewModal(false);
    setTimerSeconds(timerMode === 'pomodoro' ? pomodoroTargetMins * 60 : 0);
    setTimerTopic('');
    setTimerActivity('');
    fetchData();
    setActiveTab('garden');
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

  // Curiosity Question Handlers
  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText) return;
    await fetch(`${API_BASE}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: newQuestionText, category: questionCategory }),
    });
    setNewQuestionText('');
    fetchData();
  };

  const handleToggleQuestionStatus = async (q: CuriosityQuestion) => {
    const newStatus = q.status === "Unexplored 💭" ? "Solved 💡" : "Unexplored 💭";
    await fetch(`${API_BASE}/questions/${q.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchData();
  };

  const handleDeleteQuestion = async (id: number) => {
    await fetch(`${API_BASE}/questions/${id}`, { method: 'DELETE' });
    fetchData();
  };

  // Quests & Journal
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

  const handleSaveJournal = async () => {
    if (!journalContent) return;
    await fetch(`${API_BASE}/journal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: journalTitle || 'Daily Scrapbook Memory',
        content: journalContent,
        mood: selectedMoodSticker,
      }),
    });
    setJournalTitle('');
    setJournalContent('');
    fetchData();
  };

  // Garden progression
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

  // Calendar calculations
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();
  const monthName = new Date(calYear, calMonth).toLocaleString('default', { month: 'long' });
  const sessionsOnDate = sessions.filter(s => s.session_date === selectedDate);
  const journalOnDate = journalEntries.filter(j => j.created_at.slice(0, 10) === selectedDate);

  return (
    <div className="little-life-shell">
      <audio ref={audioRef} src={LOFI_STREAM} preload="none" />

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
                <input type="number" className="input-cute" value={reviewMinutes} onChange={e => setReviewMinutes(Number(e.target.value))} />
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

      {/* ===================================================================== */}
      {/* SIDEBAR                                                               */}
      {/* ===================================================================== */}
      <aside className="scrapbook-sidebar">
        <div>
          {/* Mochi Cat Mascot */}
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
              {timerRunning ? "Shh... Deep focus mode active! 🎧✨" : "Dump a curious question or check your vision board! 💭"}
            </div>
          </div>

          {/* Lofi Radio */}
          <div className="lofi-widget">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>Cozy Radio ☕</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isPlaying ? '● Live Beats' : 'Paused'}</p>
              </div>
              <button onClick={() => {
                if (!audioRef.current) return;
                if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
                else { audioRef.current.play().catch(e => console.error(e)); setIsPlaying(true); }
              }} style={{ background: 'var(--accent-pink)', border: 'none', width: 40, height: 40, borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
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
              <span style={{ color: 'var(--text-muted)' }}>Curious Questions:</span>
              <strong>{questions.length}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Garden Stage:</span>
              <strong>{garden.title}</strong>
            </div>
          </div>
        </div>

        {/* Theme Switcher */}
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ background: 'var(--bg-card)', border: '2px solid var(--border-card)', padding: '0.6rem', borderRadius: 999, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '1.25rem' }}>
          {theme === 'dark' ? <Sun size={15} color="#ffd54f" /> : <Moon size={15} color="#b39ddb" />}
          {theme === 'dark' ? 'Cream Paper' : 'Midnight Scrapbook'}
        </button>
      </aside>

      {/* ===================================================================== */}
      {/* MAIN CANVAS: ALL PORTALS                                              */}
      {/* ===================================================================== */}
      <main className="scrapbook-canvas">

        {/* JELLY PORTALS NAVIGATION */}
        <nav className="jelly-row">
          <button className={`jelly-btn ${activeTab === 'timer' ? 'active' : ''}`} onClick={() => setActiveTab('timer')}>
            <div className="jelly-sticker jelly-peach">⏱️</div>
            <span className="jelly-label">Focus</span>
          </button>

          <button className={`jelly-btn ${activeTab === 'sandbox' ? 'active' : ''}`} onClick={() => setActiveTab('sandbox')}>
            <div className="jelly-sticker jelly-mint">💭</div>
            <span className="jelly-label">Curiosity Dump</span>
          </button>

          <button className={`jelly-btn ${activeTab === 'vision' ? 'active' : ''}`} onClick={() => setActiveTab('vision')}>
            <div className="jelly-sticker jelly-pink">🖼️</div>
            <span className="jelly-label">Vision Board</span>
          </button>

          <button className={`jelly-btn ${activeTab === 'techniques' ? 'active' : ''}`} onClick={() => setActiveTab('techniques')}>
            <div className="jelly-sticker jelly-butter">🧠</div>
            <span className="jelly-label">Techniques</span>
          </button>

          <button className={`jelly-btn ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>
            <div className="jelly-sticker jelly-lavender">📅</div>
            <span className="jelly-label">Calendar</span>
          </button>

          <button className={`jelly-btn ${activeTab === 'library' ? 'active' : ''}`} onClick={() => setActiveTab('library')}>
            <div className="jelly-sticker jelly-pink">📚</div>
            <span className="jelly-label">Books</span>
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

        {/* 1. FOCUS TIMER */}
        {activeTab === 'timer' && (
          <div style={{ maxWidth: 820, margin: '0 auto', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <button className={`timer-mode-pill ${timerMode === 'stopwatch' ? 'active' : ''}`} onClick={() => { setTimerMode('stopwatch'); setTimerRunning(false); setTimerSeconds(0); }}>⏱️ Open Stopwatch</button>
              <button className={`timer-mode-pill ${timerMode === 'pomodoro' ? 'active' : ''}`} onClick={() => { setTimerMode('pomodoro'); setPomodoroTargetMins(25); setTimerSeconds(25 * 60); setTimerRunning(false); }}>⏳ Pomodoro</button>
            </div>

            {timerMode === 'pomodoro' && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {[15, 25, 45, 60, 90].map(mins => (
                  <button key={mins} className={`pomodoro-chip ${pomodoroTargetMins === mins ? 'selected' : ''}`} onClick={() => { setPomodoroTargetMins(mins); setTimerSeconds(mins * 60); setTimerRunning(false); }}>{mins}m</button>
                ))}
              </div>
            )}

            <div className="stopwatch-hero">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', maxWidth: 520, margin: '0 auto 1rem auto' }}>
                <input className="input-cute" placeholder="Subject (e.g. Brain plasticity)..." value={timerTopic} onChange={e => setTimerTopic(e.target.value)} />
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

        {/* 2. CURIOSITY SANDBOX (QUESTION DUMPING GROUND) */}
        {activeTab === 'sandbox' && (
          <div style={{ maxWidth: 840, margin: '0 auto', width: '100%' }}>
            <h2 style={{ fontSize: '2.4rem', marginBottom: '0.25rem' }}>Curiosity Sandbox 💭</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Dump curious rabbit-hole questions without breaking your study flow. Answer them whenever you are ready!
            </p>

            <form onSubmit={handleAddQuestion} style={{ background: 'var(--bg-card)', border: '2px solid var(--border-card)', borderRadius: 20, padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '0.75rem' }}>
              <input className="input-cute" placeholder="What question just popped into your mind?..." value={newQuestionText} onChange={e => setNewQuestionText(e.target.value)} required />
              <select className="input-cute" style={{ width: '160px' }} value={questionCategory} onChange={e => setQuestionCategory(e.target.value)}>
                <option value="Brain 🧠">Brain 🧠</option>
                <option value="Space 🌌">Space 🌌</option>
                <option value="Money 💰">Money 💰</option>
                <option value="Philosophy 🌿">Philosophy 🌿</option>
                <option value="Code 💻">Code 💻</option>
              </select>
              <button type="submit" className="btn-cute" style={{ whiteSpace: 'nowrap' }}>Dump Question 💭</button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {questions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 20 }}>
                  No questions dumped yet! Whenever you wonder why something is the way it is, dump it here.
                </div>
              ) : (
                questions.map(q => (
                  <div key={q.id} className="question-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-lavender)' }}>{q.category}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span
                          onClick={() => handleToggleQuestionStatus(q)}
                          className="question-status-tag"
                          style={{
                            background: q.status === 'Solved 💡' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255, 133, 162, 0.15)',
                            color: q.status === 'Solved 💡' ? 'var(--accent-mint)' : 'var(--accent-pink)'
                          }}
                        >
                          {q.status} (Click to toggle)
                        </span>
                        <button onClick={() => handleDeleteQuestion(q.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{q.question}</h4>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 3. POLAROID VISION BOARD */}
        {activeTab === 'vision' && (
          <div style={{ maxWidth: 840, margin: '0 auto', width: '100%' }}>
            <h2 style={{ fontSize: '2.4rem', marginBottom: '0.25rem' }}>Scrapbook Vision Board 🖼️</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Your North Stars. The pillars of knowledge, craft, and life you are building toward every day.
            </p>

            <div className="vision-board-grid">
              {VISION_PILLARS.map((v, i) => (
                <div key={i} className="polaroid-card">
                  <div className="polaroid-photo-box" style={{ background: v.color }}>{v.emoji}</div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.35rem' }}>{v.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{v.goal}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. STUDY TECHNIQUES & LIVE FACT GENERATOR */}
        {activeTab === 'techniques' && (
          <div style={{ maxWidth: 840, margin: '0 auto', width: '100%' }}>
            <h2 style={{ fontSize: '2.4rem', marginBottom: '0.25rem' }}>Study Techniques & Facts 🧠</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Science-backed protocols to learn faster. Click any technique to auto-apply it to your focus clock!
            </p>

            {/* Live Fact Generator */}
            <div style={{ background: 'var(--bg-card)', border: '2px solid var(--border-card)', borderRadius: 24, padding: '1.75rem', marginBottom: '2.5rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-pink)', textTransform: 'uppercase' }}>Live Internet Science Fact</span>
              <p style={{ fontSize: '1.15rem', fontWeight: 600, margin: '1rem 0', lineHeight: 1.6, color: 'var(--text-main)' }}>
                {onlineFact || "Click the button below to pull a fascinating random fact from the internet!"}
              </p>
              <button onClick={fetchInternetFact} className="btn-cute" style={{ background: 'var(--accent-mint)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <RefreshCw size={16} className={fetchingFact ? "animate-spin" : ""} />
                {fetchingFact ? "Fetching Fact..." : "Pull Fresh Fact 🌐"}
              </button>
            </div>

            {/* Techniques Grid */}
            <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Protocols & Mental Models</h3>
            <div className="technique-grid">
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
          </div>
        )}

        {/* 5. CALENDAR */}
        {activeTab === 'calendar' && (
          <div style={{ maxWidth: 840, margin: '0 auto', width: '100%' }}>
            <h2 style={{ fontSize: '2.4rem', marginBottom: '0.25rem' }}>Activity Calendar 📅</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Inspect any date's learning history and journal reflections!</p>

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
                  const isSelected = selectedDate === dateStr;
                  return (
                    <div key={dayNum} className={`calendar-cell ${daySessions.length > 0 ? 'has-activity' : ''} ${isSelected ? 'selected' : ''}`} onClick={() => setSelectedDate(dateStr)}>
                      <span>{dayNum}</span>
                      {daySessions.length > 0 && <span className="activity-flower">🌸</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Records for {selectedDate}</h3>
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
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 6. BOOKS */}
        {activeTab === 'library' && (
          <div style={{ maxWidth: 840, margin: '0 auto', width: '100%' }}>
            <h2 style={{ fontSize: '2.4rem', marginBottom: '0.25rem' }}>Curated Bookshelf 📚</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Foundational literature in psychology, neuroscience, finance, and space.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              {[
                { title: "The Principles of Psychology", author: "William James", category: "Psychology 🧠", link: "https://gutenberg.org/ebooks/5827" },
                { title: "Advice for a Young Investigator", author: "Santiago Ramón y Cajal", category: "Brain & Science 🔬", link: "https://gutenberg.org" },
                { title: "The Richest Man in Babylon", author: "George S. Clason", category: "Finance & Wealth 💰", link: "https://gutenberg.org" },
                { title: "Space, Time and Gravitation", author: "Arthur Eddington", category: "Space & Physics 🌌", link: "https://gutenberg.org/ebooks/49635" }
              ].map((b, idx) => (
                <div key={idx} style={{ background: 'var(--bg-card)', border: '2px solid var(--border-card)', borderRadius: 18, padding: '1.4rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-pink)' }}>{b.category}</span>
                  <h4 style={{ fontWeight: 700, fontSize: '1.15rem', marginTop: '0.25rem' }}>{b.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>{b.author}</p>
                  <a href={b.link} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-mint)', textDecoration: 'none' }}>Read Free Online ➔</a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. GARDEN */}
        {activeTab === 'garden' && (
          <div style={{ maxWidth: 820, margin: '0 auto', width: '100%' }}>
            <h2 style={{ fontSize: '2.4rem', marginBottom: '0.25rem' }}>Your Living Garden 🌱</h2>
            <div className="garden-card">
              <div className="plant-display">{garden.icon}</div>
              <h3 style={{ fontSize: '2rem', marginBottom: '0.35rem' }}>{garden.title}</h3>
              <p style={{ color: 'var(--text-muted)' }}>{garden.desc}</p>
              <div className="garden-progress-bar"><div className="garden-progress-fill" style={{ width: `${Math.min(100, (sessions.length / garden.next) * 100)}%` }} /></div>
            </div>
          </div>
        )}

        {/* 8. QUESTS */}
        {activeTab === 'quests' && (
          <div style={{ maxWidth: 820, margin: '0 auto', width: '100%' }}>
            <h2 style={{ fontSize: '2.4rem', marginBottom: '0.25rem' }}>Daily Quests 🍀</h2>
            <form onSubmit={handleAddQuest} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <input className="input-cute" placeholder="Write your custom quest..." value={newQuestText} onChange={e => setNewQuestText(e.target.value)} />
              <button type="submit" className="btn-cute">Add Quest</button>
            </form>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {todos.map(t => (
                <div key={t.id} className={`todo-quest-item ${t.completed ? 'completed' : ''}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }} onClick={() => handleToggleQuest(t.id)}>
                    <input type="checkbox" checked={t.completed} readOnly />
                    <span style={{ fontWeight: 600 }}>{t.text} {t.completed && <span style={{ color: 'var(--accent-pink)', marginLeft: '0.5rem' }}>🐾 Completed!</span>}</span>
                  </div>
                  <button onClick={() => handleDeleteQuest(t.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. JOURNAL */}
        {activeTab === 'journal' && (
          <div style={{ maxWidth: 820, margin: '0 auto', width: '100%' }}>
            <h2 style={{ fontSize: '2.4rem', marginBottom: '0.25rem' }}>Daily Scrapbook Journal 📖</h2>
            <div style={{ background: 'var(--bg-card)', border: '2px solid var(--border-card)', borderRadius: 24, padding: '1.75rem', marginBottom: '2rem' }}>
              <input className="input-cute" placeholder="Title..." value={journalTitle} onChange={e => setJournalTitle(e.target.value)} style={{ marginBottom: '1rem' }} />
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {JOURNAL_MOOD_STICKERS.map(s => (
                  <button key={s} type="button" onClick={() => setSelectedMoodSticker(s)} style={{ background: selectedMoodSticker === s ? 'var(--accent-lavender)' : 'var(--bg-card-hover)', color: selectedMoodSticker === s ? 'white' : 'var(--text-main)', border: '1px solid var(--border-card)', borderRadius: 10, padding: '0.35rem 0.75rem', cursor: 'pointer' }}>{s}</button>
                ))}
              </div>
              <textarea className="input-cute" rows={4} placeholder="Write freely..." value={journalContent} onChange={e => setJournalContent(e.target.value)} />
              <button className="btn-cute" onClick={handleSaveJournal} style={{ marginTop: '1rem' }}>Save Memory 🌸</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {journalEntries.map(j => (
                <div key={j.id} className="journal-scrapbook-card">
                  <div className="washi-tape-pin" />
                  <h4>{j.title}</h4>
                  <p style={{ marginTop: '0.4rem', whiteSpace: 'pre-wrap' }}>{j.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}