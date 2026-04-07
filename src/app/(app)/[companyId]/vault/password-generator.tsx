// src/app/(app)/[companyId]/vault/password-generator.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Copy, Check } from "lucide-react";

// ─── Character pools ────────────────────────────────────

const CHARS = {
  lower:   "abcdefghijklmnopqrstuvwxyz",
  upper:   "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{}|;:,.<>?",
} as const;

interface GenOptions {
  upper:   boolean;
  lower:   boolean;
  numbers: boolean;
  symbols: boolean;
}

function generate(length: number, opts: GenOptions): string {
  let pool = "";
  if (opts.lower)   pool += CHARS.lower;
  if (opts.upper)   pool += CHARS.upper;
  if (opts.numbers) pool += CHARS.numbers;
  if (opts.symbols) pool += CHARS.symbols;
  if (!pool) pool = CHARS.lower; // fallback — never produce empty password
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (n) => pool[n % pool.length]).join("");
}

function strengthScore(password: string): 0 | 1 | 2 | 3 | 4 {
  if (!password) return 0;
  let s = 0;
  if (password.length >= 8)  s++;
  if (password.length >= 12) s++;
  if (/[A-Z]/.test(password))       s++;
  if (/[0-9]/.test(password))       s++;
  if (/[^a-zA-Z0-9]/.test(password)) s++;
  if (s <= 1) return 1;
  if (s === 2) return 2;
  if (s === 3) return 3;
  return 4;
}

const STRENGTH_META = [
  { label: "",          barColor: "bg-gray-700"    },
  { label: "Faible",    barColor: "bg-red-500"     },
  { label: "Passable",  barColor: "bg-amber-500"   },
  { label: "Bon",       barColor: "bg-sky-500"     },
  { label: "Très fort", barColor: "bg-emerald-500" },
] as const;

// ─── Toggle ─────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between w-full py-1.5 select-none"
    >
      <span className="text-xs text-gray-400">{label}</span>
      <div
        className={`relative w-8 h-[18px] rounded-full transition-colors duration-200 ${
          checked ? "bg-orange-500" : "bg-white/[0.08]"
        }`}
      >
        <div
          className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? "translate-x-[17px]" : "translate-x-[2px]"
          }`}
        />
      </div>
    </button>
  );
}

// ─── Main component ─────────────────────────────────────

interface PasswordGeneratorProps {
  onUse: (password: string) => void;
}

export default function PasswordGenerator({ onUse }: PasswordGeneratorProps) {
  const [length, setLength] = useState(16);
  const [opts, setOpts] = useState<GenOptions>({
    upper:   true,
    lower:   true,
    numbers: true,
    symbols: false,
  });
  const [generated, setGenerated] = useState("");
  const [justCopied, setJustCopied] = useState(false);

  const refresh = useCallback(() => {
    setGenerated(generate(length, opts));
  }, [length, opts]);

  // Auto-regenerate whenever options change
  useEffect(() => { refresh(); }, [refresh]);

  const strength = strengthScore(generated);
  const meta = STRENGTH_META[strength];

  async function handleCopy() {
    if (!generated) return;
    await navigator.clipboard.writeText(generated);
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 1500);
  }

  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 space-y-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Générateur
      </p>

      {/* Generated password + actions */}
      <div className="flex items-center gap-2">
        <div className="flex-1 px-3 py-2 rounded-lg bg-[#0a0a0a] border border-white/[0.06] font-mono text-sm text-white break-all min-h-[36px] leading-snug">
          {generated || <span className="text-gray-700">—</span>}
        </div>
        <button
          type="button"
          onClick={refresh}
          title="Regénérer"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.06] transition-colors shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleCopy}
          title="Copier"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.06] transition-colors shrink-0"
        >
          {justCopied
            ? <Check className="w-3.5 h-3.5 text-emerald-400" />
            : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Strength bar */}
      <div className="space-y-1.5">
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                i <= strength ? meta.barColor : "bg-white/[0.06]"
              }`}
            />
          ))}
        </div>
        {meta.label && (
          <p className="text-[11px] text-gray-500">{meta.label}</p>
        )}
      </div>

      {/* Length slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Longueur</span>
          <span className="text-xs font-semibold text-white tabular-nums">{length}</span>
        </div>
        <input
          type="range"
          min={8}
          max={32}
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="w-full h-1 appearance-none rounded-full bg-white/[0.08] cursor-pointer accent-orange-500"
        />
        <div className="flex justify-between">
          <span className="text-[10px] text-gray-700">8</span>
          <span className="text-[10px] text-gray-700">32</span>
        </div>
      </div>

      {/* Toggles */}
      <div className="divide-y divide-white/[0.04]">
        <Toggle
          checked={opts.upper}
          onChange={(v) => setOpts((o) => ({ ...o, upper: v }))}
          label="Majuscules (A-Z)"
        />
        <Toggle
          checked={opts.lower}
          onChange={(v) => setOpts((o) => ({ ...o, lower: v }))}
          label="Minuscules (a-z)"
        />
        <Toggle
          checked={opts.numbers}
          onChange={(v) => setOpts((o) => ({ ...o, numbers: v }))}
          label="Chiffres (0-9)"
        />
        <Toggle
          checked={opts.symbols}
          onChange={(v) => setOpts((o) => ({ ...o, symbols: v }))}
          label="Symboles (!@#…)"
        />
      </div>

      {/* Use button */}
      <button
        type="button"
        onClick={() => onUse(generated)}
        className="w-full py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-sm font-medium text-orange-400 hover:bg-orange-500/[0.15] transition-colors"
      >
        Utiliser ce mot de passe
      </button>
    </div>
  );
}
