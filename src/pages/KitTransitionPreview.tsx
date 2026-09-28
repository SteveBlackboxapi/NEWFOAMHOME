import { useEffect } from "react";
import { KitStory } from "./KitStory";
import { WebsiteImageRoute } from "../components/WebsiteImageScope";
import "./kit-transition-preview.css";

/** An isolated study; the published /kit-story route keeps its original transition. */
export function KitTransitionPreview() {
  useEffect(() => {
    const title = document.title;
    document.title = "Media Kit transition test | Foam";
    return () => { document.title = title; };
  }, []);
  const replay = () => {
    const track = document.querySelector<HTMLElement>("[data-kit-story-track]");
    if (!track) return;
    window.scrollTo({
      top: window.scrollY + track.getBoundingClientRect().top + (track.offsetHeight - window.innerHeight) * 0.815,
      behavior: "instant",
    });
  };
  return <>
    <aside className="ktp-tools" aria-label="Transition test controls">
      <span>Transition test</span>
      <button type="button" onClick={replay}>Replay transition ↑</button>
      <a href="https://steveblackboxapi.github.io/NEWFOAMHOME/kit-story/" target="_blank" rel="noopener noreferrer">Current live page ↗</a>
    </aside>
    <WebsiteImageRoute route="/kit-story"><KitStory separateChapters /></WebsiteImageRoute>
  </>;
}
