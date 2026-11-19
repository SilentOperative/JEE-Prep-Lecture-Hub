import { ExternalLink, PlayCircle } from "lucide-react";
import type { Lecture } from "../types";
import { telegramEmbedUrl, isSafeVideoUrl } from "../lib/telegram";

export default function Player({ lecture, onComplete }: { lecture: Lecture; onComplete: () => void }) {
  const embed = lecture.telegramPostUrl ? telegramEmbedUrl(lecture.telegramPostUrl) : null;
  const direct = lecture.videoUrl && isSafeVideoUrl(lecture.videoUrl) ? lecture.videoUrl : null;

  return <section className="player-panel">
    <div className="player-heading">
      <div><span className="eyebrow">NOW PLAYING</span><h2>{lecture.title}</h2></div>
      <button className="complete-btn" onClick={onComplete}>Mark completed</button>
    </div>
    {embed ? <div className="embed-wrap">
      <iframe src={embed} title={lecture.title} loading="lazy" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
    </div> : direct ? <video className="video-player" controls playsInline preload="metadata" src={direct}>
      Your browser does not support video playback.
    </video> : <div className="empty-player">
      <PlayCircle size={48}/><h3>Lecture source not added yet</h3>
      <p>Add a Telegram post link for this lecture using the Admin import tool. The post must be public and embeddable.</p>
    </div>}
    {lecture.telegramPostUrl && <a className="source-link" href={lecture.telegramPostUrl} target="_blank" rel="noreferrer">Open original Telegram post <ExternalLink size={15}/></a>}
  </section>;
}