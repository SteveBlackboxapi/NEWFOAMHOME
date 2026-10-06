import { Link } from "react-router";
import { useState } from "react";
import { discoverySearches } from "../data/discoveryContent";
import { OptimizedImage } from "./OptimizedImage";
import "./content-search-section.css";

export function ContentSearchSection() {
  const [active, setActive] = useState(2);
  const [selected, setSelected] = useState<string | null>(null);
  const example = discoverySearches[active];
  return <>
    <div className="cs-or mp-container"><span />OR<span /></div>
    <section className="td-section cs-section" id="content-search-preview" aria-labelledby="content-search-heading">
      <div className="mp-container td-section-layout">
        <div className="td-section-copy">
          <p className="mp-eyebrow">START WITH THE CONTENT</p>
          <h2 id="content-search-heading">Find the moment.<br />Meet the creator.</h2>
          <p>A product mention. An everyday ritual. A point of view. Find the content that fits your brief, then get to know the person behind it.</p>
          <p className="cs-prompt">Sometimes the work is the introduction.</p>
          <Link className="td-text-link" to="/kit-story/#found-with-foam">Explore content <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="td-demo cs-demo">
          <div className="td-demo-toolbar"><span className="td-demo-title"><svg className="cs-compass" viewBox="0 0 32 32" fill="none" aria-hidden="true"><circle cx="16" cy="16" r="11"/><path d="m21 11-3 7-7 3 3-7z"/></svg>Explore content</span><span className="td-demo-badge">Interactive preview</span></div>
          <div className="td-demo-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg><p>{example.query}</p></div>
          <div className="cs-choices" role="group" aria-label="Try a content search">{discoverySearches.map((item,index)=><button key={item.id} aria-pressed={active===index} onClick={()=>{setActive(index);setSelected(null);}}>{["Outfits","Skincare","Nike","Cats"][index]}</button>)}</div>
          <div className="cs-results">
            <div className="cs-result-heading"><strong><span />3 content matches</strong><span>Across your talent</span></div>
            <div className="cs-grid" key={example.id}>{example.assets.map((asset,index)=><button className="cs-post" key={asset.id} aria-pressed={selected===asset.id} onClick={()=>setSelected(selected===asset.id?null:asset.id)} aria-label={`View ${asset.caption || asset.alt}`}>
              <OptimizedImage section={`Content discovery · ${example.query}`} src={asset.src} alt={asset.alt} loading="lazy" />
              <span className="cs-post-copy"><small>{asset.id.split(':')[0].split('-').map(s=>s[0].toUpperCase()+s.slice(1)).join(' ')}</small><strong>{asset.caption || ["A closer look","Everyday moments","Worth sharing"][index]}</strong><span>View post ↗</span></span>
            </button>)}</div>
            <div className="cs-result-note" role="status">{selected ? `${example.assets.find(a=>a.id===selected)?.caption || 'Selected post'} · From ${selected.split(':')[0].split('-').map(s=>s[0].toUpperCase()+s.slice(1)).join(' ')}’s content library.` : '↳ Start with a post. Discover the person behind it.'}</div>
          </div>
          <div className="td-sequence-steps"><span data-current="true">01 The search</span><span>02 The content</span><span>03 The creator</span></div>
          <div className="td-demo-footer"><p>Fictional creators · Illustrative results<br/>Includes AI-generated and supplied imagery</p><span className="td-demo-badge">Try a search above ↗</span></div>
        </div>
      </div>
    </section>
  </>;
}
