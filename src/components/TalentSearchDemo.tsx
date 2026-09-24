import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { demoNetworks, demoReviewTotal, talentSearchExamples } from "../data/talentSearchExamples";
import { formatWebsiteMetric } from "../data/websiteTalent";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useTalentSearchSequence } from "../hooks/useTalentSearchSequence";
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
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [suggestionsFocused, setSuggestionsFocused] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  const choiceButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const { active, phase, progress, reviewed, paused, selectExample, togglePaused } =
    useTalentSearchSequence({
      exampleCount: talentSearchExamples.length,
      enabled: visible && pageVisible && !suggestionsFocused,
      reducedMotion: reduceMotion,
      reviewTotal: demoReviewTotal,
    });
  const example = talentSearchExamples[active];
  const resultsReady = phase === "results";
  const choosing = phase === "suggestions" || phase === "typing";
  const query = phase === "suggestions"
    ? "Describe the creators you’re looking for"
    : phase === "typing"
      ? example.query.slice(0, Math.ceil(progress * example.query.length))
      : example.query;
  const stage = resultsReady ? 2 : phase === "reviewing" ? 1 : 0;

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

  return (
    <div className="td-demo" ref={frame} data-search-phase={phase}>
      <div className="td-demo-toolbar">
        <span className="td-demo-title"><img src={img.foamSymbol} alt="" width="30" height="30" /> Talent Directory</span>
        <span className="td-demo-badge">Interactive preview</span>
      </div>
      <div className={`td-demo-search ${choosing ? "is-composing" : ""}`} role="group" aria-label={phase === "suggestions" ? "Suggested talent searches" : `Search: ${example.query}`}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" /></svg>
        <p className={phase === "suggestions" ? "td-search-placeholder" : ""} aria-hidden="true">
          {query}<i className={phase === "typing" && !paused ? "td-search-caret" : ""} />
        </p>
      </div>
      <div className="td-demo-choices" role="group" aria-label="Try a talent search">
        {talentSearchExamples.map((item, index) => (
          <button type="button" key={item.id} ref={(element) => { choiceButtons.current[index] = element; }} aria-pressed={active === index} onClick={() => selectExample(index)}>{item.label}</button>
        ))}
      </div>
      <div className="td-demo-stage" aria-label="Talent search demonstration" role="group">
        <div className="td-demo-results" style={{ visibility: resultsReady ? "visible" : "hidden" }} aria-hidden={!resultsReady}>
          <div className="td-demo-criteria">
            <span><span className="td-match-dot" aria-hidden="true" />Strong matches ({example.matches.length})</span>
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
        {choosing && (
          <div className="td-search-suggestions">
            <span className="td-search-stage-label">Suggested talent searches</span>
            <div className="td-suggestion-list" role="group" aria-label="Choose an example query"
              onFocusCapture={() => setSuggestionsFocused(true)}
              onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setSuggestionsFocused(false);
              }}>
              {talentSearchExamples.map((item, index) => (
                <button key={item.id} type="button" data-selected={active === index} onClick={() => {
                  selectExample(index);
                  choiceButtons.current[index]?.focus({ preventScroll: true });
                }}>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" /></svg>
                  <span>{item.query}</span>
                  <span aria-hidden="true">↗</span>
                </button>
              ))}
            </div>
            <p>Start with what you have in mind.</p>
          </div>
        )}
        {phase === "reviewing" && (
          <div className="td-search-review" aria-hidden="true">
            <div className="td-review-status">
              <span className="td-review-dot" />
              <p>Reviewing <strong>{reviewed}</strong> demo profiles<span> · {progress < .7 ? "finding the fit" : "almost there"}</span></p>
            </div>
            <div className="td-review-progress"><span style={{ transform: `scaleX(${progress})` }} /></div>
            <div className="td-review-skeletons">
              {[0, 1, 2].map((row) => <div className="td-review-row" key={row}><span className="td-skeleton-avatar" /><span className="td-skeleton-person"><i /><i /></span><span className="td-skeleton-metric" /><span className="td-skeleton-metric" /><span className="td-skeleton-metric" /></div>)}
            </div>
            <p className="td-review-note">Interests. Locations. Platform audiences.</p>
          </div>
        )}
      </div>
      <div className="td-sequence-steps" aria-hidden="true">
        {["The brief", "The search", "The matches"].map((label, index) => <span key={label} data-current={stage === index} data-complete={stage > index}><i>{stage > index ? "✓" : `0${index + 1}`}</i>{label}</span>)}
      </div>
      <p className="td-sr-only" role="status">{resultsReady ? `${example.matches.length} strong matches for ${example.query}.` : phase === "reviewing" ? "Reviewing illustrative demo profiles." : "Choose a suggested talent search."}</p>
      <div className="td-demo-footer">
        <p>Fictional creators · Illustrative figures<br />Includes AI-generated and supplied imagery</p>
        {reduceMotion === false && <button type="button" aria-pressed={paused} onClick={togglePaused}>{paused ? "Play examples" : "Pause examples"}</button>}
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
