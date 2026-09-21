import type { CSSProperties } from "react";
import {
  CAPTION_COLOR_SWATCHES,
  CAPTION_FONT_OPTIONS,
  CAPTION_PRESETS,
  type TileCaptionSettings,
} from "../data/stagedTalent";
import { LabIcon } from "./TalentLabIcon";

type Props = {
  settings: TileCaptionSettings;
  onChange: (settings: TileCaptionSettings) => void;
  onReset: () => void;
};

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="tl-caption-colour">
      <legend>{label}</legend>
      <div className="tl-caption-swatches">
        {CAPTION_COLOR_SWATCHES.map((swatch) => (
          <button
            key={swatch.value}
            type="button"
            className="tl-caption-swatch"
            style={{ "--swatch-colour": swatch.value } as CSSProperties}
            onClick={() => onChange(swatch.value)}
            aria-label={`${label}: ${swatch.label}`}
            aria-pressed={value.toLowerCase() === swatch.value}
            title={swatch.label}
          />
        ))}
        <label
          className="tl-caption-custom-colour"
          title={`Custom ${label.toLowerCase()}`}
        >
          <input
            type="color"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            aria-label={`Custom ${label.toLowerCase()}`}
          />
          <span aria-hidden="true">+</span>
        </label>
      </div>
    </fieldset>
  );
}

function AlignmentIcon({ align }: { align: TileCaptionSettings["align"] }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={
          align === "left"
            ? "M3 4h14M3 8h9M3 12h14M3 16h9"
            : align === "right"
              ? "M3 4h14M8 8h9M3 12h14M8 16h9"
              : "M3 4h14M6 8h8M3 12h14M6 16h8"
        }
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function TalentCaptionControls({ settings, onChange, onReset }: Props) {
  const update = (patch: Partial<TileCaptionSettings>) =>
    onChange({ ...settings, ...patch });
  const hasBackground = settings.background !== "none";
  const activePreset = CAPTION_PRESETS.find((preset) =>
    Object.entries(preset.settings).every(
      ([key, value]) => settings[key as keyof TileCaptionSettings] === value,
    ),
  )?.id;
  return (
    <section
      className="tl-caption-controls tl-caption-studio"
      aria-label="Caption studio"
    >
      <div className="tl-control-heading">
        <div>
          <h3>Caption studio</h3>
          <p>Give your words a little character.</p>
        </div>
        <label className="tl-switch">
          <input
            type="checkbox"
            checked={settings.visible}
            onChange={(event) => update({ visible: event.target.checked })}
          />
          <span className="tl-sr-only">Show caption</span>
          <span className="tl-switch-track" />
        </label>
      </div>
      <label className="tl-caption-field">
        <span>Your caption</span>
        <textarea
          rows={2}
          maxLength={1000}
          value={settings.text}
          placeholder="Add a thought, a hook, a little context…"
          onChange={(event) => update({ text: event.target.value })}
        />
      </label>
      <fieldset className="tl-caption-presets">
        <legend>Start with a style</legend>
        <div className="tl-caption-preset-grid">
          {CAPTION_PRESETS.map((preset) => {
            const style = preset.settings;
            const previewStyle: CSSProperties = {
              fontFamily: CAPTION_FONT_OPTIONS.find(
                (font) => font.id === style.font,
              )?.css,
              fontWeight: style.weight,
              fontStyle: style.italic ? "italic" : "normal",
              textTransform: style.uppercase ? "uppercase" : "none",
              fontSize: Math.min(20, Math.max(11, style.size * 0.72)),
              color: style.fill,
              backgroundColor:
                style.background === "none"
                  ? "transparent"
                  : style.backgroundColor,
              borderRadius: Math.min(style.radius, 4),
              padding: style.background === "none" ? 0 : "2px 4px",
              WebkitTextStroke: style.strokeWidth
                ? `0.5px ${style.stroke}`
                : undefined,
              paintOrder: "stroke fill",
            };
            return (
              <button
                className="tl-caption-preset"
                type="button"
                key={preset.id}
                aria-label={`${preset.label} caption style`}
                aria-pressed={activePreset === preset.id}
                onClick={() =>
                  onChange({
                    ...settings,
                    ...preset.settings,
                    text: settings.text,
                    x: settings.x,
                    y: settings.y,
                    visible: true,
                  })
                }
              >
                <span className="tl-caption-preset-art" aria-hidden="true">
                  <span style={previewStyle}>{preset.sample}</span>
                </span>
                <span className="tl-caption-preset-name">
                  {preset.label}
                  {activePreset === preset.id && (
                    <LabIcon name="check" size={11} />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>
      <label className="tl-caption-field">
        <span>Typeface</span>
        <select
          value={settings.font}
          onChange={(event) =>
            update({ font: event.target.value as TileCaptionSettings["font"] })
          }
        >
          {CAPTION_FONT_OPTIONS.map((font) => (
            <option key={font.id} value={font.id}>
              {font.label}
            </option>
          ))}
        </select>
      </label>
      <div className="tl-caption-type-controls">
        <label className="tl-caption-field">
          <span>Size</span>
          <input
            type="number"
            min={10}
            max={36}
            step={1}
            value={settings.size}
            onChange={(event) => {
              const value = event.target.valueAsNumber;
              if (Number.isFinite(value))
                update({ size: Math.min(36, Math.max(10, value)) });
            }}
          />
        </label>
        <label className="tl-caption-field">
          <span>Weight</span>
          <select
            value={settings.weight}
            onChange={(event) =>
              update({
                weight: Number(
                  event.target.value,
                ) as TileCaptionSettings["weight"],
              })
            }
          >
            <option value={400}>Regular</option>
            <option value={600}>Semibold</option>
            <option value={800}>Bold</option>
          </select>
        </label>
        <div
          className="tl-caption-emphasis"
          role="group"
          aria-label="Text emphasis"
        >
          <button
            type="button"
            aria-label="Italic"
            aria-pressed={settings.italic}
            onClick={() => update({ italic: !settings.italic })}
          >
            <i aria-hidden="true">I</i>
          </button>
          <button
            type="button"
            aria-label="Uppercase"
            aria-pressed={settings.uppercase}
            onClick={() => update({ uppercase: !settings.uppercase })}
          >
            <span aria-hidden="true">AA</span>
          </button>
        </div>
      </div>
      <div className="tl-caption-alignment-row">
        <span>Alignment</span>
        <div
          className="tl-caption-segments"
          role="group"
          aria-label="Text alignment"
        >
          {(["left", "center", "right"] as const).map((align) => (
            <button
              key={align}
              type="button"
              aria-label={`Align ${align}`}
              aria-pressed={settings.align === align}
              onClick={() => update({ align })}
            >
              <AlignmentIcon align={align} />
            </button>
          ))}
        </div>
      </div>
      <ColorPicker
        label="Text colour"
        value={settings.fill}
        onChange={(fill) => update({ fill })}
      />
      <fieldset className="tl-caption-background">
        <legend>Text background</legend>
        <div
          className="tl-caption-segments"
          role="group"
          aria-label="Text background style"
        >
          {(
            [
              { value: "none", label: "None" },
              { value: "box", label: "Box" },
              { value: "highlight", label: "Highlight" },
            ] as const
          ).map((item) => (
            <button
              type="button"
              key={item.value}
              aria-pressed={settings.background === item.value}
              onClick={() => update({ background: item.value })}
            >
              {item.label}
            </button>
          ))}
        </div>
      </fieldset>
      {hasBackground && (
        <ColorPicker
          label="Background colour"
          value={settings.backgroundColor}
          onChange={(backgroundColor) => update({ backgroundColor })}
        />
      )}
      <details className="tl-caption-advanced">
        <summary>
          <span>Position & finishing touches</span>
          <LabIcon name="chevron" size={14} />
        </summary>
        <div>
          {(
            [
              {
                key: "x",
                label: "Horizontal position",
                min: 10,
                max: 90,
                unit: "%",
              },
              {
                key: "y",
                label: "Vertical position",
                min: 10,
                max: 90,
                unit: "%",
              },
              {
                key: "strokeWidth",
                label: "Outline width",
                min: 0,
                max: 6,
                unit: "",
                step: 0.5,
              },
              ...(hasBackground
                ? [
                    {
                      key: "backgroundOpacity" as const,
                      label: "Background opacity",
                      min: 0,
                      max: 100,
                      unit: "%",
                    },
                    {
                      key: "padding" as const,
                      label: "Background padding",
                      min: 0,
                      max: 18,
                      unit: "px",
                    },
                    {
                      key: "radius" as const,
                      label: "Corner radius",
                      min: 0,
                      max: 24,
                      unit: "px",
                    },
                  ]
                : []),
            ] as const
          ).map((control) => (
            <label className="tl-caption-range" key={control.key}>
              <span>
                {control.label}
                <output>
                  {settings[control.key]}
                  {control.unit}
                </output>
              </span>
              <input
                type="range"
                aria-label={control.label}
                min={control.min}
                max={control.max}
                step={"step" in control ? control.step : 1}
                value={settings[control.key]}
                onChange={(event) =>
                  update({ [control.key]: Number(event.target.value) })
                }
              />
            </label>
          ))}
          <label className="tl-caption-outline-colour">
            Outline colour
            <input
              type="color"
              value={settings.stroke}
              onChange={(event) => update({ stroke: event.target.value })}
            />
          </label>
        </div>
      </details>
      <div className="tl-caption-reset-row">
        <button type="button" className="tl-text-button" onClick={onReset}>
          <LabIcon name="reset" size={14} /> Reset caption
        </button>
        <span>Saved in this browser</span>
      </div>
      <p className="tl-draft-note">
        Export a captioned image or character data to take your edits with you.
      </p>
    </section>
  );
}
