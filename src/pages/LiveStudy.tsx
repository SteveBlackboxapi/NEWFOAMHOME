import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Nav } from "../components/Nav";
import { LiveActivityControl, LiveCreatorCard } from "../components/LiveCreatorCard";
import { creatorLiveExamples } from "../data/creatorLiveExamples";
import { useMediaQuery } from "../hooks/useMediaQuery";
import "./live-study.css";

export function LiveStudy() {
  const [paused, setPaused] = useState(false);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  useEffect(() => {
    const previous = document.title;
    document.title = "A little more live — Concept preview | Foam";
    return () => { document.title = previous; };
  }, []);

  return (
    <div className="pc-site ls-page">
      <Nav />
      <main id="main-content" tabIndex={-1}>
        <header className="ls-intro">
          <div><p className="ls-eyebrow">A Foam exploration</p><h1>A little<br /><span>more live.</span></h1></div>
          <div className="ls-intro-copy"><p>A familiar face. An everyday moment. A conversation you want to be part of.</p><p className="ls-intro-secondary">Two ways to bring a creator’s world a little closer.</p><Link to="/creators" className="ls-back-link">Back to the creator story <span aria-hidden="true">↗</span></Link></div>
        </header>
        <div className="ls-study-toolbar">
          <p>Concept preview · AI-generated creators · Simulated activity</p>
          <LiveActivityControl paused={paused} reducedMotion={reducedMotion} onToggle={() => setPaused((value) => !value)} />
        </div>
        <div className="ls-pair">
          {creatorLiveExamples.map((example) => <LiveCreatorCard key={example.platform} example={example} paused={paused} reducedMotion={reducedMotion} />)}
        </div>
        <footer className="ls-outro"><p>The content starts the story.<br /><span>The conversation brings it to life.</span></p><Link to="/">Explore Foam <span aria-hidden="true">↗</span></Link></footer>
      </main>
    </div>
  );
}
