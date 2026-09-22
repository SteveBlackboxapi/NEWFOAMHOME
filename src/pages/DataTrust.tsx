import { Link } from "react-router";
import {
  ActionLink,
  FoamGlyph,
  MarketingPage,
  PageIntro,
  Reveal,
} from "../components/Marketing";
import "./editorial-pages.css";

const privacyUrl = "https://app.usefoam.com/privacy";
const termsUrl = "https://app.usefoam.com/terms";

function SourceDiagram() {
  return (
    <figure className="ep-source-figure">
      <div className="ep-source-diagram">
        <div className="ep-source-platforms">
          <span>Instagram</span>
          <span>TikTok</span>
          <span>YouTube</span>
        </div>
        <div className="ep-source-connector" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="ep-source-centre">
          <FoamGlyph kind="flower" />
          <span>
            Connected
            <br />
            <strong>to the source.</strong>
          </span>
        </div>
        <div className="ep-source-line" aria-hidden="true" />
        <div className="ep-source-context">
          <span>Content</span>
          <span>Profile</span>
          <span>Performance</span>
        </div>
        <div className="ep-source-foot">
          <span className="ep-signal-dot" />A clearer starting point.
        </div>
      </div>
      <figcaption>
        Platform data, brought into the pitching workflow. Illustration.
      </figcaption>
    </figure>
  );
}

const principles = [
  {
    number: "01",
    title: "Start at the source.",
    description:
      "Foam brings content and performance information from connected social platforms into the tools managers use to pitch talent. It puts the creator’s work and the supporting data in the same conversation.",
    note: "Connected platform data",
  },
  {
    number: "02",
    title: "Keep the creator in the conversation.",
    description:
      "Account connections start with the creator. Review the permissions presented when connecting, and speak with the Foam team about the information your agency needs and how it will be used.",
    note: "Informed account connections",
  },
  {
    number: "03",
    title: "Give numbers their context.",
    description:
      "A metric is one part of the picture. Look at the platform, the content and the creator together. Confirm what is available for a connected account before building a pitch around it.",
    note: "A more useful picture",
  },
];

export function DataTrust() {
  return (
    <MarketingPage className="ep-page ep-trust">
      <PageIntro
        eyebrow="Data & trust"
        title={
          <>
            Confidence
            <br />
            starts at
            <br />
            <em>the source.</em>
          </>
        }
        description="Better conversations need a clear starting point: where information comes from, what it means, and how it’s being shared."
        visual={<SourceDiagram />}
        tone="blue"
      >
        <ActionLink to={privacyUrl} className="ep-button-ink">
          Read our privacy policy
        </ActionLink>
      </PageIntro>
      <section className="mp-section ep-principles">
        <div className="mp-container">
          <Reveal className="ep-split-heading">
            <h2 className="mp-heading">
              Clarity, at
              <br />
              every step.
            </h2>
            <p className="mp-body">
              The product is built around connected platform information. The
              people using it should understand the connection, too.
            </p>
          </Reveal>
          <div className="ep-principle-list">
            {principles.map((principle) => (
              <Reveal key={principle.number}>
                <article className="ep-principle">
                  <span className="ep-row-number" aria-hidden="true">
                    {principle.number}
                  </span>
                  <h3>{principle.title}</h3>
                  <div>
                    <p>{principle.description}</p>
                    <span className="ep-principle-note">
                      <span className="ep-signal-dot" />
                      {principle.note}
                    </span>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
          <p className="ep-source-note">
            Explore the workflow in{" "}
            <a href="https://www.foam.io/overview">
              Foam’s product overview <span aria-hidden="true">↗</span>
            </a>
            .
          </p>
        </div>
      </section>
      <section className="mp-section mp-dark ep-demo-truth">
        <div className="mp-container">
          <Reveal className="ep-demo-truth-layout">
            <div>
              <p className="mp-eyebrow">A note on this website</p>
              <h2 className="mp-heading">
                Real product ideas.
                <br />
                <em>Illustrative stories.</em>
              </h2>
              <p className="mp-body">
                Our interactive website stories use a fictional cast so you can
                explore the experience without showing a real creator’s account
                data.
              </p>
              <Link className="mp-link" to="/kit-story">
                Explore a media kit story <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <div className="ep-demo-notes">
              <div>
                <span aria-hidden="true">01</span>
                <h3>Fictional creators</h3>
                <p>
                  The people in our demo stories are AI-generated characters.
                  Their imagery is labelled.
                </p>
              </div>
              <div>
                <span aria-hidden="true">02</span>
                <h3>Illustrative figures</h3>
                <p>
                  Demo audience and performance numbers explain the layout. They
                  are not live results or customer claims.
                </p>
              </div>
              <div>
                <span aria-hidden="true">03</span>
                <h3>Product walkthroughs</h3>
                <p>
                  A story shows a workflow. Talk to our team to see what is
                  available for your connected accounts.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
      <section className="mp-section mp-cream ep-trust-resources">
        <div className="mp-container">
          <Reveal className="ep-resource-heading">
            <p className="mp-eyebrow">The detail belongs here</p>
            <h2 className="mp-heading">
              Clear answers.
              <br />
              Open conversation.
            </h2>
            <p className="mp-body">
              For the full policy wording or a question about your setup, go
              straight to the source.
            </p>
          </Reveal>
          <div className="ep-resource-list">
            <a href={privacyUrl}>
              <span>
                <strong>Privacy policy</strong>
                <span>How information is handled.</span>
              </span>
              <span className="ep-resource-arrow" aria-hidden="true">
                ↗
              </span>
            </a>
            <a href={termsUrl}>
              <span>
                <strong>Terms of use</strong>
                <span>The terms for using Foam.</span>
              </span>
              <span className="ep-resource-arrow" aria-hidden="true">
                ↗
              </span>
            </a>
            <a href="mailto:hello@foam.io">
              <span>
                <strong>Ask the Foam team</strong>
                <span>
                  Connections, account access or a question we haven’t answered.
                </span>
              </span>
              <span className="ep-resource-arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          </div>
        </div>
      </section>
    </MarketingPage>
  );
}
