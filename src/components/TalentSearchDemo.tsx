import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { demoNetworks, talentSearchExamples } from "../data/talentSearchExamples";
import { formatWebsiteMetric } from "../data/websiteTalent";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { KitPlatformIcon } from "./KitDetails";
import { Reveal } from "./Marketing";
import { img } from "../lib/assets";
import "./talent-search-demo.css";

export function PlatformPresence() {
  return (
    <div className="td-platform-presence" aria-label="Creators across Instagram, TikTok and YouTube">
      {demoNetworks.map(({ network, label }) => (
        <span key={network}><KitPlatformIcon network={network} label={label} size={20} /><span>{label}</span></span>
      ))}
    </div>
  );
}

/** A guided public demonstration, with no connection to the private Lab. */
export function TalentSearchPreview() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const frame = useRef<HTMLDivElement>(null);
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const example = talentSearchExamples[active];

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.25 });
    if (frame.current) observer.observe(frame.current);
    const onVisibility = () => setPageVisible(!document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    if (!visible || !pageVisible || paused || reduceMotion !== false) return;
    const timer = window.setTimeout(() => setActive((index) => (index + 1) % talentSearchExamples.length), 6500);
    return () => window.clearTimeout(timer);
  }, [active, paused, visible, pageVisible, reduceMotion]);

  return (
    <div className="td-demo" ref={frame}>
      <div className="td-demo-toolbar">
        <span className="td-demo-title"><img src={img.foamSymbol} alt="" width="30" height="30" /> Talent Directory</span>
        <span className="td-demo-badge">Interactive preview</span>
      </div>
      <div className="td-demo-search" key={`query-${example.id}`}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" /></svg>
        <p>{example.query}</p>
      </div>
      <div className="td-demo-choices" role="group" aria-label="Try a talent search">
        {talentSearchExamples.map((item, index) => (
          <button type="button" key={item.id} aria-pressed={active === index} onClick={() => { setActive(index); setPaused(true); }}>{item.label}</button>
        ))}
      </div>
      <div className="td-demo-results" aria-label={`Talent results: ${example.query}`} role="group">
        <div className="td-demo-criteria">
          <span>{example.matches.length} matches</span>
          {example.criteria.map((criterion) => <span key={criterion}>{criterion}</span>)}
        </div>
        <div className="td-demo-table-wrap">
          <table className="td-demo-table">
            <caption className="td-sr-only">Fictional talent matching “{example.query}”. All account figures are illustrative.</caption>
            <thead><tr><th scope="col">Talent</th>{demoNetworks.map(({ network, label }) => <th scope="col" key={network}><KitPlatformIcon network={network} label={label} size={18} /><span>{label}</span></th>)}</tr></thead>
            <tbody key={example.id}>
              {example.matches.map((talent) => (
                <tr key={talent.id}>
                  <th scope="row"><div className="td-demo-person"><img src={talent.portrait} alt="" loading="lazy" decoding="async" /><span><strong>{talent.displayName}</strong><small>{talent.location.replace(" · demo profile", "")} · {talent.verticals[0]}</small></span></div></th>
                  {demoNetworks.map(({ network, label }) => {
                    const account = talent.platforms.find((item) => item.network === network);
                    return <td key={network} data-match={example.network === network} aria-label={`${label}: ${account ? account.followers.toLocaleString("en-US") : "No account"}${network === "youtube" ? " subscribers" : " followers"}`}><span className="td-mobile-platform"><KitPlatformIcon network={network} label={label} size={15} /></span>{account ? formatWebsiteMetric(account.followers) : "—"}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="td-demo-result-note"><span aria-hidden="true">↳</span> One creator. A whole world of connections.</div>
      </div>
      <div className="td-demo-footer">
        <p>Fictional creators · Illustrative figures<br />Includes AI-generated and supplied imagery</p>
        {reduceMotion === false && <button type="button" aria-pressed={paused} onClick={() => setPaused((value) => !value)}>{paused ? "Play examples" : "Pause examples"}</button>}
      </div>
    </div>
  );
}

export function TalentSearchSection() {
  return (
    <section className="td-section" id="talent-discovery" aria-labelledby="talent-discovery-heading">
      <div className="mp-container td-section-layout">
        <div className="td-section-copy">
          <p className="mp-eyebrow">START WITH THE PERSON</p>
          <h2 id="talent-discovery-heading">Your next great fit.<br />Across their world.</h2>
          <p>A creator is more than one profile. Find talent by interest, location and platform audience. See their accounts together, then explore what makes them a fit.</p>
          <PlatformPresence />
          <Link to="/features#explore" className="td-text-link">Explore the workspace <span aria-hidden="true">↗</span></Link>
        </div>
        <Reveal className="td-section-preview"><TalentSearchPreview /></Reveal>
      </div>
    </section>
  );
}
