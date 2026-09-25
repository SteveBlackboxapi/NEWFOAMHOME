import { OptimizedImage } from "../OptimizedImage";
import { A } from "../../lib/assets";
import { MiniAccounts, MiniAvatar, MiniBar, MiniFoamMark, MiniIcon } from "./MiniPrimitives";
import "./mini-chrome.css";

/** A decorative email and extension pairing; the enclosing card owns the CTA. */
export function MiniChromeScene() {
  return (
    <div className="mui-chrome-scene">
      <div className="mui-card mui-chrome-browser">
        <div className="mui-chrome-toolbar">
          <span className="mui-chrome-window-dots"><i /><i /><i /></span>
          <span className="mui-chrome-address"><MiniIcon name="mail" size={12} /> Your inbox</span>
          <MiniFoamMark size={21} />
        </div>
        <div className="mui-chrome-email">
          <div className="mui-chrome-mail-title"><MiniIcon name="mail" size={21} /><strong>A good fit for the brief?</strong></div>
          <div className="mui-chrome-sender"><span>R</span><div><strong>Rose</strong><small>to you</small></div></div>
          <div className="mui-chrome-mail-lines"><MiniBar width={197} /><MiniBar width={172} /><MiniBar width={130} /></div>
          <div className="mui-chrome-reply"><MiniIcon name="mail" size={14} /> Reply</div>
        </div>
      </div>

      <div className="mui-card mui-chrome-extension">
        <div className="mui-chrome-brand"><MiniFoamMark size={29} /><strong>foam</strong><MiniIcon name="close" size={14} /></div>
        <div className="mui-chrome-search"><MiniIcon name="search" size={15} /><span>Find your talent</span></div>
        <div className="mui-chrome-person"><MiniAvatar person="samantha" size={45} /><div><strong>Samantha Pikka</strong><span>Beauty · Lifestyle</span></div></div>
        <div className="mui-chrome-profile-lines"><MiniAccounts person="samantha" size={18} /></div>
        <span className="mui-chrome-copy"><MiniIcon name="copy" size={16} /> Copy profile</span>
      </div>

      <div className="mui-card mui-chrome-store">
        <OptimizedImage sizes="42px" src={`${A}/chrome-store-transparent.webp`} width="42" height="42" alt="" loading="lazy" decoding="async" />
        <div><strong>Made for Chrome.</strong><span>Meet your inbox’s plus-one.</span></div>
      </div>
      <span className="mui-chrome-ready"><MiniIcon name="check" size={13} /> Ready to reply</span>
    </div>
  );
}
