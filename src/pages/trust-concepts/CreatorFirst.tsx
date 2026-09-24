import { MiniIllustration } from "../../components/mini-ui/MiniIllustration";
import { TrustAction, TrustClosing, TrustQuestions, DemoNote } from "./shared";
import "./creator-first.css";

const steps = [
  {
    number: "01",
    title: "Start with the creator.",
    text: "A connected account gives the profile its context. The information available depends on the platform and the account connection.",
  },
  {
    number: "02",
    title: "Choose what matters.",
    text: "Shape the media kit around the introduction you’re making. Select the analytics that help tell this creator’s story.",
  },
  {
    number: "03",
    title: "Make the introduction.",
    text: "Bring the profile, content and selected figures together. Give a brand something useful to explore and share.",
  },
];

export function CreatorFirst() {
  return (
    <div className="tc-page">
      <section className="tl-shell tc-opening" aria-labelledby="tc-title">
        <span className="tl-eyebrow">DATA &amp; TRUST</span>
        <h1 id="tc-title">
          A clear connection.
          <br />
          <span>A stronger introduction.</span>
        </h1>
        <p className="tl-lede">
          It starts with a creator. Connect their accounts, put the figures in
          context, and help their next opportunity take shape.
        </p>
        <div className="tl-actions tc-opening-actions">
          <TrustAction to="/demo">Get a demo</TrustAction>
          <TrustAction to="#tc-how-it-works" secondary>
            See how it comes together
          </TrustAction>
        </div>

        <div className="tc-connection-board">
          <div className="tc-board-copy">
            <span className="tc-small-label">
              THE PERSON BEHIND THE PROFILE
            </span>
            <h2>
              Connected accounts.
              <br />A fuller picture.
            </h2>
            <p>
              Foam brings information from platform APIs into the media kit,
              alongside the content that makes a creator themselves.
            </p>
            <div className="tc-board-note">
              <span aria-hidden="true">↗</span>
              <span>From the account to the introduction.</span>
            </div>
          </div>
          <MiniIllustration
            kind="connections"
            className="tc-connections-art"
            label="Illustrative Foam account connections, bringing profile, content, audience and performance into one view."
          />
        </div>
      </section>

      <section
        id="tc-how-it-works"
        className="tl-shell tc-steps-section"
        aria-labelledby="tc-steps-title"
      >
        <div className="tc-section-heading">
          <span className="tl-eyebrow">A LITTLE CLARITY AT EVERY STEP</span>
          <h2 id="tc-steps-title">One connection. A story worth sharing.</h2>
        </div>
        <ol className="tc-steps">
          {steps.map((step) => (
            <li key={step.number}>
              <span className="tc-step-number" aria-hidden="true">
                {step.number}
              </span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="tc-access-section" aria-labelledby="tc-access-title">
        <div className="tl-shell tc-access-grid">
          <div className="tc-access-copy">
            <span className="tl-eyebrow">THE CONNECTION, EXPLAINED</span>
            <h2 id="tc-access-title">The details should feel clear, too.</h2>
            <p className="tl-lede">
              Which account is connected? What information is available? What
              permissions are involved? They’re sensible questions to ask.
            </p>
            <p>
              We can walk through the connection with you, so you understand
              what it means for your talent and your team.
            </p>
            <div className="tl-actions">
              <TrustAction to="/demo">Talk through your setup</TrustAction>
            </div>
          </div>
          <div className="tc-access-art">
            <span className="tc-example-label">
              A SMALL LOOK AT THE DETAILS
            </span>
            <MiniIllustration
              kind="permissions"
              label="An illustrative account-permissions panel, showing example audience and content categories."
            />
          </div>
        </div>
      </section>

      <section
        className="tl-shell tc-introduction-section"
        aria-labelledby="tc-introduction-title"
      >
        <MiniIllustration
          kind="kit"
          className="tc-kit-art"
          label="An illustrative media kit combining a fictional creator, content and sample audience figures."
        />
        <div className="tc-introduction-copy">
          <span className="tl-eyebrow">PUT IT IN CONTEXT</span>
          <h2 id="tc-introduction-title">
            More than a number.
            <br />A proper introduction.
          </h2>
          <p className="tl-lede">
            The creator. The work. The audience. A media kit brings them
            together, so the figures are part of the story.
          </p>
          <div className="tl-actions">
            <TrustAction to="/kit-story/">Explore a media kit</TrustAction>
          </div>
        </div>
      </section>

      <div className="tl-shell tc-demo-note">
        <DemoNote />
      </div>
      <TrustQuestions title="A few things you might be wondering." />
      <TrustClosing title="Let’s make the connection clear.">
        Bring your questions. We’ll show you how Foam fits your talent and your
        team.
      </TrustClosing>
    </div>
  );
}
