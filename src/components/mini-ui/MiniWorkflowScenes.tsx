import {
  MiniAvatar,
  MiniBar,
  MiniFoamMark,
  MiniFrame,
  MiniIcon,
  MiniPhoto,
} from "./MiniPrimitives";
import "./mini-workflow.css";

export function MiniInbox() {
  return (
    <div className="mui-w-scene mui-w-inbox">
      <MiniFrame title="Your inbox" className="mui-w-inbox-window">
        <div className="mui-w-mail-heading">
          <MiniIcon name="mail" size={19} />
          <strong>A creator for our next campaign</strong>
        </div>
        <div className="mui-w-sender">
          <span className="mui-w-letter-avatar">R</span>
          <div>
            <strong>Rose at Haven Hair</strong>
            <span>to you</span>
          </div>
        </div>
        <div className="mui-w-email-lines">
          <MiniBar width={220} />
          <MiniBar width={260} />
          <MiniBar width={185} />
        </div>
        <span className="mui-w-reply">
          <MiniIcon name="mail" size={15} /> Reply
        </span>
      </MiniFrame>
      <div className="mui-card mui-w-inbox-talent">
        <div className="mui-w-small-heading">
          <MiniFoamMark size={22} />
          <span>Your roster. Right here.</span>
        </div>
        <div className="mui-w-inbox-person">
          <MiniPhoto person="samantha" />
          <div>
            <strong>
              Samantha
              <br />
              Pikka
            </strong>
            <span>Beauty · Lifestyle</span>
            <b>570.1K</b>
            <small>Instagram audience</small>
          </div>
        </div>
        <span className="mui-w-blue-action">
          <MiniIcon name="copy" size={16} /> Copy profile
        </span>
      </div>
      <div className="mui-card mui-w-inbox-toast">
        <span className="mui-w-check-dot">
          <MiniIcon name="check" size={15} />
        </span>
        Ready to drop into your reply.
      </div>
    </div>
  );
}

export function MiniShare() {
  return (
    <div className="mui-w-scene mui-w-share">
      <MiniFrame title="Media kit" className="mui-w-share-kit">
        <div className="mui-w-kit-profile">
          <MiniPhoto person="aria" />
          <div>
            <span className="mui-w-eyebrow">MEET</span>
            <strong>Aria Quen</strong>
            <span>Beauty &amp; everyday life</span>
            <span className="mui-w-kit-tag">Open to possibilities</span>
          </div>
        </div>
        <div className="mui-w-kit-stat-row">
          <div>
            <strong>1.8M</strong>
            <span>Audience</span>
          </div>
          <div>
            <strong>4.8%</strong>
            <span>Engagement</span>
          </div>
        </div>
        <div className="mui-w-kit-lines">
          <MiniBar width={170} />
          <MiniBar width={135} />
        </div>
      </MiniFrame>
      <div className="mui-card mui-w-share-panel">
        <div className="mui-w-share-heading">
          <span className="mui-w-icon-tile">
            <MiniIcon name="share" size={22} />
          </span>
          <div>
            <strong>
              A little link.
              <br />A lot of possibility.
            </strong>
          </div>
        </div>
        <span className="mui-w-share-caption">Share Aria’s media kit</span>
        <div className="mui-w-url">
          <MiniIcon name="link" size={16} />
          <span>foam.io/aria-quen</span>
          <MiniIcon name="copy" size={16} />
        </div>
        <span className="mui-w-blue-action">
          <MiniIcon name="check" size={17} /> Link copied
        </span>
      </div>
      <span className="mui-w-share-bubble">
        <MiniIcon name="arrow" size={23} />
      </span>
    </div>
  );
}

export function MiniNotes() {
  return (
    <div className="mui-w-scene mui-w-notes">
      <MiniFrame title="Talent profile" className="mui-w-notes-profile">
        <div className="mui-w-notes-person">
          <MiniAvatar person="nia" size={64} />
          <div>
            <strong>Nia Brooks</strong>
            <span>Skincare · Beauty</span>
          </div>
        </div>
        <div className="mui-w-notes-tabs">
          <span>Overview</span>
          <strong>
            Team notes <b>3</b>
          </strong>
        </div>
        <div className="mui-w-notes-preview">
          <span className="mui-w-note-icon">
            <MiniIcon name="note" size={20} />
          </span>
          <div>
            <MiniBar width={120} />
            <MiniBar width={160} />
          </div>
        </div>
        <div className="mui-w-notes-preview">
          <span className="mui-w-note-icon">
            <MiniIcon name="note" size={20} />
          </span>
          <div>
            <MiniBar width={150} />
            <MiniBar width={100} />
          </div>
        </div>
      </MiniFrame>
      <div className="mui-card mui-w-note-card">
        <span className="mui-w-note-pin" />
        <div className="mui-w-note-card-title">
          <MiniIcon name="note" size={20} />
          <strong>A good thing to know</strong>
        </div>
        <p>
          Loves a thoughtful brief.
          <br />
          Great fit for a wellbeing pitch.
        </p>
        <div className="mui-w-note-author">
          <MiniAvatar person="elise" size={26} />
          <span>Added by your team</span>
          <MiniIcon name="check" size={15} />
        </div>
      </div>
      <span className="mui-w-team-pill">
        <MiniIcon name="users" size={17} /> All on the same page.
      </span>
    </div>
  );
}

export function MiniPermissions() {
  return (
    <div className="mui-w-scene mui-w-permissions">
      <MiniFrame
        title="Account permissions"
        className="mui-w-permission-window"
      >
        <div className="mui-w-connected-person">
          <MiniAvatar person="samantha" size={44} />
          <div>
            <strong>Samantha Pikka</strong>
            <span>You choose what to connect.</span>
          </div>
        </div>
        <div className="mui-w-permission-row">
          <span>Audience insights</span>
          <span className="mui-w-toggle">
            <MiniIcon name="check" size={12} />
          </span>
        </div>
        <div className="mui-w-permission-row">
          <span>Content performance</span>
          <span className="mui-w-toggle">
            <MiniIcon name="check" size={12} />
          </span>
        </div>
        <div className="mui-w-permission-footer">
          <MiniIcon name="link" size={16} />
          <span>Connected at source</span>
        </div>
      </MiniFrame>
      <div className="mui-w-shield-bubble">
        <MiniIcon name="shield" size={52} />
      </div>
      <div className="mui-card mui-w-permission-toast">
        <span className="mui-w-check-dot">
          <MiniIcon name="check" size={19} />
        </span>
        <div>
          <strong>Your data. Your say.</strong>
          <span>Control what you share.</span>
        </div>
      </div>
      <span className="mui-w-permission-spark mui-w-permission-spark-one" />
      <span className="mui-w-permission-spark mui-w-permission-spark-two" />
    </div>
  );
}
