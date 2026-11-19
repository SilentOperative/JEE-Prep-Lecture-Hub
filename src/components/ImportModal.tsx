import { useState } from "react";
import { X, Upload } from "lucide-react";
import type { Chapter } from "../types";

export default function ImportModal({ onClose, onImport }: {
  onClose: () => void; onImport: (items: Partial<Chapter>[]) => void;
}) {
  const [raw, setRaw] = useState("");
  const [error, setError] = useState("");
  function submit() {
    try {
      const parsed = JSON.parse(raw);
      const items = Array.isArray(parsed) ? parsed : parsed.chapters;
      if (!Array.isArray(items)) throw new Error("Expected an array or an object with a chapters array.");
      onImport(items);
      onClose();
    } catch (e) { setError(e instanceof Error ? e.message : "Invalid JSON"); }
  }
  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <div className="modal">
      <div className="modal-top"><div><span className="eyebrow">ADMIN TOOL</span><h2>Import lecture list</h2></div><button className="icon-btn" onClick={onClose}><X/></button></div>
      <p>Paste JSON containing chapters and lectures. This demo saves imported data in this browser only.</p>
      <textarea value={raw} onChange={e => setRaw(e.target.value)} placeholder={'[\n  {\n    "id": "c11-physics-01",\n    "classLevel": 11,\n    "subject": "Physics",\n    "name": "Units and Measurements",\n    "lectures": [\n      { "id": "lec-1", "title": "Lecture 01", "telegramPostUrl": "https://t.me/channel/123" }\n    ]\n  }\n]'} />
      {error && <p className="error">{error}</p>}
      <button className="primary-btn" onClick={submit}><Upload size={16}/> Import JSON</button>
      <p className="hint">Production note: replace browser storage with an authenticated admin-only Supabase table and server-side validation.</p>
    </div>
  </div>;
}