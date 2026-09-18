import { Link } from "react-router";
import { FG_R, FG_M, FG_SB } from "../lib/assets";

export function NotFound() {
  return (
    <section className="min-h-[80vh] flex items-center justify-center px-6 bg-surface">
      <div className="text-center max-w-[480px]">
        <div className={`${FG_SB} text-[120px] leading-none tracking-[-4px] text-border mb-6`}>404</div>
        <h1 className={`${FG_SB} text-[36px] leading-tight tracking-[-0.8px] text-text mb-4`}>Nothing here</h1>
        <p className={`${FG_R} text-base leading-7 text-muted mb-10`}>
          The page you're looking for doesn't exist — or it moved.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/managers" className={`${FG_M} bg-brand text-white text-[15px] px-7 h-11 rounded-full flex items-center hover:bg-brand-hover transition-colors`}>For managers</Link>
          <Link to="/features" className={`${FG_M} bg-raised border border-border text-text text-[15px] px-7 h-11 rounded-full flex items-center hover:bg-border transition-colors`}>See features</Link>
        </div>
      </div>
    </section>
  );
}
