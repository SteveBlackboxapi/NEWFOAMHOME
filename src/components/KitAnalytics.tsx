import { useId } from "react";
import {
  clampKitProgress,
  formatKitCount,
  KIT_AGE_DISTRIBUTION,
  KIT_ANALYTICS_PROFILE,
  KIT_FOLLOWER_HISTORY,
  KIT_GENDER_DISTRIBUTION,
  KIT_METRICS,
  kitBarProgress,
  type KitMetricId,
} from "../data/kitAnalytics";
import "./kit-analytics.css";

export type KitAnalyticsSectionProps = {
  progress: number;
  reducedMotion?: boolean;
};

function MetricIcon({ name }: { name: KitMetricId }) {
  const paths = {
    views: (
      <>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    likes: (
      <path d="m12 20-7.7-7.4C-.7 7.4 6.1 1.7 12 7c5.9-5.3 12.7.4 7.7 5.6L12 20Z" />
    ),
    comments: (
      <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H5l-3 2V11.5a9.5 9.5 0 0 1 19 0Z" />
    ),
    shares: (
      <>
        <path d="m13 3 8 7-8 7v-4c-5 0-8 2-10 6 0-8 4-12 10-12V3Z" />
      </>
    ),
  };
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function MetricShield() {
  return (
    <svg className="ka-metric-shield" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 3h16v8c0 5.1-8 10-8 10S4 16.1 4 11V3Z" fill="currentColor" />
      <path
        d="m8 11 2.7 2.8L16.5 8"
        fill="none"
        stroke="#fff6eb"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Counter({
  value,
  progress,
  compact = true,
  prefix = "",
}: {
  value: number;
  progress: number;
  compact?: boolean;
  prefix?: string;
}) {
  return (
    <>
      <span aria-hidden="true">
        {prefix}
        {formatKitCount(value, progress, compact)}
      </span>
      <span className="ka-sr-only">
        {prefix}
        {value.toLocaleString("en-US")}
      </span>
    </>
  );
}

export function KitMetrics({
  progress,
  reducedMotion = false,
}: KitAnalyticsSectionProps) {
  const p = clampKitProgress(progress, reducedMotion);
  return (
    <section
      className="ka-section ka-metrics"
      data-kit-section="metrics"
      data-progress={p}
      aria-label="Instagram demo metrics"
    >
      <header className="ka-account-header">
        <div className="ka-account-identity">
          <img
            className="ka-account-avatar"
            src={KIT_ANALYTICS_PROFILE.portrait}
            alt=""
            loading="lazy"
          />
          <div>
            <h3>Instagram</h3>
            <p>
              {KIT_ANALYTICS_PROFILE.name}
              <span aria-hidden="true"> · </span>
              <span>{KIT_ANALYTICS_PROFILE.handle}</span>
            </p>
          </div>
        </div>
        <span className="ka-period">{KIT_ANALYTICS_PROFILE.period}</span>
      </header>
      <dl className="ka-metric-grid">
        {KIT_METRICS.map((metric) => (
          <div className="ka-metric-card" key={metric.id}>
            <dt>{metric.label}</dt>
            <dd>
              <span className="ka-icon-box">
                <MetricIcon name={metric.id} />
              </span>
              <Counter value={metric.value} progress={p} />
              <MetricShield />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

const PLOT_WIDTH = 704;
const PLOT_HEIGHT = 176;
const low = Math.min(...KIT_FOLLOWER_HISTORY.map((point) => point.followers));
const high = Math.max(...KIT_FOLLOWER_HISTORY.map((point) => point.followers));
const growthPoints = KIT_FOLLOWER_HISTORY.map((point, index) => ({
  x: 8 + (index / (KIT_FOLLOWER_HISTORY.length - 1)) * (PLOT_WIDTH - 16),
  y: 144 - ((point.followers - low) / Math.max(high - low, 1)) * 120,
}));

// A fixed curve, revealed with an SVG clip controlled only by the supplied progress.
const curvePath = growthPoints.reduce((path, point, index, points) => {
  if (index === 0) return `M ${point.x} ${point.y}`;
  const previous = points[index - 1];
  const before = points[Math.max(0, index - 2)];
  const after = points[Math.min(points.length - 1, index + 1)];
  const first = {
    x: previous.x + (point.x - before.x) / 6,
    y: previous.y + (point.y - before.y) / 6,
  };
  const second = {
    x: point.x - (after.x - previous.x) / 6,
    y: point.y - (after.y - previous.y) / 6,
  };
  return `${path} C ${first.x} ${first.y}, ${second.x} ${second.y}, ${point.x} ${point.y}`;
}, "");
const areaPath = `${curvePath} L ${growthPoints.at(-1)!.x} ${PLOT_HEIGHT} L ${growthPoints[0].x} ${PLOT_HEIGHT} Z`;

export function KitGrowth({
  progress,
  reducedMotion = false,
}: KitAnalyticsSectionProps) {
  const p = clampKitProgress(progress, reducedMotion);
  const identity = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const clipId = `ka-growth-clip-${identity}`;
  const titleId = `ka-growth-title-${identity}`;
  const descriptionId = `ka-growth-description-${identity}`;
  return (
    <section
      className="ka-section ka-growth"
      data-kit-section="growth"
      data-progress={p}
      aria-label="Illustrative follower growth"
    >
      <div className="ka-growth-card">
        <div className="ka-growth-heading">
          <div>
            <h3>Total followers</h3>
            <p className="ka-followers">
              <Counter value={KIT_ANALYTICS_PROFILE.followers} progress={p} />
            </p>
          </div>
          <span className="ka-chart-tag">Illustrative trend</span>
        </div>
        <p className="ka-follower-gain">
          <Counter
            value={KIT_ANALYTICS_PROFILE.followerGrowth}
            progress={p}
            compact={false}
            prefix="+"
          />{" "}
          <span>illustrative growth</span>
        </p>
        <svg
          className="ka-growth-chart"
          viewBox={`0 0 ${PLOT_WIDTH} ${PLOT_HEIGHT}`}
          preserveAspectRatio="none"
          role="img"
          aria-labelledby={`${titleId} ${descriptionId}`}
        >
          <title id={titleId}>Illustrative Instagram follower growth</title>
          <desc id={descriptionId}>
            January to December demo trend. Final total:{" "}
            {KIT_ANALYTICS_PROFILE.followers.toLocaleString("en-US")} followers,
            with an illustrative increase of{" "}
            {KIT_ANALYTICS_PROFILE.followerGrowth.toLocaleString("en-US")} in
            the final period.
          </desc>
          <defs>
            <clipPath id={clipId}>
              <rect width={PLOT_WIDTH * p} height={PLOT_HEIGHT + 4} y="-2" />
            </clipPath>
          </defs>
          <g aria-hidden="true">
            {[40, 94, 148].map((y) => (
              <line
                key={y}
                x1="0"
                x2={PLOT_WIDTH}
                y1={y}
                y2={y}
                className="ka-chart-gridline"
              />
            ))}
            <g clipPath={`url(#${clipId})`}>
              <path className="ka-chart-area" d={areaPath} />
              <path className="ka-chart-line" d={curvePath} />
              {growthPoints.map((point, index) => (
                <circle
                  key={KIT_FOLLOWER_HISTORY[index].month}
                  cx={point.x}
                  cy={point.y}
                  r={index === growthPoints.length - 1 ? 4 : 2.6}
                  className="ka-chart-point"
                />
              ))}
            </g>
          </g>
        </svg>
        <div className="ka-chart-months" aria-hidden="true">
          {KIT_FOLLOWER_HISTORY.map(({ month }) => (
            <span key={month}>{month}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Distribution({
  title,
  rows,
  progress,
  kind,
}: {
  title: string;
  rows: { label: string; percent: number }[];
  progress: number;
  kind: "age" | "gender";
}) {
  return (
    <div className={`ka-demographic-card ka-demographic-${kind}`}>
      <h3>{title}</h3>
      <dl className="ka-distribution">
        {rows.map((row, index) => {
          const p = kitBarProgress(progress, index, rows.length);
          return (
            <div className="ka-distribution-row" key={row.label}>
              <dt>{row.label}</dt>
              <dd>
                <span className="ka-bar-track" aria-hidden="true">
                  <span
                    className="ka-bar-value"
                    style={{
                      width: `${row.percent}%`,
                      transform: `scaleX(${p})`,
                    }}
                  />
                </span>
                <span className="ka-percentage">
                  <span aria-hidden="true">
                    {p > 0 ? Math.max(1, Math.round(row.percent * p)) : 0}%
                  </span>
                  <span className="ka-sr-only">{row.percent}%</span>
                </span>
              </dd>
            </div>
          );
        })}
      </dl>
      <p className="ka-demographic-note">Illustrative demo audience</p>
    </div>
  );
}

export function KitAudience({
  progress,
  reducedMotion = false,
}: KitAnalyticsSectionProps) {
  const p = clampKitProgress(progress, reducedMotion);
  return (
    <section
      className="ka-section ka-audience"
      data-kit-section="audience"
      data-progress={p}
      aria-label="Illustrative audience demographics"
    >
      <div className="ka-audience-grid">
        <Distribution
          title="Age distribution"
          rows={KIT_AGE_DISTRIBUTION}
          progress={p}
          kind="age"
        />
        <Distribution
          title="Gender distribution"
          rows={KIT_GENDER_DISTRIBUTION}
          progress={p}
          kind="gender"
        />
      </div>
    </section>
  );
}

export function KitAnalytics({
  metricsProgress,
  growthProgress,
  audienceProgress,
  reducedMotion = false,
}: {
  metricsProgress: number;
  growthProgress: number;
  audienceProgress: number;
  reducedMotion?: boolean;
}) {
  return (
    <div className="ka-analytics">
      <KitMetrics progress={metricsProgress} reducedMotion={reducedMotion} />
      <KitGrowth progress={growthProgress} reducedMotion={reducedMotion} />
      <KitAudience progress={audienceProgress} reducedMotion={reducedMotion} />
    </div>
  );
}
