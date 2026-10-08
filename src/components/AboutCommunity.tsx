import { OptimizedImage } from "./OptimizedImage";
import { aboutInterviewThumbnails } from "../data/aboutEditorialPhotos";
import "./about-community.css";

const interviews = [
  { title: "The day behind the job.", description: "The routines, relationships and work that people don’t always see." },
  { title: "What makes a great pitch?", description: "How managers bring a creator’s story into the right conversation." },
  { title: "What should we build next?", description: "The little frustrations and big ideas that help shape Foam." },
];

export function AboutListening() {
  return (
    <section className="ac-section ac-listening" aria-labelledby="about-listening-title">
      <div className="mp-container">
        <div className="ac-section-heading">
          <div>
            <p className="mp-eyebrow">In conversation</p>
            <h2 className="mp-heading" id="about-listening-title">Built by listening.</h2>
          </div>
          <p className="ac-section-description">
            Foam takes shape in conversations with talent managers. Their everyday experience helps
            us decide what to build, what to simplify and what to improve.
          </p>
        </div>
        <div className="ac-interviews">
          {interviews.map((interview, index) => (
            <article className="ac-interview" key={interview.title}>
              <div className="ac-interview-thumbnail">
                <OptimizedImage
                  src={aboutInterviewThumbnails[index].src}
                  section={aboutInterviewThumbnails[index].section}
                  width={aboutInterviewThumbnails[index].width}
                  height={aboutInterviewThumbnails[index].height}
                  alt={aboutInterviewThumbnails[index].alt}
                  sizes="(max-width: 760px) calc(100vw - 44px), 33vw"
                  loading="lazy"
                />
                <span className="ac-interview-play" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 5v14l11-7Z" /></svg>
                </span>
              </div>
              <div className="ac-interview-copy">
                <p className="ac-small-label">
                  Talent manager conversations
                  <span className="ac-interview-status">Preview only</span>
                </p>
                <h3>{interview.title}</h3>
                <p>{interview.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export type AboutSocialPost = {
  id: string;
  platform: "LinkedIn" | "Instagram";
  href: string;
  caption: string;
  image: {
    src: string;
    width: number;
    height: number;
    alt: string;
    objectPosition?: string;
  };
};

export function AboutSocialFeed({ posts }: { posts: readonly AboutSocialPost[] }) {
  if (posts.length === 0) return null;
  return (
    <section className="ac-section ac-social" aria-labelledby="about-social-title">
      <div className="mp-container">
        <div className="ac-section-heading">
          <div>
            <p className="mp-eyebrow">A little more Foam</p>
            <h2 className="mp-heading" id="about-social-title">Good people.<br />Good company.</h2>
          </div>
          <p className="ac-section-description">
            A few moments from our community, out in the world and in the feed.
          </p>
        </div>
        <div className="ac-social-feed">
          {posts.map((post) => (
            <article className="ac-social-card" key={post.id}>
              <div className="ac-social-author">
                <span className="ac-social-avatar" aria-hidden="true">foam</span>
                <div><strong>Foam</strong><span>From {post.platform}</span></div>
              </div>
              <p className="ac-social-caption">{post.caption}</p>
              <div className="ac-social-photo">
                <OptimizedImage
                  src={post.image.src}
                  section="Foam on social"
                  width={post.image.width}
                  height={post.image.height}
                  alt={post.image.alt}
                  style={{ objectPosition: post.image.objectPosition ?? "50% 50%" }}
                  sizes="(max-width: 760px) calc(100vw - 44px), 33vw"
                  loading="lazy"
                />
              </div>
              <a href={post.href} target="_blank" rel="noopener noreferrer" className="ac-social-link">
                View on {post.platform}<span aria-hidden="true">↗</span>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
