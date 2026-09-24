import { useEffect } from "react";
import { Link, useParams } from "react-router";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { MiniIllustration } from "../components/mini-ui/MiniIllustration";
import { SourceFirst } from "./trust-concepts/SourceFirst";
import { CreatorFirst } from "./trust-concepts/CreatorFirst";
import { AnswersFirst } from "./trust-concepts/AnswersFirst";
import "./trust-concepts/trust-concepts.css";

const options = [
  {
    id: "1",
    title: "Follow the number",
    tag: "SOURCE FIRST",
    summary:
      "A clear explanation of where a figure comes from, with one dark product card doing the talking.",
    fit: "The clearest introduction for managers and brands.",
    scene: "analytics" as const,
    component: SourceFirst,
  },
  {
    id: "2",
    title: "Start with the creator",
    tag: "CONNECTION FIRST",
    summary:
      "A friendly, visual walkthrough of the connection, the permissions and the introduction that follows.",
    fit: "The warmest, most Google-like product story.",
    scene: "connections" as const,
    component: CreatorFirst,
  },
  {
    id: "3",
    title: "Good questions. Clear answers.",
    tag: "ANSWERS FIRST",
    summary:
      "A shorter route to the useful detail. Choose a question and see the answer beside a small Foam preview.",
    fit: "The most direct, practical guide.",
    scene: "permissions" as const,
    component: AnswersFirst,
  },
];

function CompareOptions() {
  return (
    <>
      <section className="tl-shell tl-comparison-intro">
        <p className="tl-eyebrow">DATA &amp; TRUST · THREE DIRECTIONS</p>
        <h1>
          A clearer way
          <br />
          to build confidence.
        </h1>
        <p>
          Three complete page concepts. Same Foam, different starting points.
        </p>
        <span>
          The current website is unchanged. Pick the approach that feels right.
        </span>
      </section>
      <section
        className="tl-shell tl-option-grid"
        aria-label="Choose a page concept"
      >
        {options.map((option) => (
          <article className="tl-option-card" key={option.id}>
            <Link
              to={`/lab/data-trust/${option.id}/`}
              className="tl-option-art"
              aria-label={`Preview option ${option.id}: ${option.title}`}
            >
              <MiniIllustration kind={option.scene} disclosure={false} />
              <span className="tl-option-number">0{option.id}</span>
            </Link>
            <div className="tl-option-copy">
              <p className="tl-eyebrow">{option.tag}</p>
              <h2>{option.title}</h2>
              <p>{option.summary}</p>
              <p className="tl-option-fit">{option.fit}</p>
              <Link className="tl-button" to={`/lab/data-trust/${option.id}/`}>
                Explore option {option.id}
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </article>
        ))}
      </section>
      <section className="tl-shell tl-research tl-section" id="research">
        <div>
          <p className="tl-eyebrow">WHAT INFORMED THE DESIGNS</p>
          <h2>
            Useful lessons.
            <br />
            Still unmistakably Foam.
          </h2>
          <p>
            These are lessons in explanation and layout. Claims about other
            products have not been carried over into Foam.
          </p>
        </div>
        <div className="tl-research-list">
          <article>
            <span>01</span>
            <h3>Show the thing you’re explaining.</h3>
            <p>
              Google pairs short explanations with focused interface
              illustrations. Each Foam concept gives its miniatures a specific
              job.
            </p>
            <a
              href="https://workspace.google.com/products/drive/"
              target="_blank"
              rel="noreferrer"
            >
              Google Drive ↗
            </a>
            <a
              href="https://workspace.google.com/security/ai-privacy/"
              target="_blank"
              rel="noreferrer"
            >
              Workspace privacy ↗
            </a>
          </article>
          <article>
            <span>02</span>
            <h3>Make the data journey understandable.</h3>
            <p>
              Modash explains how its data is collected and processed. CreatorIQ
              explains permission requests through their practical uses.
            </p>
            <a
              href="https://www.modash.io/data"
              target="_blank"
              rel="noreferrer"
            >
              Modash data ↗
            </a>
            <a
              href="https://creatorsupport.creatoriq.com/hc/en-us/articles/13576532602637-How-do-we-protect-your-data-privacy"
              target="_blank"
              rel="noreferrer"
            >
              CreatorIQ privacy ↗
            </a>
          </article>
          <article>
            <span>03</span>
            <h3>Give details a place. Keep the next step clear.</h3>
            <p>
              Notion and Airtable separate accessible product explanations from
              formal documentation. HypeAuditor addresses data methodology and
              limitations.
            </p>
            <a
              href="https://www.notion.com/security"
              target="_blank"
              rel="noreferrer"
            >
              Notion ↗
            </a>
            <a
              href="https://www.airtable.com/platform/governance"
              target="_blank"
              rel="noreferrer"
            >
              Airtable ↗
            </a>
            <a
              href="https://hypeauditor.com/collect-analyze-influencer-data/"
              target="_blank"
              rel="noreferrer"
            >
              HypeAuditor ↗
            </a>
          </article>
          <article>
            <span>04</span>
            <h3>Ground the explanation in Foam.</h3>
            <p>
              Foam’s published product information describes platform APIs and
              customizable media kits. Exact refresh intervals and permission
              details need confirmation, so none are invented here.
            </p>
            <a
              href="https://www.foam.io/overview"
              target="_blank"
              rel="noreferrer"
            >
              Foam overview ↗
            </a>
            <a
              href="https://www.foam.io/media-kits"
              target="_blank"
              rel="noreferrer"
            >
              Foam media kits ↗
            </a>
          </article>
        </div>
      </section>
      <p className="tl-shell tl-comparison-note">
        Preview artwork uses fictional, AI-generated creators and demonstration
        figures.
      </p>
    </>
  );
}

export function TrustConcepts() {
  const { option } = useParams();
  const current = options.find((item) => item.id === option);
  useEffect(() => {
    document.title = `${current ? `0${current.id} · ${current.title}` : "Data & trust · Three directions"} | Foam`;
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, nofollow";
    document.head.appendChild(robots);
    return () => {
      robots.remove();
    };
  }, [current]);
  const Page = current?.component;
  return (
    <div className="pc-site trust-lab">
      <Nav />
      <main id="main-content" tabIndex={-1}>
        <nav
          className="tl-preview-rail"
          aria-label="Data and trust design previews"
        >
          <div className="tl-shell">
            <Link to="/lab/data-trust/" className="tl-preview-home">
              Design previews <span aria-hidden="true">/</span> Data &amp; trust
            </Link>
            <div>
              {options.map((item) => (
                <Link
                  key={item.id}
                  to={`/lab/data-trust/${item.id}/`}
                  aria-current={current?.id === item.id ? "page" : undefined}
                >
                  <span>0{item.id}</span>
                  <span>
                    {item.id === "1"
                      ? "Source"
                      : item.id === "2"
                        ? "Creator"
                        : "Answers"}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </nav>
        {Page ? (
          <Page />
        ) : option ? (
          <section className="tl-shell tl-section">
            <h1>Choose one of the three directions.</h1>
            <Link className="tl-button" to="/lab/data-trust/">
              Compare the concepts ↗
            </Link>
          </section>
        ) : (
          <CompareOptions />
        )}
        {current && (
          <nav
            className="tl-shell tl-bottom-compare"
            aria-label="Compare the other concepts"
          >
            <Link to="/lab/data-trust/">← Compare all three</Link>
            <Link to={`/lab/data-trust/${(Number(current.id) % 3) + 1}/`}>
              Next concept <span aria-hidden="true">→</span>
            </Link>
          </nav>
        )}
      </main>
      <Footer />
    </div>
  );
}
