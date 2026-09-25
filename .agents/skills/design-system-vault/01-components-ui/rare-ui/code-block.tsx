import React, { useState } from "react";

export interface CodeBlockProps {
  code: string;
  language?: string;
  accentColor?: string; // e.g. #6366f1
  fileName?: string;
  className?: string;
}

/**
 * 💻 Accent Code Block (Rare UI)
 *
 * Bloque de código que deriva toda su jerarquía de estilo a partir de un único
 * color de acento hexadecimal, con botón de copiado con confirmación interactiva.
 */
export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = "typescript",
  accentColor = "#6366f1",
  fileName,
  className = "",
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-950 font-mono text-xs shadow-2xl dark:border-white/10 ${className}`}
      style={{
        boxShadow: `0 8px 32px -4px ${accentColor}18`,
      }}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          </div>
          {fileName && <span className="ml-2 text-[11px] text-slate-400">{fileName}</span>}
        </div>

        <div className="flex items-center gap-2">
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
          >
            {language}
          </span>
          <button
            onClick={handleCopy}
            className="rounded-lg px-2 py-1 text-[10px] font-semibold text-slate-400 transition hover:bg-white/10 hover:text-white active:scale-95"
          >
            {copied ? "Copied! ✓" : "Copy"}
          </button>
        </div>
      </div>

      {/* Code Text Container */}
      <div className="overflow-x-auto p-4 text-slate-200 leading-relaxed">
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;
