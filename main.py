from datetime import date, datetime, timezone
from pathlib import Path
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Field, SQLModel, Session, create_engine, select

# ==============================================================================
# 1. DATABASE MODELS & SCHEMAS
# ==============================================================================

# 1. Learning Session
class LearningSessionBase(SQLModel):
    topic: str
    activity: str
    category: str = "Programming"
    duration_minutes: int
    session_date: date = Field(default_factory=lambda: datetime.now(timezone.utc).date())
    notes: Optional[str] = None
    mood: Optional[str] = "Focused 😊"
    weather: Optional[str] = "Sunny ☀️"
    completed: bool = True

class LearningSessionCreate(LearningSessionBase):
    pass

class LearningSessionUpdate(SQLModel):
    topic: Optional[str] = None
    activity: Optional[str] = None
    category: Optional[str] = None
    duration_minutes: Optional[int] = None
    session_date: Optional[date] = None
    notes: Optional[str] = None
    mood: Optional[str] = None
    weather: Optional[str] = None
    completed: Optional[bool] = None

class LearningSession(LearningSessionBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# 2. Daily Journal
class JournalEntry(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = "Daily Reflection"
    content: str
    mood: Optional[str] = "Cozy ☕"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class JournalEntryCreate(SQLModel):
    title: Optional[str] = "Daily Reflection"
    content: str
    mood: Optional[str] = "Cozy ☕"


# 3. Persistent Daily Quests / To-Dos
class TodoItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    text: str
    completed: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TodoItemCreate(SQLModel):
    text: str


# ==============================================================================
# 2. DATABASE CONFIGURATION
# ==============================================================================

DB_DIR = Path("C:/dev")
DB_DIR.mkdir(parents=True, exist_ok=True)
db_path = DB_DIR / "life.db"

sqlite_url = f"sqlite:///{db_path.as_posix()}"
engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session


# ==============================================================================
# 3. FASTAPI APP & CORS
# ==============================================================================

app = FastAPI(
    title="Little Life API",
    description="A little progress, a lot of life.",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()


# ==============================================================================
# 4. API ENDPOINTS: LEARNING SESSIONS
# ==============================================================================

@app.get("/", tags=["General"])
def root():
    return {"message": "Little Life API is alive 🐾", "tagline": "A little progress, a lot of life."}

@app.post("/learning-sessions", response_model=LearningSession, status_code=status.HTTP_201_CREATED, tags=["Learning Sessions"])
def create_session(session_data: LearningSessionCreate, session: Session = Depends(get_session)):
    db_session = LearningSession.model_validate(session_data)
    session.add(db_session)
    session.commit()
    session.refresh(db_session)
    return db_session

@app.get("/learning-sessions", response_model=List[LearningSession], tags=["Learning Sessions"])
def read_sessions(
    topic: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    session: Session = Depends(get_session),
):
    query = select(LearningSession).order_by(LearningSession.created_at.desc())
    if topic:
        query = query.where(LearningSession.topic.ilike(f"%{topic}%"))
    if category:
        query = query.where(LearningSession.category.ilike(f"%{category}%"))
    return session.exec(query).all()

@app.delete("/learning-sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Learning Sessions"])
def delete_session(session_id: int, session: Session = Depends(get_session)):
    db_session = session.get(LearningSession, session_id)
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")
    session.delete(db_session)
    session.commit()
    return None


# ==============================================================================
# 5. API ENDPOINTS: JOURNAL
# ==============================================================================

@app.get("/journal", response_model=List[JournalEntry], tags=["Journal"])
def get_journal(session: Session = Depends(get_session)):
    return session.exec(select(JournalEntry).order_by(JournalEntry.created_at.desc())).all()

@app.post("/journal", response_model=JournalEntry, status_code=status.HTTP_201_CREATED, tags=["Journal"])
def create_journal(entry: JournalEntryCreate, session: Session = Depends(get_session)):
    db_entry = JournalEntry.model_validate(entry)
    session.add(db_entry)
    session.commit()
    session.refresh(db_entry)
    return db_entry

@app.delete("/journal/{entry_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Journal"])
def delete_journal(entry_id: int, session: Session = Depends(get_session)):
    entry = session.get(JournalEntry, entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    session.delete(entry)
    session.commit()
    return None


# ==============================================================================
# 6. API ENDPOINTS: DAILY QUESTS / TODOS
# ==============================================================================

@app.get("/todos", response_model=List[TodoItem], tags=["Todos"])
def get_todos(session: Session = Depends(get_session)):
    return session.exec(select(TodoItem).order_by(TodoItem.created_at.desc())).all()

@app.post("/todos", response_model=TodoItem, status_code=status.HTTP_201_CREATED, tags=["Todos"])
def create_todo(todo: TodoItemCreate, session: Session = Depends(get_session)):
    db_todo = TodoItem(text=todo.text, completed=False)
    session.add(db_todo)
    session.commit()
    session.refresh(db_todo)
    return db_todo

class TodoItemUpdate(SQLModel):
    text: Optional[str] = None
    completed: Optional[bool] = None

@app.put("/todos/{todo_id}", response_model=TodoItem, tags=["Todos"])
def update_todo(todo_id: int, todo_update: TodoItemUpdate, session: Session = Depends(get_session)):
    todo = session.get(TodoItem, todo_id)
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    if todo_update.text is not None:
        todo.text = todo_update.text
    if todo_update.completed is not None:
        todo.completed = todo_update.completed
    session.add(todo)
    session.commit()
    session.refresh(todo)
    return todo

@app.delete("/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Todos"])
def delete_todo(todo_id: int, session: Session = Depends(get_session)):
    todo = session.get(TodoItem, todo_id)
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    session.delete(todo)
    session.commit()
    return None


# ==============================================================================
# 7. ANALYTICS ENDPOINTS
# ==============================================================================

@app.get("/analytics/summary", tags=["Analytics"])
def get_analytics_summary(session: Session = Depends(get_session)):
    sessions = session.exec(select(LearningSession)).all()
    total_sessions = len(sessions)
    if total_sessions == 0:
        return {
            "total_sessions": 0,
            "completed_sessions": 0,
            "total_minutes": 0,
            "total_hours": 0.0,
            "average_session_minutes": 0.0,
        }
    
    total_minutes = sum(s.duration_minutes for s in sessions)
    return {
        "total_sessions": total_sessions,
        "completed_sessions": sum(1 for s in sessions if s.completed),
        "total_minutes": total_minutes,
        "total_hours": round(total_minutes / 60, 2),
        "average_session_minutes": round(total_minutes / total_sessions, 1),
    }

@app.get("/analytics/topics", tags=["Analytics"])
def get_topic_breakdown(session: Session = Depends(get_session)):
    sessions = session.exec(select(LearningSession)).all()
    topic_totals = {}
    for s in sessions:
        topic_totals[s.topic] = topic_totals.get(s.topic, 0) + s.duration_minutes
    return [{"topic": topic, "minutes": minutes} for topic, minutes in topic_totals.items()]
# ==============================================================================
# 8. BACKUP & RESTORE ENDPOINTS (DATA OWNERSHIP)
# ==============================================================================

from fastapi.responses import JSONResponse

@app.get("/backup/export", tags=["Backup"])
def export_all_data(session: Session = Depends(get_session)):
    """Export all user data as a single portable JSON file."""
    sessions = session.exec(select(LearningSession)).all()
    journal = session.exec(select(JournalEntry)).all()
    todos = session.exec(select(TodoItem)).all()

    backup_payload = {
        "version": "1.1.0",
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "learning_sessions": [s.model_dump(mode="json") for s in sessions],
        "journal_entries": [j.model_dump(mode="json") for j in journal],
        "todos": [t.model_dump(mode="json") for t in todos],
    }
    return JSONResponse(content=backup_payload)


class BackupImportPayload(SQLModel):
    learning_sessions: List[LearningSessionCreate] = []
    journal_entries: List[JournalEntryCreate] = []
    todos: List[TodoItemCreate] = []

@app.post("/backup/import", tags=["Backup"])
def import_backup_data(payload: BackupImportPayload, session: Session = Depends(get_session)):
    """Import and restore records from a JSON backup file."""
    # Restore sessions
    for s in payload.learning_sessions:
        session.add(LearningSession.model_validate(s))
    
    # Restore journal entries
    for j in payload.journal_entries:
        session.add(JournalEntry.model_validate(j))
        
    # Restore todos
    for t in payload.todos:
        session.add(TodoItem(text=t.text, completed=False))

    session.commit()
    return {"status": "success", "message": "Records restored successfully"}