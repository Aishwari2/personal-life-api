# 🌸 Little Life — Personal Life API & Digital Sanctuary
> *"A little progress, a lot of life."*

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![SQLite](https://img.shields.io/badge/SQLite-Local_Storage-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple?style=flat-square)](LICENSE)

**Little Life** is a full-stack personal data ecosystem and study sanctuary. It pairs the rigor of a type-safe **FastAPI REST backend** and persistent **SQLite database** with an editorial, scrapbook-inspired **React & TypeScript** dashboard.

Instead of corporate, guilt-inducing productivity streaks, Little Life visualizes consistency as a living digital garden that evolves with verified records.

---

## 🌟 Key Highlights

- **🎀 Focus Engine:** Integrated open-ended stopwatch & study logger with browser desktop notification triggers.
- **🌱 Living Activity Garden:** A 7-tier progression system (`Acorn` ➔ `Sprout` ➔ `Fern` ➔ `Tulip` ➔ `Bonsai` ➔ `Sakura` ➔ `Celestial Forest`) querying real database counts.
- **🏆 Achievement Cabinet:** 10 tiered unlockable milestone badges accompanied by encouraging lore.
- **🍀 Persistent Daily Quests:** Full CRUD to-do system stored directly in SQLite.
- **📖 Sanctuary Notepad:** Distraction-free daily reflections and journal archive.
- **🐱 Mochi the Cat:** Animated SVG companion with context-aware encouragement and breathing animations.
- **🎵 24/7 Lofi Stream:** Built-in ambient focus radio in the persistent companion sidebar.
- **📊 Topic Distribution:** Recharts visual data visualization breaking down study minutes per subject.
- **🎨 Dual Theme:** Toggle between warm *Cream Paper* and cozy *Midnight Scrapbook*.

---

## 🏗️ System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                 FRONTEND CLIENT (React + Vite)              │
│                                                             │
│   [ Mochi Mascot ]  [ Jelly Portals ]  [ Lofi Radio ]       │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON
                               │ (GET, POST, PUT, DELETE)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 BACKEND SERVICE (FastAPI)                   │
│                                                             │
│   • Pydantic Schemas             • Analytics Engine         │
│   • CORS Middleware              • Business Routing         │
└──────────────────────────────┬──────────────────────────────┘
                               │ SQLModel ORM
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 LOCAL STORAGE (SQLite Engine)               │
│                                                             │
│   • learning_sessions   • journal_entries   • todo_items    │
└─────────────────────────────────────────────────────────────┘