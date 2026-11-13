import { useId, type ReactNode } from "react";
import { MAX_ANGLE, MIN_ANGLE } from "./engine";

interface AimControlsProps {
  angle: number;
  power: number;
  onChange: (angle: number, power: number) => void;
  disabled: boolean;
  children: ReactNode;
}

const sliderClass =
  "h-11 w-full cursor-pointer accent-accent-strong disabled:cursor-not-allowed disabled:opacity-50";

/** Precise aiming with sliders — an alternative to dragging on the stage. */
export function AimControls({ angle, power, onChange, disabled, children }: AimControlsProps) {
  const a = useId();
  const p = useId();
  return (
    <div className="grid items-end gap-x-6 gap-y-2 rounded-card bg-surface p-4 shadow-card sm:grid-cols-[1fr_1fr_auto]">
      <div>
        <label htmlFor={a} className="text-sm font-bold text-navy">
          Kąt: {Math.round(angle)}°
        </label>
        <input
          id={a}
          type="range"
          min={MIN_ANGLE}
          max={MAX_ANGLE}
          step={1}
          value={Math.round(angle)}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value), power)}
          className={sliderClass}
        />
      </div>
      <div>
        <label htmlFor={p} className="text-sm font-bold text-navy">
          Siła: {Math.round(power * 100)}%
        </label>
        <input
          id={p}
          type="range"
          min={0}
          max={100}
          step={1}
          value={Math.round(power * 100)}
          disabled={disabled}
          onChange={(e) => onChange(angle, Number(e.target.value) / 100)}
          className={sliderClass}
        />
      </div>
      {children}
    </div>
  );
}
