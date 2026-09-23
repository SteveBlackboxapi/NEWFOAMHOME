import "./kit-audience-continuation.css";

const LOCATION_GROUPS = [
  {
    title: "Top countries",
    rows: [
      { label: "United States", percent: 48 },
      { label: "United Kingdom", percent: 16 },
      { label: "Canada", percent: 12 },
      { label: "Australia", percent: 9 },
      { label: "Other", percent: 15 },
    ],
  },
  {
    title: "Top cities",
    rows: [
      { label: "Los Angeles", percent: 18 },
      { label: "New York", percent: 13 },
      { label: "London", percent: 9 },
      { label: "Toronto", percent: 7 },
      { label: "Other", percent: 53 },
    ],
  },
];

/** Further illustrative kit detail continues beneath the editor's clipped edge. */
export function KitAudienceContinuation() {
  return (
    <section
      className="ka-section ka-continuation"
      data-kit-continuation
      aria-label="Illustrative audience locations"
    >
      <div className="ka-audience-grid">
        {LOCATION_GROUPS.map(({ title, rows }) => (
          <div className="ka-demographic-card ka-location-card" key={title}>
            <h3>{title}</h3>
            <dl className="ka-distribution">
              {rows.map(({ label, percent }) => (
                <div className="ka-distribution-row" key={label}>
                  <dt>{label}</dt>
                  <dd>
                    <span className="ka-bar-track" aria-hidden="true">
                      <span
                        className="ka-bar-value"
                        style={{ width: `${percent}%` }}
                      />
                    </span>
                    <span className="ka-percentage">{percent}%</span>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="ka-demographic-note">Illustrative demo audience</p>
          </div>
        ))}
      </div>
    </section>
  );
}
