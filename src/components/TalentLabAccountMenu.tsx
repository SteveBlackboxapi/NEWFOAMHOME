import { useEffect, useRef, useState } from "react";
import { LabIcon } from "./TalentLabIcon";

export function TalentLabAccountMenu({ onSettings, settingsActive }: {
  onSettings: () => void;
  settingsActive: boolean;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const settings = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    settings.current?.focus();
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  return (
    <div className="tl-account" ref={root} onBlur={(event) => {
      if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }} onKeyDown={(event) => {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
        event.stopPropagation();
      } else if (open && ["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
        event.preventDefault();
        settings.current?.focus();
      }
    }}>
      <button className={`tl-avatar tl-account-trigger ${settingsActive ? "is-active" : ""}`} ref={trigger}
        type="button" aria-label="Open workspace menu" aria-haspopup="menu"
        aria-controls="tl-account-menu" aria-expanded={open} title="Workspace menu"
        onClick={() => setOpen((value) => !value)} onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setOpen(true); }
        }}>
        <span aria-hidden="true">FL</span>
      </button>
      {open && (
        <div id="tl-account-menu" className="tl-account-menu" role="menu" aria-label="Workspace menu">
          <div className="tl-account-identity" role="presentation">
            <strong>Foam Lab</strong><span>Your workspace</span>
          </div>
          <button ref={settings} type="button" role="menuitem" onClick={() => { setOpen(false); onSettings(); }}>
            <LabIcon name="settings" size={18} /> Settings <LabIcon name="arrow" size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
