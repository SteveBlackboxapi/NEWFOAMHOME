import { useCallback, useEffect, useRef, useState } from 'react';

export type TalentSearchPhase = 'suggestions' | 'typing' | 'reviewing' | 'results';

export const TALENT_SEARCH_PHASE_MS: Record<TalentSearchPhase, number> = {
  suggestions: 1300,
  typing: 900,
  reviewing: 1400,
  results: 5000,
};

export interface TalentSearchSequenceState {
  active: number;
  phase: TalentSearchPhase;
  elapsed: number;
  manual: boolean;
  userPaused: boolean;
}

export function createTalentSearchSequence(reducedMotion = false): TalentSearchSequenceState {
  return {
    active: 0,
    phase: reducedMotion ? 'results' : 'suggestions',
    elapsed: reducedMotion ? TALENT_SEARCH_PHASE_MS.results : 0,
    manual: reducedMotion,
    userPaused: false,
  };
}

export function talentSearchIsPaused(state: TalentSearchSequenceState) {
  return state.userPaused || (state.manual && state.phase === 'results');
}

/** Advance only by elapsed time while visible; a manual example stops at its results. */
export function advanceTalentSearchSequence(
  state: TalentSearchSequenceState,
  delta: number,
  exampleCount: number,
): TalentSearchSequenceState {
  if (talentSearchIsPaused(state) || exampleCount < 1 || !Number.isFinite(delta) || delta <= 0) return state;
  let next = { ...state, elapsed: state.elapsed + delta };
  while (next.elapsed >= TALENT_SEARCH_PHASE_MS[next.phase]) {
    next.elapsed -= TALENT_SEARCH_PHASE_MS[next.phase];
    if (next.phase === 'suggestions') next.phase = 'typing';
    else if (next.phase === 'typing') next.phase = 'reviewing';
    else if (next.phase === 'reviewing') {
      next.phase = 'results';
      if (next.manual) return { ...next, elapsed: TALENT_SEARCH_PHASE_MS.results };
    } else {
      next.active = (next.active + 1) % exampleCount;
      next.phase = 'suggestions';
    }
  }
  return next;
}

export function talentSearchSequenceView(state: TalentSearchSequenceState, reviewTotal: number) {
  const progress = Math.min(1, Math.max(0, state.elapsed / TALENT_SEARCH_PHASE_MS[state.phase]));
  const total = Number.isFinite(reviewTotal) ? Math.max(0, Math.round(reviewTotal)) : 0;
  const reviewed = state.phase === 'results' ? total
    : state.phase === 'reviewing' ? Math.min(total, Math.round(total * (1 - (1 - progress) ** 3)))
    : 0;
  return { active: state.active, phase: state.phase, progress, reviewed, paused: talentSearchIsPaused(state) };
}

/** Owns one cancellable animation frame loop, suspended while hidden or paused. */
export function useTalentSearchSequence({ exampleCount, enabled, reducedMotion, reviewTotal }: {
  exampleCount: number;
  enabled: boolean;
  reducedMotion: boolean | null;
  reviewTotal: number;
}) {
  const [state, setState] = useState(() => createTalentSearchSequence(reducedMotion === true));
  const current = useRef(state);
  const lastFrame = useRef<number | null>(null);
  const paused = talentSearchIsPaused(state);

  const commit = useCallback((next: TalentSearchSequenceState) => {
    current.current = next;
    setState(next);
  }, []);

  const selectExample = useCallback((index: number) => {
    if (!Number.isInteger(index) || index < 0 || index >= exampleCount) return;
    lastFrame.current = null;
    commit({
      active: index,
      phase: reducedMotion === true ? 'results' : 'typing',
      elapsed: reducedMotion === true ? TALENT_SEARCH_PHASE_MS.results : 0,
      manual: true,
      userPaused: false,
    });
  }, [commit, exampleCount, reducedMotion]);

  const togglePaused = useCallback(() => {
    if (reducedMotion === true) return;
    lastFrame.current = null;
    const before = current.current;
    if (before.manual && before.phase === 'results') {
      commit({ ...before, manual: false, userPaused: false, elapsed: 0 });
    } else {
      commit({ ...before, userPaused: !before.userPaused });
    }
  }, [commit, reducedMotion]);

  useEffect(() => {
    lastFrame.current = null;
    if (reducedMotion === true) {
      const before = current.current;
      if (before.phase !== 'results' || !before.manual || before.userPaused) {
        commit({ ...createTalentSearchSequence(true), active: before.active });
      }
      return;
    }
    // Wait for the motion preference before starting, including on the first paint.
    if (!enabled || reducedMotion === null || paused || exampleCount < 1) return;
    let cancelled = false;
    let frame = 0;
    const tick = (now: number) => {
      if (cancelled) return;
      if (lastFrame.current !== null) {
        const next = advanceTalentSearchSequence(current.current, now - lastFrame.current, exampleCount);
        if (next !== current.current) commit(next);
      }
      lastFrame.current = now;
      if (!talentSearchIsPaused(current.current)) frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      lastFrame.current = null;
    };
  }, [commit, enabled, exampleCount, paused, reducedMotion]);

  const view = talentSearchSequenceView(state, reviewTotal);
  // A preference change takes effect in the same render, before the effect settles state.
  return {
    ...(reducedMotion === true ? talentSearchSequenceView({ ...createTalentSearchSequence(true), active: state.active }, reviewTotal) : view),
    selectExample,
    togglePaused,
  };
}
