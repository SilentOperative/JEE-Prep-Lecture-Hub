import { useEffect, useMemo, useState } from "react";
import { BookOpen, Search, Play, Clock3, CheckCircle2, ChevronRight, GraduationCap, Menu, X, Upload, ExternalLink, Radio } from "lucide-react";
import { catalog as initialCatalog } from "./data/catalog";
import type { Chapter, Lecture, Subject } from "./types";
import Player from "./components/Player";
import ImportModal from "./components/ImportModal";
import { supabase } from "./lib/supabase";

const subjects: Subject[] = ["Physics", "Chemistry", "Mathematics", "Biology"];
const channelUrl = "https://t.me/jeeadvanced000";
const storageKey = "jee-prep-lecture-library-v1";

function loadCatalog(): Chapter[] {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : initialCatalog;
  } catch { return initialCatalog; }
}

export default function App() {
  const [data, setData] = useState<Chapter[]>(loadCatalog);
  const [backendStatus, setBackendStatus] = useState<"loading" | "connected" | "fallback">("loading");
  const [classLevel, setClassLevel] = useState<11 | 12>(11);
  const [subject, setSubject] = useState<Subject>("Physics");
  const [query, setQuery] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [selectedLectureId, setSelectedLectureId] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const chapters = useMemo(() => data.filter(c => c.classLevel === classLevel && c.subject === subject)
    .filter(c => !query || c.name.toLowerCase().includes(query.toLowerCase()) || c.lectures.some(l => l.title.toLowerCase().includes(query.toLowerCase()))), [data,classLevel,subject,query]);
  const selectedChapter = chapters.find(c => c.id === selectedChapterId) ?? chapters[0] ?? null;
  const selectedLecture = selectedChapter?.lectures.find(l => l.id === selectedLectureId) ?? selectedChapter?.lectures[0] ?? null;
  const allLectures = data.flatMap(c => c.lectures);
  const completedCount = allLectures.filter(l => l.completed).length;
  const totalCount = allLectures.length;
  const progress = totalCount ? Math.round(completedCount / totalCount * 100) : 0;

  useEffect(() => {
    let active = true;
    async function loadFromSupabase() {
      if (!supabase) { setBackendStatus("fallback"); return; }
      const [{ data: chapters, error: chaptersError }, { data: lectures, error: lecturesError }] = await Promise.all([
        supabase.from("lecture_chapters").select("id,class_level,subject,name,sort_order").order("class_level").order("sort_order"),
        supabase.from("lecture_items").select("id,chapter_id,title,description,duration,telegram_post_url,video_url,sort_order").order("sort_order")
      ]);
      if (!active) return;
      if (chaptersError || lecturesError || !chapters?.length) { setBackendStatus("fallback"); return; }
      const next: Chapter[] = chapters.map(chapter => ({
        id: chapter.id,
        name: chapter.name,
        classLevel: chapter.class_level as 11 | 12,
        subject: chapter.subject as Subject,
        order: chapter.sort_order,
        lectures: (lectures ?? []).filter(lecture => lecture.chapter_id === chapter.id).map(lecture => ({
          id: lecture.id,
          title: lecture.title,
          description: lecture.description ?? undefined,
          duration: lecture.duration ?? undefined,
          telegramPostUrl: lecture.telegram_post_url ?? undefined,
          videoUrl: lecture.video_url ?? undefined
        }))
      }));
      const { data: authData } = await supabase.auth.getSession();
      const user = authData.session?.user ?? (await supabase.auth.signInAnonymously()).data.user;
      if (user) {
        const { data: completed } = await supabase.from("lecture_progress").select("lecture_id").eq("user_id", user.id);
        const completedIds = new Set((completed ?? []).map(item => item.lecture_id));
        next.forEach(chapter => chapter.lectures.forEach(lecture => { lecture.completed = completedIds.has(lecture.id); }));
      }
      setData(next);
      setBackendStatus("connected");
    }
    void loadFromSupabase();
    return () => { active = false; };
  }, []);

  function persist(next: Chapter[]) {
    setData(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  }
  function chooseChapter(chapter: Chapter) {
    setSelectedChapterId(chapter.id);
    setSelectedLectureId(chapter.lectures[0]?.id ?? null);
  }
  async function markComplete() {
    if (!selectedChapter || !selectedLecture) return;
    persist(data.map(c => c.id !== selectedChapter.id ? c : {
      ...c, lectures: c.lectures.map(l => l.id === selectedLecture.id ? {...l, completed: true} : l)
    }));
    if (supabase) {
      const { data: session } = await supabase.auth.getSession();
      if (session.session?.user) {
        await supabase.from("lecture_progress").upsert({ user_id: session.session.user.id, lecture_id: selectedLecture.id });
      }
    }
  }
  function importItems(items: Partial<Chapter>[]) {
    const next = [...data];
    items.forEach(item => {
      if (!item.id || !item.name || !item.classLevel || !item.subject) return;
      const normalized = {...item, order: item.order ?? next.length + 1, lectures: item.lectures ?? []} as Chapter;
      const index = next.findIndex(c => c.id === normalized.id);
      if (index >= 0) next[index] = normalized; else next.push(normalized);
    });
    persist(next);
  }

  return <div className="app-shell">
    <header className="topbar">
      <button className="mobile-menu icon-btn" onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X/> : <Menu/>}</button>
      <a className="brand" href="#"><div className="brand-mark"><GraduationCap size={21}/></div><span>JEE PREP <b>HUB</b></span></a>
      <div className="topbar-right"><span className="live-dot"/> CLASS 11–12 LECTURES <a className="channel-btn" href={channelUrl} target="_blank" rel="noreferrer">Telegram channel <ExternalLink size={14}/></a></div>
    </header>

    <div className="layout">
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="side-label">YOUR CLASS</div>
        <div className="class-switch">
          {[11,12].map(n => <button key={n} className={classLevel === n ? "active" : ""} onClick={() => {setClassLevel(n as 11|12); setSelectedChapterId(null); setSelectedLectureId(null); setMobileMenu(false);}}>Class {n}</button>)}
        </div>
        <div className="side-label subject-label">SUBJECTS</div>
        {subjects.map((s,i) => <button key={s} className={`subject-link ${subject === s ? "selected" : ""}`} onClick={() => {setSubject(s); setSelectedChapterId(null); setSelectedLectureId(null); setMobileMenu(false);}}>
          <span className={`subject-icon subject-${i}`}>{s === "Physics" ? "ϟ" : s === "Chemistry" ? "⚗" : s === "Mathematics" ? "∑" : "⌬"}</span>{s}<ChevronRight size={16}/>
        </button>)}
        <div className="side-progress">
          <div className="progress-title"><span>Learning progress</span><b>{progress}%</b></div>
          <div className="progress-track"><div style={{width:`${progress}%`}}/></div>
          <small>{completedCount} of {totalCount} lectures completed</small>
        </div>
        <div className="sidebar-bottom"><BookOpen size={17}/><span>Learn consistently.<br/><b>Improve every day.</b></span></div>
      </aside>

      <main className="main-content">
        <div className="welcome-row">
          <div><div className="eyebrow">LEARNING LIBRARY / CLASS {classLevel}</div><h1>Explore your <span>lectures.</span></h1><p>Structured chapter-wise learning, all in one place.</p></div>
          <div className="class-pill"><GraduationCap size={17}/> CLASS {classLevel}</div>
        </div>

        <div className="subject-tabs">
          {subjects.map(s => <button key={s} className={subject === s ? "active" : ""} onClick={() => {setSubject(s);setSelectedChapterId(null);setSelectedLectureId(null);}}>{s}</button>)}
        </div>

        <div className="backend-note">{backendStatus === "connected" ? "Synced with Supabase" : backendStatus === "loading" ? "Loading lecture library…" : "Using local lecture catalog"}</div>

        <div className="content-grid">
          <section className="chapter-column">
            <div className="section-heading"><div><span className="eyebrow">SYLLABUS</span><h2>{subject} chapters</h2></div><span className="count-chip">{chapters.length} chapters</span></div>
            <label className="search-box"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search chapters or lectures..."/></label>
            <div className="chapter-list">
              {chapters.map((chapter) => <button key={chapter.id} className={`chapter-card ${selectedChapter?.id === chapter.id ? "chapter-active" : ""}`} onClick={() => chooseChapter(chapter)}>
                <span className="chapter-number">{String(chapter.order).padStart(2,"0")}</span>
                <span className="chapter-info"><b>{chapter.name}</b><small>{chapter.lectures.length} lectures {chapter.lectures.length ? "available" : "to be added"}</small></span>
                <ChevronRight size={17}/>
              </button>)}
              {!chapters.length && <div className="empty-state">No chapters match that search.</div>}
            </div>
          </section>

          <section className="lecture-column">
            {selectedChapter ? <>
              <div className="section-heading lecture-heading"><div><span className="eyebrow">CHAPTER {String(selectedChapter.order).padStart(2,"0")}</span><h2>{selectedChapter.name}</h2></div><span className="count-chip">{selectedChapter.lectures.length} videos</span></div>
              <div className="lecture-list">
                {selectedChapter.lectures.map((lecture,i) => <button key={lecture.id} className={`lecture-row ${selectedLecture?.id === lecture.id ? "lecture-active" : ""}`} onClick={() => setSelectedLectureId(lecture.id)}>
                  <span className="play-icon">{lecture.completed ? <CheckCircle2 size={18}/> : <Play size={17} fill="currentColor"/>}</span>
                  <span className="lecture-meta"><b>{lecture.title}</b><small>{lecture.duration || "Video lecture"} {lecture.description ? `· ${lecture.description}` : ""}</small></span>
                  {lecture.completed && <span className="done-tag">DONE</span>}
                </button>)}
                {!selectedChapter.lectures.length && <div className="empty-state chapter-empty"><Radio size={27}/><b>Lectures will appear here</b><span>This chapter is ready. Add its Telegram post links using the import option.</span></div>}
              </div>
              {selectedLecture && <Player lecture={selectedLecture} onComplete={markComplete}/>}
            </> : <div className="empty-state">Choose a chapter to view its lectures.</div>}
          </section>
        </div>
        <footer><span>© JEE Prep Hub</span><span>Built for focused learning</span></footer>
      </main>
    </div>

    <button className="admin-fab" onClick={() => setShowImport(true)} title="Import lecture data"><Upload size={17}/> Import lectures</button>
    {showImport && <ImportModal onClose={() => setShowImport(false)} onImport={importItems}/>}
  </div>;
}
