import { PeopleTiles } from "../components/PeopleColour";
import { Link } from "react-router";
import { MarketingPage, Reveal } from "../components/Marketing";
import { DEMO_URL } from "../lib/siteLinks";
import "../components/site-shell.css";

export function Demo() {
  return (
    <MarketingPage className="demo-page">
      <section className="demo-hero">
        <Reveal className="demo-hero-copy">
          <p className="demo-eyebrow">Let’s meet</p>
          <h1>
            Bring your
            <br />
            next big
            <br />
            <em>thing.</em>
          </h1>
          <p className="demo-intro">
            A new brief. A growing roster. A better way to pitch. Tell us what
            you’re working on and we’ll show you around Foam.
          </p>
          <a className="demo-primary" href={DEMO_URL}>
            Request a demo <span aria-hidden="true">↗</span>
          </a>
          <p className="demo-link-note">
            Continue to our short demo request form.
          </p>
          <a className="demo-email" href="mailto:hello@foam.io">
            Or say hello@foam.io <span aria-hidden="true">↗</span>
          </a>
        </Reveal>
        <PeopleTiles kind="creators" message="Big ideas. Start here." />
      </section>
      <section className="demo-agenda">
        <Reveal className="demo-agenda-intro">
          <p className="demo-eyebrow">Your world. Your walkthrough.</p>
          <h2>
            Let’s make it
            <br />
            about you.
          </h2>
          <p>We’ll start with the work you do every day.</p>
        </Reveal>
        <div className="demo-agenda-items">
          {[
            {
              title: "Your people.",
              copy: "Show us your world of talent. See how profiles, content and audience insights come together.",
            },
            {
              title: "Your process.",
              copy: "From the first brand email to the final shortlist, explore a workflow that fits the way you work.",
            },
            {
              title: "Your next pitch.",
              copy: "Discover media kits, shareable lists and an extension that brings your roster into your inbox.",
            },
          ].map((item, index) => (
            <Reveal
              key={item.title}
              className="demo-agenda-item"
              delay={index * 50}
            >
              <span aria-hidden="true">0{index + 1}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <Reveal className="demo-explore">
        <div>
          <p className="demo-eyebrow">Take a look around</p>
          <h2>
            A good story
            <br />
            starts with talent.
          </h2>
        </div>
        <Link to="/kit-story/">
          Explore the kit story <span aria-hidden="true">↗</span>
        </Link>
      </Reveal>
    </MarketingPage>
  );
}
