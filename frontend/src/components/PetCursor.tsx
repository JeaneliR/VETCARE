
import { useEffect, useRef, useState } from "react";

type Pet = "cat" | "dog";
type Direction = "left" | "right";

export default function PetCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [pet, setPet] = useState<Pet>("cat");
  const [direction, setDirection] = useState<Direction>("right");
  const [selecting, setSelecting] = useState(false);
  const [idle, setIdle] = useState(false);

  const lastX = useRef(0);
  const lastChange = useRef(Date.now());
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const styleRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) {
      return;
    }

    // Oculta el cursor normal únicamente cuando este componente existe.
    const style = document.createElement("style");
    style.textContent = `
      @media (hover: hover) and (pointer: fine) {
        body:has(.pet-cursor-active),
        body:has(.pet-cursor-active) * {
          cursor: none !important;
        }

        body:has(.pet-cursor-active) input,
        body:has(.pet-cursor-active) textarea,
        body:has(.pet-cursor-active) [contenteditable="true"] {
          cursor: text !important;
        }
      }

      .pet-cursor-bone {
        display: inline-block;
        animation: pet-bone-bounce 0.45s ease-in-out infinite alternate;
      }

      .pet-cursor-idle {
        animation: pet-idle 0.8s ease-in-out infinite alternate;
      }

      .pet-cursor-walk {
        display: inline-block;
        animation: pet-walk 0.22s ease-in-out infinite alternate;
      }

      @keyframes pet-bone-bounce {
        from { transform: translateY(0) rotate(-12deg) scale(1); }
        to { transform: translateY(-7px) rotate(12deg) scale(1.12); }
      }

      @keyframes pet-idle {
        from { transform: translateY(0) rotate(-3deg); }
        to { transform: translateY(-4px) rotate(3deg); }
      }

      @keyframes pet-walk {
        from { translate: 0 0; }
        to { translate: 0 -3px; }
      }

      @media (prefers-reduced-motion: reduce) {
        .pet-cursor-bone,
        .pet-cursor-idle,
        .pet-cursor-walk {
          animation: none !important;
        }
      }
    `;

    document.head.appendChild(style);
    styleRef.current = style;

    const handleMouseMove = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (
        target.closest(
          "input, textarea, select, [contenteditable='true']"
        )
      ) {
        setSelecting(false);
        setIdle(false);
        return;
      }

      setPosition({ x: event.clientX, y: event.clientY });
      setIdle(false);

      if (event.clientX < lastX.current) {
        setDirection("left");
      } else if (event.clientX > lastX.current) {
        setDirection("right");
      }

      lastX.current = event.clientX;

      setSelecting(
        Boolean(
          target.closest(
            "button, a, [role='button'], [role='link'], label"
          )
        )
      );

      // Alterna entre gato y perro cada 1,7 segundos de movimiento.
      const now = Date.now();
      if (now - lastChange.current >= 1700) {
        setPet((current) => (current === "cat" ? "dog" : "cat"));
        lastChange.current = now;
      }

      if (idleTimer.current) {
        clearTimeout(idleTimer.current);
      }

      idleTimer.current = setTimeout(() => {
        setIdle(true);
      }, 2500);
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);

      if (idleTimer.current) {
        clearTimeout(idleTimer.current);
      }

      style.remove();
      styleRef.current = null;
    };
  }, []);

  const animal = pet === "cat" ? "🐱" : "🐶";

  return (
    <div
      aria-hidden="true"
      className="pet-cursor-active"
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        zIndex: 9999,
        pointerEvents: "none",
        fontSize: selecting ? 28 : 30,
        lineHeight: 1,
        transform: `translate(-50%, -50%) scaleX(${
          direction === "left" ? -1 : 1
        })`,
        filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.12))",
        userSelect: "none",
      }}
    >
      {selecting ? (
        <span className="pet-cursor-bone">🦴</span>
      ) : idle ? (
        <span className="pet-cursor-idle">
          {pet === "cat" ? "🐈" : "🐕"}
        </span>
      ) : (
        <span className="pet-cursor-walk">{animal}</span>
      )}
    </div>
  );
}
