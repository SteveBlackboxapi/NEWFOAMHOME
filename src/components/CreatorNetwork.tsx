import { useEffect, useId, useRef } from "react";
import "./creator-network.css";

type Point = { x: number; y: number; z: number };

// A fixed, evenly distributed constellation keeps the first frame stable.
const POINTS: Point[] = Array.from({ length: 144 }, (_, index) => {
  const y = 1 - (index + 0.5) * (2 / 144);
  const radius = Math.sqrt(1 - y * y);
  const angle = index * Math.PI * (3 - Math.sqrt(5));
  return { x: Math.cos(angle) * radius, y, z: Math.sin(angle) * radius };
});

const CONNECTIONS = (() => {
  const pairs = new Map<string, [number, number]>();
  POINTS.forEach((point, index) => {
    POINTS.map((other, otherIndex) => ({
      index: otherIndex,
      distance: (point.x - other.x) ** 2 + (point.y - other.y) ** 2 + (point.z - other.z) ** 2,
    }))
      .filter((other) => other.index !== index)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 2)
      .forEach((other) => {
        const pair: [number, number] = [Math.min(index, other.index), Math.max(index, other.index)];
        pairs.set(pair.join(":"), pair);
      });
  });
  return [...pairs.values()];
})();

function project(point: Point, angle: number) {
  const x = point.x * Math.cos(angle) + point.z * Math.sin(angle);
  const turnedZ = point.z * Math.cos(angle) - point.x * Math.sin(angle);
  const tilt = 0.28;
  const y = point.y * Math.cos(tilt) - turnedZ * Math.sin(tilt);
  const z = point.y * Math.sin(tilt) + turnedZ * Math.cos(tilt);
  const perspective = 1 / (1 - z * 0.12);
  return {
    x: 128 + x * 103 * perspective,
    y: 128 + y * 103 * perspective,
    depth: (z + 1) / 2,
  };
}

const INITIAL_POINTS = POINTS.map((point) => project(point, 0.4));
const IDLE_SPEED = 0.045;
const HOVER_SPEED = 0.012;
const MAX_SPIN_SPEED = 0.9;
const clampSpin = (speed: number) => Math.max(-MAX_SPIN_SPEED, Math.min(MAX_SPIN_SPEED, speed));

/** A quiet, draggable expression of many creators connected through Foam. */
export function CreatorNetwork({ className = "" }: { className?: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const id = useId();

  useEffect(() => {
    const element = svg.current;
    if (!element) return;
    const nodes = [...element.querySelectorAll<SVGCircleElement>("[data-network-node]")];
    const lines = [...element.querySelectorAll<SVGLineElement>("[data-network-link]")];
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = !("IntersectionObserver" in window);
    let frame = 0;
    let lastFrame = 0;
    let angle = 0.4;
    let hovered = false;
    let speed = IDLE_SPEED;
    let pointer: {
      id: number;
      startX: number;
      startY: number;
      lastX: number;
      lastTime: number;
      dragged: boolean;
    } | null = null;

    const draw = () => {
      const projected = POINTS.map((point) => project(point, angle));
      projected.forEach((point, index) => {
        const node = nodes[index];
        node.setAttribute("cx", point.x.toFixed(2));
        node.setAttribute("cy", point.y.toFixed(2));
        node.setAttribute("r", (1.3 + point.depth * 1.25).toFixed(2));
        node.setAttribute("opacity", (0.18 + point.depth * 0.74).toFixed(3));
      });
      CONNECTIONS.forEach(([a, b], index) => {
        const start = projected[a];
        const end = projected[b];
        const line = lines[index];
        line.setAttribute("x1", start.x.toFixed(2));
        line.setAttribute("y1", start.y.toFixed(2));
        line.setAttribute("x2", end.x.toFixed(2));
        line.setAttribute("y2", end.y.toFixed(2));
        line.setAttribute("opacity", (0.025 + Math.min(start.depth, end.depth) * 0.115).toFixed(3));
      });
    };

    const tick = (time: number) => {
      // Thirty frames per second is ample for this slow, continuous movement.
      if (!lastFrame) lastFrame = time;
      const elapsed = time - lastFrame;
      if (elapsed >= 1000 / 30) {
        const seconds = Math.min(elapsed, 100) / 1000;
        if (!pointer) {
          const target = hovered ? HOVER_SPEED : IDLE_SPEED;
          // Release momentum settles smoothly back into the quiet idle orbit.
          speed += (target - speed) * (1 - Math.exp(-seconds / 0.85));
          angle += speed * seconds;
        }
        lastFrame = time;
        if (!pointer) draw();
      }
      frame = window.requestAnimationFrame(tick);
    };

    const finishDrag = (withMomentum: boolean) => {
      const active = pointer;
      pointer = null;
      element.removeAttribute("data-dragging");
      if (active && element.hasPointerCapture(active.id)) {
        element.releasePointerCapture(active.id);
      }
      if (!withMomentum || motion.matches) speed = hovered ? HOVER_SPEED : IDLE_SPEED;
    };

    const enter = (event: PointerEvent) => {
      if (event.pointerType !== "touch") hovered = true;
    };
    const leave = () => { hovered = false; };
    const down = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0 || pointer) return;
      element.setAttribute("data-pointer-focus", "");
      pointer = {
        id: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        lastX: event.clientX,
        lastTime: event.timeStamp,
        dragged: false,
      };
      speed = 0;
      element.setAttribute("data-dragging", "");
      element.setPointerCapture(event.pointerId);
      if (event.pointerType === "mouse") {
        element.focus({ preventScroll: true });
        event.preventDefault();
      }
    };
    const move = (event: PointerEvent) => {
      if (!pointer || pointer.id !== event.pointerId) return;
      const across = event.clientX - pointer.startX;
      const downwards = event.clientY - pointer.startY;
      if (!pointer.dragged) {
        // A vertical touch belongs to the page; horizontal movement spins the sphere.
        if (event.pointerType === "touch" && Math.abs(downwards) > 8 && Math.abs(downwards) > Math.abs(across)) {
          finishDrag(false);
          return;
        }
        if (Math.abs(across) < 4) return;
        pointer.dragged = true;
      }
      const sensitivity = Math.PI * 1.25 / Math.max(element.clientWidth, 120);
      const delta = (event.clientX - pointer.lastX) * sensitivity;
      const seconds = Math.max((event.timeStamp - pointer.lastTime) / 1000, 1 / 120);
      angle += delta;
      speed = clampSpin(speed * 0.35 + (delta / seconds) * 0.65);
      pointer.lastX = event.clientX;
      pointer.lastTime = event.timeStamp;
      draw();
    };
    const up = (event: PointerEvent) => {
      if (!pointer || pointer.id !== event.pointerId) return;
      const bounds = element.getBoundingClientRect();
      hovered = event.pointerType !== "touch"
        && event.clientX >= bounds.left && event.clientX <= bounds.right
        && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
      // Letting go after holding still should not restart an old fling.
      finishDrag(pointer.dragged && event.timeStamp - pointer.lastTime < 120);
    };
    const cancel = () => { if (pointer) finishDrag(false); };
    const keydown = (event: KeyboardEvent) => {
      element.removeAttribute("data-pointer-focus");
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      finishDrag(false);
      const direction = event.key === "ArrowRight" ? 1 : -1;
      angle += direction * 0.2;
      speed = motion.matches ? 0 : direction * 0.45;
      draw();
    };
    const blur = () => { element.removeAttribute("data-pointer-focus"); };

    const sync = () => {
      window.cancelAnimationFrame(frame);
      lastFrame = 0;
      if (!visible || document.hidden) finishDrag(false);
      if (motion.matches) speed = 0;
      if (visible && !document.hidden && !motion.matches) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    const observer = "IntersectionObserver" in window
      ? new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          sync();
        }, { threshold: 0.05 })
      : null;
    observer?.observe(element);
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", sync);
    element.addEventListener("pointerenter", enter);
    element.addEventListener("pointerleave", leave);
    element.addEventListener("pointerdown", down);
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerup", up);
    element.addEventListener("pointercancel", cancel);
    element.addEventListener("lostpointercapture", cancel);
    element.addEventListener("keydown", keydown);
    element.addEventListener("blur", blur);
    sync();
    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", sync);
      element.removeEventListener("pointerenter", enter);
      element.removeEventListener("pointerleave", leave);
      element.removeEventListener("pointerdown", down);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerup", up);
      element.removeEventListener("pointercancel", cancel);
      element.removeEventListener("lostpointercapture", cancel);
      element.removeEventListener("keydown", keydown);
      element.removeEventListener("blur", blur);
      finishDrag(false);
    };
  }, []);

  return (
    <svg
      ref={svg}
      className={`creator-network ${className}`.trim()}
      viewBox="0 0 256 256"
      role="img"
      aria-labelledby={`${id}-title ${id}-description`}
      aria-keyshortcuts="ArrowLeft ArrowRight"
      tabIndex={0}
    >
      <title id={`${id}-title`}>A world of connections</title>
      <desc id={`${id}-description`}>
        A sphere of connected creators. Hover to slow it down, or drag left and right to give it a gentle spin. Use the left and right arrow keys when focused. With reduced motion, it moves only when you drag or use the arrow keys.
      </desc>
      <circle cx="128" cy="128" r="112" fill="transparent" pointerEvents="all" aria-hidden="true" />
      <g className="creator-network-links" aria-hidden="true">
        {CONNECTIONS.map(([a, b]) => (
          <line
            key={`${a}-${b}`}
            data-network-link=""
            x1={INITIAL_POINTS[a].x}
            y1={INITIAL_POINTS[a].y}
            x2={INITIAL_POINTS[b].x}
            y2={INITIAL_POINTS[b].y}
            opacity={0.025 + Math.min(INITIAL_POINTS[a].depth, INITIAL_POINTS[b].depth) * 0.115}
          />
        ))}
      </g>
      <g aria-hidden="true">
        {INITIAL_POINTS.map((point, index) => (
          <circle
            key={index}
            data-network-node=""
            className={index % 13 === 0 ? "creator-network-dot-lime" : index % 4 === 0 ? "creator-network-dot-blue" : undefined}
            cx={point.x}
            cy={point.y}
            r={1.3 + point.depth * 1.25}
            opacity={0.18 + point.depth * 0.74}
          />
        ))}
      </g>
    </svg>
  );
}
