import React from 'react';

/**
 * BackgroundPattern
 * 
 * Sophisticated, low-opacity (3-8%) transparent branded background pattern
 * specifically designed for GrievDesk.
 * 
 * Elements Included:
 * 1. Connected 4-node tracking workflow (Report -> Review -> Resolve -> Verify)
 * 2. Institutional Shield Outline & Handshake silhouette
 * 3. Speech Bubble / Dialogue motif (Student Voice)
 * 4. Official Grievance Document Sheet with checklist & verified checkmark
 * 5. Neoclassical University Campus Colonnade & Pediment structure
 * 6. Resolution / Milestone verification check marks & communication arrows
 * 7. Ambient radial lighting layers & ultra-subtle tactile grain texture (1.8% opacity)
 */
export const BackgroundPattern = ({
  className = '',
  opacity = 'opacity-[0.045] dark:opacity-[0.055]',
  isGlobal = false,
  showAmbientGlow = true,
}) => {
  const containerPosition = isGlobal ? 'fixed inset-0 z-0' : 'absolute inset-0';

  return (
    <div
      className={`${containerPosition} pointer-events-none select-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* 1. Subtle Ambient Radial Depth & Lighting Gradients (Light: Soft off-white & champagne; Dark: Deep charcoal & graphite) */}
      {showAmbientGlow && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Upper Right Champagne-Gold Aura */}
          <div
            className="absolute -top-24 right-0 w-[650px] h-[550px] rounded-full blur-3xl transition-colors duration-700"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(196, 154, 74, 0.06) 0%, rgba(196, 154, 74, 0.015) 50%, transparent 75%)',
            }}
          />

          {/* Center-Left Ambient Silver-Gray / Graphite Depth */}
          <div
            className="absolute top-1/3 -left-32 w-[600px] h-[600px] rounded-full blur-3xl transition-colors duration-700"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(164, 176, 190, 0.05) 0%, rgba(95, 104, 117, 0.02) 50%, transparent 75%)',
            }}
          />

          {/* Lower Center/Right Grounding Depth */}
          <div
            className="absolute -bottom-24 right-1/4 w-[750px] h-[500px] rounded-full blur-3xl transition-colors duration-700"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(196, 154, 74, 0.035) 0%, rgba(23, 27, 34, 0.03) 60%, transparent 80%)',
            }}
          />
        </div>
      )}

      {/* 2. Micro-Noise / Subtle Grain Texture for Executive Tactile Finish (1.8% opacity) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.018] dark:opacity-[0.028] mix-blend-overlay pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="grievdesk-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grievdesk-noise)" />
      </svg>

      {/* 3. Branded Line-Art Decorative Pattern (3-8% Opacity) */}
      <div className={`absolute inset-0 ${opacity} transition-opacity duration-700`}>
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          <defs>
            <pattern
              id="grievdesk-branded-pattern"
              width="360"
              height="360"
              patternUnits="userSpaceOnUse"
            >
              {/* --- ELEMENT 1: Connected 4-Node Tracking Line (Workflow Lifecycle) --- */}
              <g stroke="#171B22" fill="none" strokeWidth="1.2">
                {/* Dotted path connecting the 4 phases */}
                <path
                  d="M 35 55 L 105 55 Q 135 55 135 85 L 135 150 Q 135 180 165 180 L 255 180"
                  strokeDasharray="3 4"
                  className="stroke-charcoal-800 dark:stroke-silver-300"
                />
                {/* Node 1: Report (Input Node - Gold) */}
                <circle cx="35" cy="55" r="4" fill="#C49A4A" stroke="#C49A4A" strokeWidth="1.5" />
                {/* Node 2: Review (Evaluation Node) */}
                <circle
                  cx="135"
                  cy="115"
                  r="3.5"
                  className="stroke-charcoal-700 dark:stroke-silver-400"
                  fill="none"
                />
                {/* Node 3: Resolve (Action Node) */}
                <circle
                  cx="165"
                  cy="180"
                  r="3.5"
                  className="stroke-charcoal-700 dark:stroke-silver-400"
                  fill="none"
                />
                {/* Node 4: Verify (Completed Node - Gold) */}
                <circle cx="255" cy="180" r="4" fill="#C49A4A" stroke="#C49A4A" strokeWidth="1.5" />
              </g>

              {/* --- ELEMENT 2: Shield & Handshake Silhouette (Institutional Integrity) --- */}
              <g transform="translate(260, 45)" stroke="#C49A4A" fill="none" strokeWidth="1.2">
                {/* Shield Outline */}
                <path d="M 0 0 L 24 0 C 24 16 12 28 0 34 C -12 28 -24 16 -24 0 Z" />
                {/* Handshake Silhouette */}
                <path d="M -8 10 L -2 15 L 6 9" strokeWidth="1" />
                <path d="M -6 6 L 2 12 L 8 8" strokeWidth="1" strokeDasharray="1 1" />
              </g>

              {/* --- ELEMENT 3: Speech Bubble / Student Voice Motif --- */}
              <g
                transform="translate(45, 220)"
                stroke="#171B22"
                fill="none"
                strokeWidth="1.2"
                className="stroke-charcoal-800 dark:stroke-silver-300"
              >
                <rect x="0" y="0" width="38" height="26" rx="6" />
                <path d="M 8 26 L 4 33 L 16 26" />
                {/* 3 Dialogue dots */}
                <circle cx="11" cy="13" r="1.5" fill="currentColor" stroke="none" />
                <circle cx="19" cy="13" r="1.5" fill="currentColor" stroke="none" />
                <circle cx="27" cy="13" r="1.5" fill="#C49A4A" stroke="none" />
              </g>

              {/* --- ELEMENT 4: Grievance Document Sheet with Checklist & Checkmark --- */}
              <g transform="translate(150, 230)" stroke="#C49A4A" fill="none" strokeWidth="1.2">
                <rect x="0" y="0" width="28" height="36" rx="4" />
                {/* Folded corner */}
                <path d="M 18 0 L 28 10 L 28 36" />
                <path d="M 18 0 L 18 10 L 28 10" />
                {/* Checklist horizontal lines */}
                <line
                  x1="6"
                  y1="16"
                  x2="16"
                  y2="16"
                  strokeWidth="1"
                  className="stroke-charcoal-700 dark:stroke-silver-400"
                />
                <line
                  x1="6"
                  y1="22"
                  x2="14"
                  y2="22"
                  strokeWidth="1"
                  className="stroke-charcoal-700 dark:stroke-silver-400"
                />
                {/* Verified resolution tick */}
                <path d="M 6 28 L 10 32 L 20 22" strokeWidth="1.5" stroke="#C49A4A" />
              </g>

              {/* --- ELEMENT 5: Neoclassical Campus Colonnade (University Architecture) --- */}
              <g
                transform="translate(65, 125)"
                stroke="#171B22"
                fill="none"
                strokeWidth="1.1"
                className="stroke-charcoal-800 dark:stroke-silver-400"
              >
                {/* Pediment roof */}
                <path d="M 0 10 L 18 0 L 36 10 Z" />
                <line x1="2" y1="13" x2="34" y2="13" strokeWidth="1.2" />
                {/* 4 Architectural Columns */}
                <line x1="6" y1="13" x2="6" y2="30" />
                <line x1="14" y1="13" x2="14" y2="30" />
                <line x1="22" y1="13" x2="22" y2="30" />
                <line x1="30" y1="13" x2="30" y2="30" />
                {/* Colonnade Plinth */}
                <line x1="0" y1="30" x2="36" y2="30" strokeWidth="1.5" />
              </g>

              {/* --- ELEMENT 6: Resolution Verification Seal --- */}
              <g transform="translate(305, 135)" stroke="#C49A4A" fill="none" strokeWidth="1">
                <circle cx="0" cy="0" r="8" strokeDasharray="2 2" />
                <path d="M -3 0 L -0.5 3 L 4 -2" strokeWidth="1.2" stroke="#C49A4A" />
              </g>

              {/* --- ELEMENT 7: Workflow Milestone Star & Curved Communication Line --- */}
              <g
                transform="translate(230, 290)"
                stroke="#171B22"
                fill="none"
                strokeWidth="1"
                className="stroke-charcoal-700 dark:stroke-silver-400"
              >
                {/* Curved communication loop */}
                <path d="M 0 0 C 20 -15, 40 -15, 60 0" strokeDasharray="2 3" />
                {/* Mini milestone node */}
                <circle cx="60" cy="0" r="2.5" fill="#C49A4A" stroke="none" />
              </g>

              {/* --- ELEMENT 8: Checkmark Badge Outline (Upper Center) --- */}
              <g
                transform="translate(185, 30)"
                stroke="#171B22"
                fill="none"
                strokeWidth="1"
                className="stroke-charcoal-700 dark:stroke-silver-400"
              >
                <circle cx="0" cy="0" r="6.5" />
                <path d="M -2.5 0 L -0.5 2.5 L 3 -1.5" strokeWidth="1" />
              </g>
            </pattern>
          </defs>

          <rect width="100%" height="100%" fill="url(#grievdesk-branded-pattern)" />
        </svg>
      </div>
    </div>
  );
};

export default BackgroundPattern;
