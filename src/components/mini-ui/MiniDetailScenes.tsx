import {
  MiniAccounts,
  MiniAvatar,
  MiniBar,
  MiniFoamMark,
  MiniFrame,
  MiniIcon,
  MiniPhoto,
} from "./MiniPrimitives";

export function MiniKit() {
  return (
    <div className="mui-kit-scene">
      <div className="mui-kit-back mui-card" />
      <div className="mui-kit-sheet mui-card">
        <div className="mui-kit-top">
          <MiniFoamMark size={24} />
          <span>THE MEDIA KIT</span>
          <MiniIcon name="arrow" size={16} />
        </div>
        <div className="mui-kit-profile">
          <div>
            <span className="mui-micro">BEAUTY · LIFESTYLE</span>
            <h3>
              Samantha
              <br />
              Pikka.
            </h3>
            <MiniAccounts person="samantha" size={18} />
          </div>
          <MiniPhoto person="samantha" />
        </div>
        <div className="mui-kit-stats">
          <div>
            <strong>1.2M</strong>
            <span>Audience</span>
          </div>
          <div>
            <strong>4.8%</strong>
            <span>Engagement</span>
          </div>
        </div>
        <div className="mui-kit-lines">
          <MiniBar width="86%" />
          <MiniBar width="65%" />
        </div>
      </div>
      <div className="mui-kit-float mui-card">
        <span className="mui-kit-spark">✳</span>
        <div>
          <strong>A great introduction.</strong>
          <span>All in one little link.</span>
        </div>
      </div>
      <div className="mui-kit-pill mui-pill mui-lime">
        <MiniIcon name="check" size={15} /> Ready to share
      </div>
    </div>
  );
}

export function MiniAnalytics() {
  return (
    <>
      <MiniFrame title="A little more context" className="mui-analytics-window">
        <div className="mui-analytics-metrics">
          <div>
            <span>Total audience</span>
            <strong>570.1K</strong>
          </div>
          <div>
            <span>Engagement</span>
            <strong>
              4.8<span>%</span>
            </strong>
          </div>
        </div>
        <div className="mui-chart">
          <div className="mui-chart-grid">
            <i />
            <i />
            <i />
          </div>
          <svg viewBox="0 0 350 100" aria-hidden="true">
            <path
              d="M0 86C25 86 28 51 60 59S100 79 130 44 174 56 206 27 250 46 282 18 327 19 350 4V100H0Z"
              fill="#e9f2fe"
            />
            <path
              d="M0 86C25 86 28 51 60 59S100 79 130 44 174 56 206 27 250 46 282 18 327 19 350 4"
              stroke="#739ddb"
              strokeWidth="3"
              fill="none"
            />
            <circle cx="350" cy="4" r="5" fill="#2463cc" />
          </svg>
          <div className="mui-chart-months">
            <span>Jan</span>
            <span>Jun</span>
            <span>Dec</span>
          </div>
        </div>
      </MiniFrame>
      <div className="mui-audience-float mui-card">
        <div className="mui-mini-donut" />
        <div>
          <strong>
            The people behind
            <br />
            the numbers.
          </strong>
          <span>Audience insights</span>
        </div>
      </div>
      <span className="mui-analytics-chip mui-pill mui-lime">
        <MiniIcon name="shield" size={16} /> Connected data
      </span>
    </>
  );
}

export function MiniWatchlist() {
  return (
    <>
      <div className="mui-watch-back mui-card">
        <MiniBar width={160} />
        <MiniBar width={95} />
      </div>
      <MiniFrame title="On your radar" className="mui-watch-window">
        <div className="mui-watch-title">
          <h3>Next big things.</h3>
          <span>03</span>
        </div>
        {(
          [
            ["aria", "Aria Quen", "Beauty & everyday life"],
            ["nia", "Nia Brooks", "Skin first. Always."],
            ["elise", "Elise Morgan", "Style with a point of view"],
          ] as const
        ).map(([person, name, note], i) => (
          <div className="mui-watch-row" key={person}>
            <span className="mui-watch-index">0{i + 1}</span>
            <MiniAvatar person={person} size={44} />
            <div>
              <strong>{name}</strong>
              <span>{note}</span>
            </div>
            <MiniIcon name="bookmark" size={17} />
          </div>
        ))}
      </MiniFrame>
      <div className="mui-watch-float mui-card">
        <span className="mui-watch-eye">
          <MiniIcon name="eye" size={25} />
        </span>
        <div>
          <strong>One to watch.</strong>
          <span>Keep possibility close.</span>
        </div>
      </div>
    </>
  );
}

export function MiniConnections() {
  return (
    <>
      <svg
        className="mui-connect-lines"
        viewBox="0 0 560 360"
        aria-hidden="true"
      >
        <path
          d="M280 184C180 184 176 98 95 98M280 184C380 184 380 98 470 98M280 184C180 184 165 278 92 278M280 184C375 184 390 280 474 280"
          fill="none"
          stroke="#bdcddb"
          strokeWidth="2"
          strokeDasharray="4 5"
        />
      </svg>
      <div className="mui-connect-hub mui-card">
        <MiniFoamMark size={51} />
        <strong>One clear picture.</strong>
        <div className="mui-connect-avatars">
          <MiniAvatar person="samantha" size={26} />
          <MiniAvatar person="aria" size={26} />
          <MiniAvatar person="nia" size={26} />
        </div>
      </div>
      <div className="mui-connect-node mui-connect-content mui-card">
        <span className="mui-connect-symbol mui-blue">
          <MiniIcon name="grid" size={24} />
        </span>
        <strong>Content</strong>
        <MiniBar width={68} />
        <MiniBar width={45} />
      </div>
      <div className="mui-connect-node mui-connect-profile mui-card">
        <MiniAvatar person="samantha" size={39} />
        <strong>Profile</strong>
        <MiniBar width={54} />
      </div>
      <div className="mui-connect-node mui-connect-audience mui-card">
        <span className="mui-connect-symbol mui-lime">
          <MiniIcon name="users" size={24} />
        </span>
        <strong>Audience</strong>
        <MiniBar width={63} />
      </div>
      <div className="mui-connect-node mui-connect-performance mui-card">
        <MiniIcon name="chart" size={31} />
        <strong>Performance</strong>
        <div className="mui-connect-bars">
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
      </div>
      <span className="mui-connect-check mui-pill mui-blue">
        <MiniIcon name="check" size={14} /> Together in Foam
      </span>
    </>
  );
}
