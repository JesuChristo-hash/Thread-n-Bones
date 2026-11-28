import React, { useEffect, useId, useState } from 'react';

/* =========================================================================
   1. STAGE / PHASE / DEPTH CARVED SLATE & BRASS RITUAL CARTOUCHE
   ========================================================================= */
export interface StageDepthPlaqueProps {
  label: string;
  isBoss: boolean;
  isBoneLord: boolean;
  bossPhase?: number;
}

export const StageDepthPlaque: React.FC<StageDepthPlaqueProps> = ({
  label,
  isBoss,
  isBoneLord,
  bossPhase = 1,
}) => {
  const uid = useId().replace(/:/g, '');
  const baseUrl = import.meta.env.BASE_URL || './';
  const parts = label.split('•').map((s) => s.trim()).filter(Boolean);

  return (
    <div className="flex flex-col items-center justify-center select-none mt-1">
      {/* Hand-Chiselled Slate & Riveted Brass Cartouche */}
      <div
        className="relative inline-flex items-center justify-center px-4 py-[6px]"
        style={{
          filter: isBoneLord
            ? 'drop-shadow(0 0 10px rgba(185,28,28,0.45)) drop-shadow(0 4px 8px rgba(0,0,0,0.95))'
            : 'drop-shadow(0 4px 8px rgba(0,0,0,0.92))',
        }}
      >
        {/* Irregular Chamfered Aged-Slate Slab Backdrop */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            clipPath:
              'polygon(7px 1px, calc(100% - 7px) 0.5px, calc(100% - 1px) 7px, calc(100% - 1.5px) calc(100% - 7px), calc(100% - 7px) calc(100% - 0.5px), 7px calc(100% - 1px), 1px calc(100% - 7px), 1.5px 7px)',
            backgroundImage: `linear-gradient(180deg, ${
              isBoneLord
                ? 'rgba(42,8,10,0.78) 0%, rgba(18,4,5,0.9) 65%, rgba(10,2,3,0.95) 100%'
                : 'rgba(28,23,21,0.68) 0%, rgba(14,11,11,0.84) 55%, rgba(8,6,6,0.94) 100%'
            }), url("${baseUrl}assets/text/slate.jpg")`,
            backgroundSize: 'cover, 120px 120px',
            backgroundPosition: 'center',
          }}
        />

        {/* Forged Brass End-Caps, Carved Stone Bevel & Engraved Rim */}
        <svg
          viewBox="0 0 160 28"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 w-full h-full overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`stageRim-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={isBoneLord ? '#b91c1c' : isBoss ? '#b88e52' : '#7c6550'} stopOpacity="0.92" />
              <stop offset="50%" stopColor={isBoneLord ? '#5e1114' : '#3d3127'} stopOpacity="0.9" />
              <stop offset="100%" stopColor={isBoneLord ? '#991b1b' : '#241b15'} stopOpacity="0.95" />
            </linearGradient>
          </defs>
          {/* Outer shadow & chamfered stone rim */}
          <polygon
            points="7,1 153,0.6 159,7 158.5,21 153,27.4 7,27 1,21 1.5,7"
            fill="none"
            stroke="#070505"
            strokeWidth="2.2"
            vectorEffect="non-scaling-stroke"
          />
          <polygon
            points="7,1 153,0.6 159,7 158.5,21 153,27.4 7,27 1,21 1.5,7"
            fill="none"
            stroke={`url(#stageRim-${uid})`}
            strokeWidth="1.15"
            vectorEffect="non-scaling-stroke"
          />
          {/* Inner engraved hairline groove */}
          <polygon
            points="10,3.8 150,3.8 155,8.5 155,19.5 150,24.2 10,24.2 5,19.5 5,8.5"
            fill="none"
            stroke={isBoneLord ? 'rgba(239,68,68,0.28)' : 'rgba(196,154,92,0.22)'}
            strokeWidth="0.7"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Left & Right Forged Brass Spearhead Brackets (non-distorting fixed SVG caps) */}
        <svg
          viewBox="0 0 10 16"
          className="pointer-events-none absolute -left-[3px] top-1/2 -translate-y-1/2 w-[10px] h-[16px] overflow-visible"
          aria-hidden="true"
        >
          <polygon
            points="0.5,8 4.5,2 9,2 6.5,8 9,14 4.5,14"
            fill={isBoneLord ? '#7f1d1d' : '#6b4a26'}
            stroke="#160e08"
            strokeWidth="0.8"
          />
          <circle cx="4.5" cy="8" r="1.2" fill={isBoneLord ? '#fca5a5' : '#dfba7c'} />
        </svg>
        <svg
          viewBox="0 0 10 16"
          className="pointer-events-none absolute -right-[3px] top-1/2 -translate-y-1/2 w-[10px] h-[16px] overflow-visible"
          aria-hidden="true"
        >
          <polygon
            points="9.5,8 5.5,2 1,2 3.5,8 1,14 5.5,14"
            fill={isBoneLord ? '#7f1d1d' : '#6b4a26'}
            stroke="#160e08"
            strokeWidth="0.8"
          />
          <circle cx="5.5" cy="8" r="1.2" fill={isBoneLord ? '#fca5a5' : '#dfba7c'} />
        </svg>

        {/* Engraved Lit Typography */}
        <span
          className={`relative z-10 inline-flex items-center gap-1.5 font-['Cinzel',_serif] font-bold text-[9.5px] leading-none tracking-[0.22em] pl-[0.22em] uppercase whitespace-nowrap ${
            isBoneLord
              ? 'text-[#fecaca]'
              : isBoss
                ? 'text-[#e8cfa5]'
                : 'text-[#d1b99a]'
          }`}
          style={{
            textShadow: isBoneLord
              ? '0 0 8px rgba(220,38,38,0.85), 0 1px 3px rgba(0,0,0,1)'
              : '0 1px 3px rgba(0,0,0,1), 0 0 6px rgba(196,154,92,0.18)',
          }}
        >
          {parts.length === 2 ? (
            <>
              <span>{parts[0]}</span>
              <span
                className={`inline-block w-[4px] h-[4px] rotate-45 shrink-0 ${
                  isBoneLord
                    ? 'bg-red-400 shadow-[0_0_5px_rgba(239,68,68,0.95)]'
                    : isBoss
                      ? 'bg-[#c92a2a] shadow-[0_0_4px_rgba(185,28,28,0.7)]'
                      : 'bg-[#a67e46]'
                }`}
              />
              <span>{parts[1]}</span>
            </>
          ) : (
            label
          )}
        </span>
      </div>

      {/* Bone Lord 3-Phase Sculpted Ritual Gems */}
      {isBoneLord && (
        <div className="mt-2 flex items-center justify-center gap-2.5" title={`Bone Lord Phase ${bossPhase} of 3`}>
          {[1, 2, 3].map((p) => {
            const active = p === bossPhase;
            const past = p < bossPhase;
            return (
              <span
                key={p}
                className={`relative inline-flex items-center justify-center w-2.5 h-2.5 rotate-45 border transition-all duration-300 ${
                  past
                    ? 'bg-[#450a0a] border-[#7f1d1d] opacity-70'
                    : active
                      ? 'bg-gradient-to-br from-[#fca5a5] via-[#dc2626] to-[#6b0f12] border-[#f4d78b] shadow-[0_0_10px_rgba(239,68,68,0.95)] scale-115'
                      : 'bg-[#120708] border-[#5e3828]/80'
                }`}
              />
            );
          })}
        </div>
      )}

      {/* Engraved Brass & Crimson Filigree Rule */}
      <div className="flex items-center justify-center gap-1.5 w-32 mt-2">
        <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#785e42]/70 to-[#b08a52]/80" />
        <span className="w-[3px] h-[3px] rotate-45 bg-[#6e563d]" />
        <span
          className={`w-[5px] h-[5px] rotate-45 border ${
            isBoneLord
              ? 'bg-[#991b1b] border-[#fca5a5]/80 shadow-[0_0_6px_rgba(239,68,68,0.8)]'
              : 'bg-[#3d0a0c] border-[#b08a52]/85'
          }`}
        />
        <span className="w-[3px] h-[3px] rotate-45 bg-[#6e563d]" />
        <span className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#785e42]/70 to-[#b08a52]/80" />
      </div>
    </div>
  );
};

/* =========================================================================
   2. EFFIGY & POPPET STITCHED / PINNED SPECIMEN TAG + HOVER GRIMOIRE PLAQUE
   ========================================================================= */
export type EffigyTheme = 'player' | 'weaver' | 'foe';

export interface EffigySpecimenTagProps {
  roleLabel: string;
  tribeName: string;
  sigilName: string;
  theme: EffigyTheme;
}

const EFFIGY_PALETTES: Record<
  EffigyTheme,
  {
    bgGrad: string;
    rimStroke: string;
    stitchStroke: string;
    pinFill: string;
    pinRim: string;
    roleColor: string;
    titleColor: string;
    accentGlow: string;
    dividerColor: string;
  }
> = {
  player: {
    bgGrad: 'linear-gradient(180deg, rgba(30,22,15,0.9) 0%, rgba(16,11,8,0.96) 100%)',
    rimStroke: '#8f6c3e',
    stitchStroke: 'rgba(196,154,92,0.42)',
    pinFill: '#c49a5c',
    pinRim: '#2e1d0f',
    roleColor: '#f0cf8c',
    titleColor: '#f6e7c9',
    accentGlow: 'rgba(196,154,92,0.42)',
    dividerColor: 'rgba(196,154,92,0.45)',
  },
  weaver: {
    bgGrad: 'linear-gradient(180deg, rgba(28,13,38,0.92) 0%, rgba(13,6,20,0.97) 100%)',
    rimStroke: '#9354c7',
    stitchStroke: 'rgba(192,132,252,0.42)',
    pinFill: '#c084fc',
    pinRim: '#240b36',
    roleColor: '#e2b8ff',
    titleColor: '#f3e4ff',
    accentGlow: 'rgba(168,85,247,0.5)',
    dividerColor: 'rgba(168,85,247,0.45)',
  },
  foe: {
    bgGrad: 'linear-gradient(180deg, rgba(38,10,12,0.92) 0%, rgba(17,5,6,0.97) 100%)',
    rimStroke: '#a6262a',
    stitchStroke: 'rgba(248,113,113,0.38)',
    pinFill: '#dc2626',
    pinRim: '#2e0708',
    roleColor: '#fca5a5',
    titleColor: '#fde4e4',
    accentGlow: 'rgba(220,38,38,0.5)',
    dividerColor: 'rgba(220,38,38,0.45)',
  },
};

export const EffigySpecimenTag: React.FC<EffigySpecimenTagProps> = ({
  roleLabel,
  tribeName,
  sigilName,
  theme,
}) => {
  const pal = EFFIGY_PALETTES[theme];
  const baseUrl = import.meta.env.BASE_URL || './';

  return (
    <div
      className="relative z-10 mt-0.5 pt-2 pb-1.5 px-2.5 min-w-[74px] max-w-[104px] text-center select-none transition-transform duration-150 group-hover:scale-[1.04]"
      style={{ filter: 'drop-shadow(0 5px 8px rgba(0,0,0,0.92))' }}
    >
      {/* Deckled / Hand-Cut Parchment-Slate Slip Backing */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          clipPath:
            'polygon(5px 2px, 32% 0.5px, 68% 1.5px, calc(100% - 5px) 2px, calc(100% - 0.5px) 7px, calc(100% - 1.5px) calc(100% - 6px), calc(100% - 6px) calc(100% - 0.5px), 52% calc(100% - 1.5px), 6px calc(100% - 0.5px), 1px calc(100% - 6px), 0.5px 7px)',
          backgroundImage: `${pal.bgGrad}, url("${baseUrl}assets/text/slate.jpg")`,
          backgroundSize: 'cover, 90px 90px',
        }}
      />

      {/* Stitched Thread Border & Top Brass/Iron Specimen Pin */}
      <svg
        viewBox="0 0 100 44"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 w-full h-full overflow-visible"
        aria-hidden="true"
      >
        <polygon
          points="5,2 32,0.5 68,1.5 95,2 99.5,7 98.5,38 94,43.5 52,42.5 6,43.5 1,38 0.5,7"
          fill="none"
          stroke={pal.rimStroke}
          strokeWidth="1.1"
          vectorEffect="non-scaling-stroke"
        />
        <rect
          x="3.5"
          y="4.5"
          width="93"
          height="35"
          rx="2"
          fill="none"
          stroke={pal.stitchStroke}
          strokeWidth="0.75"
          strokeDasharray="3 2.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Top Centered Specimen Tack Pin */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-[2px] left-1/2 -translate-x-1/2 w-[6px] h-[6px] rounded-full shadow-[0_1px_3px_rgba(0,0,0,1)]"
        style={{
          background: `radial-gradient(circle at 35% 32%, #fff5e0 0%, ${pal.pinFill} 52%, ${pal.pinRim} 100%)`,
          border: `0.5px solid ${pal.pinRim}`,
        }}
      />

      {/* Crisp Legible Specimen Readout */}
      <div
        className="relative z-10 font-['Cinzel',_serif] font-black text-[7.5px] uppercase tracking-[0.14em] leading-tight whitespace-nowrap"
        style={{
          color: pal.roleColor,
          textShadow: `0 0 6px ${pal.accentGlow}, 0 1px 2px rgba(0,0,0,1)`,
        }}
      >
        {roleLabel}
      </div>
      <div
        className="relative z-10 mx-auto my-[2.5px] h-[1px] w-4/5"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${pal.dividerColor} 50%, transparent 100%)`,
        }}
      />
      <div
        className="relative z-10 font-mono text-[7.5px] font-bold leading-[1.2] break-words"
        style={{
          color: pal.titleColor,
          textShadow: '0 1px 2px rgba(0,0,0,1)',
        }}
      >
        <span>{tribeName}</span>
        <br />
        <span className="opacity-85">{sigilName || '—'}</span>
      </div>
    </div>
  );
};

export interface EffigyInspectionPlaqueProps {
  tooltipTitle: string;
  tribeName: string;
  sigilName: string;
  sigilIconUrl?: string;
  crestDesc: string;
  sigilDesc?: string;
  theme: EffigyTheme;
}

export const EffigyInspectionPlaque: React.FC<EffigyInspectionPlaqueProps> = ({
  tooltipTitle,
  tribeName,
  sigilName,
  sigilIconUrl,
  crestDesc,
  sigilDesc,
  theme,
}) => {
  const pal = EFFIGY_PALETTES[theme];
  const baseUrl = import.meta.env.BASE_URL || './';

  return (
    <div
      className="pointer-events-none opacity-0 -translate-x-1.5 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 absolute left-full ml-3.5 top-1/2 -translate-y-1/2 z-[80] w-60 text-left"
      style={{
        filter: `drop-shadow(0 0 14px ${pal.accentGlow}) drop-shadow(0 16px 28px rgba(0,0,0,0.96))`,
      }}
    >
      {/* Left-Pointing Forged Brass Anchor Beak */}
      <svg
        viewBox="0 0 10 18"
        className="pointer-events-none absolute -left-[8px] top-1/2 -translate-y-1/2 w-[10px] h-[18px] z-20 overflow-visible"
        aria-hidden="true"
      >
        <polygon points="0,9 9,1 9,17" fill="#120c0b" stroke={pal.rimStroke} strokeWidth="1.2" />
        <circle cx="6.2" cy="9" r="1.2" fill={pal.pinFill} />
      </svg>

      {/* Main Carved Slate & Brass-Cornered Reliquary Card */}
      <div className="relative px-3.5 py-3">
        {/* Hand-Chamfered Slate & Aged Vellum Backing */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            clipPath:
              'polygon(8px 1px, calc(100% - 8px) 1px, calc(100% - 1px) 8px, calc(100% - 1px) calc(100% - 8px), calc(100% - 8px) calc(100% - 1px), 8px calc(100% - 1px), 1px calc(100% - 8px), 1px 8px)',
            backgroundImage: `${pal.bgGrad}, url("${baseUrl}assets/text/slate.jpg")`,
            backgroundSize: 'cover, 130px 130px',
          }}
        />

        {/* Forged Border & Stitched Inner Frame */}
        <svg
          viewBox="0 0 240 160"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 w-full h-full overflow-visible"
          aria-hidden="true"
        >
          <polygon
            points="8,1 232,1 239,8 239,152 232,159 8,159 1,152 1,8"
            fill="none"
            stroke="#060404"
            strokeWidth="2.4"
            vectorEffect="non-scaling-stroke"
          />
          <polygon
            points="8,1 232,1 239,8 239,152 232,159 8,159 1,152 1,8"
            fill="none"
            stroke={pal.rimStroke}
            strokeWidth="1.2"
            vectorEffect="non-scaling-stroke"
          />
          <polygon
            points="11,4 229,4 236,11 236,149 229,156 11,156 4,149 4,11"
            fill="none"
            stroke={pal.stitchStroke}
            strokeWidth="0.7"
            strokeDasharray="4 3"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Four Fixed Forged Brass Corner Rivets */}
        {[
          'top-1.5 left-1.5',
          'top-1.5 right-1.5',
          'bottom-1.5 left-1.5',
          'bottom-1.5 right-1.5',
        ].map((pos, idx) => (
          <span
            key={idx}
            aria-hidden="true"
            className={`pointer-events-none absolute ${pos} w-[4px] h-[4px] rounded-full`}
            style={{
              background: `radial-gradient(circle at 35% 35%, #fff0cc 0%, ${pal.pinFill} 55%, ${pal.pinRim} 100%)`,
            }}
          />
        ))}

        {/* Header Row with Miniature Wax/Brass Sigil Medallion */}
        <div className="relative z-10 flex items-center gap-2.5">
          {sigilIconUrl && (
            <div
              className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center relative"
              style={{
                background: 'radial-gradient(circle at 38% 34%, #2e2015 0%, #140b09 70%, #070404 100%)',
                border: `1.2px solid ${pal.rimStroke}`,
                boxShadow: `inset 0 1px 4px rgba(0,0,0,0.95), 0 0 8px ${pal.accentGlow}`,
              }}
            >
              <img
                src={sigilIconUrl}
                alt={sigilName}
                className="w-7 h-7 object-contain pointer-events-none select-none"
                style={{
                  imageRendering: 'pixelated',
                  filter: 'contrast(1.08) drop-shadow(0 1px 2px rgba(0,0,0,0.9))',
                }}
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div
              className="font-['Cinzel',_serif] text-[8.5px] font-black uppercase tracking-[0.22em] leading-none"
              style={{
                color: pal.roleColor,
                textShadow: `0 0 6px ${pal.accentGlow}, 0 1px 2px rgba(0,0,0,1)`,
              }}
            >
              {tooltipTitle}
            </div>
            <div
              className="font-['Cinzel',_serif] text-[11.5px] font-black mt-1 leading-tight"
              style={{
                color: pal.titleColor,
                textShadow: '0 1px 3px rgba(0,0,0,1)',
              }}
            >
              {tribeName} <span className="opacity-55">•</span> {sigilName || 'Unmarked'}
            </div>
          </div>
        </div>

        {/* Engraved Filigree Divider */}
        <div className="relative z-10 flex items-center gap-1.5 my-2">
          <span
            className="h-[1px] flex-1"
            style={{ background: `linear-gradient(90deg, transparent, ${pal.dividerColor})` }}
          />
          <span
            className="w-1.5 h-1.5 rotate-45"
            style={{ backgroundColor: pal.pinFill, opacity: 0.85 }}
          />
          <span
            className="h-[1px] flex-1"
            style={{ background: `linear-gradient(270deg, transparent, ${pal.dividerColor})` }}
          />
        </div>

        {/* Crest Rule Description */}
        <p className="relative z-10 font-mono text-[9.5px] text-[#d9c7ad] leading-relaxed">
          {crestDesc}
        </p>

        {/* Sigil Mechanics Callout */}
        {sigilDesc && (
          <>
            <div
              className="relative z-10 h-[1px] w-full my-2 opacity-60"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${pal.dividerColor} 50%, transparent 100%)`,
              }}
            />
            <p className="relative z-10 font-mono text-[9.2px] text-[#efe0c8]/95 leading-relaxed">
              <span
                className="font-bold uppercase tracking-wider"
                style={{ color: pal.roleColor }}
              >
                {sigilName}:
              </span>{' '}
              {sigilDesc}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

/* =========================================================================
   3. HAND-CHISELLED AGED SLATE & RIVETED BRASS UTILITY BUTTONS
   ========================================================================= */
export interface RitualSlateButtonProps {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  title?: string;
  variant?: 'default' | 'dev' | 'danger';
  compact?: boolean;
  block?: boolean;
}

export const RitualSlateButton: React.FC<RitualSlateButtonProps> = ({
  label,
  onClick,
  icon,
  title,
  variant = 'default',
  compact = false,
  block = false,
}) => {
  const uid = useId().replace(/:/g, '');
  const baseUrl = import.meta.env.BASE_URL || './';
  const isDev = variant === 'dev';
  const isDanger = variant === 'danger';

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`group/rbtn relative ${block ? 'w-full' : 'w-38 sm:w-40'} px-3.5 flex items-center justify-center gap-2 cursor-pointer select-none bg-transparent border-0 outline-none transition-all duration-150 hover:-translate-y-[1px] active:translate-y-[1px] active:scale-[0.985] ${
        compact ? 'py-[5.5px]' : 'py-[9.5px]'
      }`}
      style={{
        filter: 'drop-shadow(0 5px 8px rgba(0,0,0,0.92))',
      }}
    >
      {/* Hand-Hewn Aged Slate Stone Slab */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-all duration-150"
        style={{
          clipPath:
            'polygon(8px 1px, 34% 0.4px, 68% 1.2px, calc(100% - 8px) 0.8px, calc(100% - 1px) 7px, calc(100% - 1.4px) calc(100% - 7px), calc(100% - 8px) calc(100% - 0.8px), 54% calc(100% - 1.4px), 8px calc(100% - 0.8px), 1px calc(100% - 7px), 1.4px 7px)',
          backgroundImage: `linear-gradient(180deg, ${
            isDanger
              ? 'rgba(54,14,16,0.78) 0%, rgba(26,7,9,0.9) 54%, rgba(12,4,5,0.96) 100%'
              : isDev
                ? 'rgba(30,22,20,0.72) 0%, rgba(16,12,12,0.88) 55%, rgba(9,7,7,0.95) 100%'
                : 'rgba(28,23,20,0.68) 0%, rgba(15,12,12,0.85) 52%, rgba(8,6,6,0.95) 100%'
          }), url("${baseUrl}assets/text/slate.jpg")`,
          backgroundSize: 'cover, 130px 130px',
          backgroundPosition: 'center',
        }}
      />

      {/* Hover Crimson/Gold Ember Under-Wash Inside Stone */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 group-hover/rbtn:opacity-100 transition-opacity duration-200"
        style={{
          clipPath:
            'polygon(8px 1px, 34% 0.4px, 68% 1.2px, calc(100% - 8px) 0.8px, calc(100% - 1px) 7px, calc(100% - 1.4px) calc(100% - 7px), calc(100% - 8px) calc(100% - 0.8px), 54% calc(100% - 1.4px), 8px calc(100% - 0.8px), 1px calc(100% - 7px), 1.4px 7px)',
          background: isDanger
            ? 'radial-gradient(ellipse 80% 120% at 50% 50%, rgba(185,28,28,0.52) 0%, rgba(127,20,24,0.22) 60%, transparent 100%)'
            : 'radial-gradient(ellipse 75% 110% at 50% 50%, rgba(127,20,24,0.42) 0%, rgba(180,125,55,0.12) 60%, transparent 100%)',
        }}
      />

      {/* Chiseled Stone Bevel Outline + Inner Engraved Groove */}
      <svg
        viewBox="0 0 160 30"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 w-full h-full overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`btnRim-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7a634d" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#423429" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#241c16" stopOpacity="0.95" />
          </linearGradient>
        </defs>
        <polygon
          points="8,1 54,0.4 109,1.2 152,0.8 159,7 158.6,23 152,29.2 86,28.6 8,29.2 1,23 1.4,7"
          fill="none"
          stroke="#070505"
          strokeWidth="2.2"
          vectorEffect="non-scaling-stroke"
        />
        <polygon
          points="8,1 54,0.4 109,1.2 152,0.8 159,7 158.6,23 152,29.2 86,28.6 8,29.2 1,23 1.4,7"
          fill="none"
          stroke={`url(#btnRim-${uid})`}
          strokeWidth="1.15"
          vectorEffect="non-scaling-stroke"
          className="transition-all duration-150 group-hover/rbtn:stroke-[#c49a5c]"
        />
        <polygon
          points="12,4 148,4 154,9 154,21 148,26 12,26 6,21 6,9"
          fill="none"
          stroke="rgba(196,154,92,0.18)"
          strokeWidth="0.7"
          vectorEffect="non-scaling-stroke"
          className="transition-all duration-150 group-hover/rbtn:stroke-[rgba(220,70,70,0.45)]"
        />
      </svg>

      {/* Left & Right Riveted Tarnished-Brass Clamping End-Caps */}
      <svg
        viewBox="0 0 11 22"
        className={`pointer-events-none absolute -left-[2px] top-1/2 -translate-y-1/2 w-[11px] overflow-visible transition-all duration-150 ${
          compact ? 'h-[20px]' : 'h-[26px]'
        }`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`btnCapL-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9e7642" />
            <stop offset="50%" stopColor="#5c3e1f" />
            <stop offset="100%" stopColor="#26180d" />
          </linearGradient>
        </defs>
        <path
          d="M 1 6 L 5 1.5 L 10 1.5 L 8.5 5.5 L 8.5 16.5 L 10 20.5 L 5 20.5 L 1 16 Z"
          fill={`url(#btnCapL-${uid})`}
          stroke="#140c07"
          strokeWidth="0.85"
        />
        <circle cx="4.8" cy="11" r="1.45" fill="#1e130b" stroke="#dfba7c" strokeWidth="0.45" />
      </svg>
      <svg
        viewBox="0 0 11 22"
        className={`pointer-events-none absolute -right-[2px] top-1/2 -translate-y-1/2 w-[11px] overflow-visible transition-all duration-150 ${
          compact ? 'h-[20px]' : 'h-[26px]'
        }`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`btnCapR-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9e7642" />
            <stop offset="50%" stopColor="#5c3e1f" />
            <stop offset="100%" stopColor="#26180d" />
          </linearGradient>
        </defs>
        <path
          d="M 10 6 L 6 1.5 L 1 1.5 L 2.5 5.5 L 2.5 16.5 L 1 20.5 L 6 20.5 L 10 16 Z"
          fill={`url(#btnCapR-${uid})`}
          stroke="#140c07"
          strokeWidth="0.85"
        />
        <circle cx="6.2" cy="11" r="1.45" fill="#1e130b" stroke="#dfba7c" strokeWidth="0.45" />
      </svg>

      {/* Engraved Brass Icon & Lit Cinzel Label */}
      {icon && (
        <span className="relative z-10 text-[#b88f54] group-hover/rbtn:text-[#f4d78b] transition-colors duration-150 drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
          {icon}
        </span>
      )}
      <span
        className={`relative z-10 font-['Cinzel',_serif] font-bold uppercase tracking-[0.2em] transition-colors duration-150 ${
          isDanger
            ? 'text-[#eab4aa] group-hover/rbtn:text-[#ffe2dc]'
            : 'text-[#d6c2a5] group-hover/rbtn:text-[#fff1d6]'
        } ${compact ? 'text-[9.5px] sm:text-[10px]' : 'text-[10.5px] sm:text-[11px]'}`}
        style={{
          textShadow: '0 1px 3px rgba(0,0,0,1)',
        }}
      >
        {label}
      </span>
    </button>
  );
};

/* =========================================================================
   4. PHYSICAL STACKED RITUAL CARD DECK (S & C DECKS WITH TRUE 3D DEPTH)
   ========================================================================= */
export interface RitualCardDeckProps {
  glyphSrc: string;
  cardBackSrc: string;
  alt: string;
  glyphAlt: string;
  disabled: boolean;
  isDrawReady: boolean;
  onClick: () => void;
  title: string;
  /** Number of remaining cards (drives visible physical deck stack thickness) */
  cardCount: number;
  /** Optional sealed visual treatment (e.g. Zealot's Flock squirrel lock) */
  isSealed?: boolean;
  /** Blood-debt exhaustion state (after 13 squirrels drawn: shaded crimson with blood splatter, -1 blood per draw) */
  isBloodExhausted?: boolean;
}

export const RitualCardDeck: React.FC<RitualCardDeckProps> = ({
  glyphSrc,
  cardBackSrc,
  alt,
  glyphAlt,
  disabled,
  isDrawReady,
  onClick,
  title,
  cardCount,
  isSealed = false,
  isBloodExhausted = false,
}) => {
  const uid = useId().replace(/:/g, '');
  // Compute visible physical card slices (1 slice for 1 card, scaling up to 7 chunky slices for >= 12 cards)
  const stackSlices =
    cardCount <= 1
      ? 0
      : cardCount <= 3
        ? 2
        : cardCount <= 5
          ? 4
          : cardCount <= 9
            ? 6
            : 7;

  // Deterministic subtle organic hand-stacked card micro-jitter
  const sliceOffsets = [
    { rot: -0.45, dx: 0.35 },
    { rot: 0.35, dx: -0.25 },
    { rot: -0.3, dx: 0.2 },
    { rot: 0.5, dx: -0.3 },
    { rot: -0.2, dx: 0.25 },
    { rot: 0.3, dx: -0.15 },
    { rot: -0.4, dx: 0.15 },
  ];

  const totalLiftY = Math.round(stackSlices * 1.65);

  const maskStyle: React.CSSProperties = {
    WebkitMaskImage: `url("${cardBackSrc}")`,
    maskImage: `url("${cardBackSrc}")`,
    WebkitMaskSize: '100% 100%',
    maskSize: '100% 100%',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
  };

  return (
    <div className="group/deck relative flex flex-col items-center">
      {/* Grounded Card Stack Footprint */}
      <div className="relative w-[84px] h-[119px] sm:w-[88px] sm:h-[125px]">
        {/* Deep Grounded Tabletop Cast Shadow (masked to exact ragged card silhouette) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            transform: `translate3d(${Math.round(stackSlices * 0.95) + 4}px, ${Math.round(stackSlices * 0.55) + 7}px, 0) scale(1.01)`,
            filter: 'blur(5px)',
          }}
        >
          <div
            className="w-full h-full"
            style={{
              ...maskStyle,
              backgroundColor: isBloodExhausted ? 'rgba(35, 3, 5, 0.92)' : 'rgba(0, 0, 0, 0.85)',
            }}
          />
        </div>

        {/* Physical Layered Aged-Parchment (or Blood-Soaked) Card Stack Edges (Exact cardbacks.png Ragged Silhouette!) */}
        {Array.from({ length: stackSlices }, (_, i) => {
          const idxFromTop = stackSlices - i; // 1 = closest to top card, stackSlices = bottom-most card
          const stepY = idxFromTop * 1.7 - totalLiftY * 0.45;
          const stepX = idxFromTop * 0.85;
          const jitter = sliceOffsets[i % sliceOffsets.length];
          const isEven = i % 2 === 0;
          const edgeTone = Math.max(0.42, 0.94 - (idxFromTop / (stackSlices + 1)) * 0.46);

          return (
            <div
              key={i}
              aria-hidden="true"
              className="pointer-events-none select-none absolute inset-0"
              style={{
                transform: `translate3d(${(stepX + jitter.dx).toFixed(2)}px, ${stepY.toFixed(2)}px, 0) rotate(${jitter.rot}deg)`,
                filter: `brightness(${edgeTone.toFixed(2)}) drop-shadow(0.8px 1px 0 rgba(14,9,6,0.95))`,
              }}
            >
              <div
                className="w-full h-full"
                style={{
                  ...maskStyle,
                  background: isBloodExhausted
                    ? isEven
                      ? 'linear-gradient(148deg, #240406 0%, #5c0d12 56%, #8f1820 88%, #b3262e 100%)'
                      : 'linear-gradient(148deg, #170203 0%, #42080c 56%, #6e1117 88%, #8f1b22 100%)'
                    : isEven
                      ? 'linear-gradient(148deg, #342417 0%, #6d5339 58%, #9f805c 88%, #c6a880 100%)'
                      : 'linear-gradient(148deg, #24180f 0%, #523d29 58%, #806446 88%, #a68863 100%)',
                }}
              />
            </div>
          );
        })}

        {/* Top Interactive Card (Borderless/Transparent — Outline & Glow Trace Exact Ragged Card Edges!) */}
        <button
          type="button"
          disabled={disabled}
          onClick={onClick}
          title={title}
          style={{
            top: `${(-totalLiftY * 0.45).toFixed(1)}px`,
          }}
          className={`w-full h-full p-0 border-0 bg-transparent outline-none flex items-center justify-center transition-all duration-180 ease-out select-none relative z-20 ${
            isDrawReady && !disabled
              ? `cursor-pointer ${isBloodExhausted ? 'animate-deck-blood-glow' : 'animate-deck-glow'} group-hover/deck:-translate-y-2 group-hover/deck:-rotate-[1.4deg] group-hover/deck:scale-[1.03] active:translate-y-0 active:scale-[0.98]`
              : isBloodExhausted
                ? 'opacity-95 cursor-not-allowed [filter:drop-shadow(0_0_5px_rgba(153,27,27,0.55))_drop-shadow(0_2px_4px_rgba(0,0,0,0.92))]'
                : 'opacity-92 cursor-not-allowed [filter:drop-shadow(0_1.5px_0_rgba(12,8,5,0.95))_drop-shadow(0_3px_5px_rgba(0,0,0,0.9))]'
          }`}
        >
          {/* Card Back Artwork (Exact Ragged Card Silhouette) */}
          <img
            src={cardBackSrc}
            alt={alt}
            className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0 transition-all duration-300"
            style={{
              imageRendering: 'pixelated',
              filter: isBloodExhausted
                ? isDrawReady && !disabled
                  ? 'sepia(0.62) hue-rotate(-44deg) saturate(2.55) brightness(0.76) contrast(1.14)'
                  : 'sepia(0.62) hue-rotate(-44deg) saturate(2.35) brightness(0.64) contrast(1.14)'
                : isDrawReady && !disabled
                  ? 'brightness(1.04) contrast(1.05)'
                  : 'brightness(0.86) contrast(1.05)',
            }}
          />

          {/* Dead-Center Iconic Crimson Glyphed S / C (preserve .deck-glyph-red CSS filter!) */}
          <div
            className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
            style={
              isBloodExhausted
                ? { filter: 'drop-shadow(0 0 6px rgba(220,38,38,0.9)) drop-shadow(0 1px 2px rgba(0,0,0,0.95))' }
                : undefined
            }
          >
            <img
              src={glyphSrc}
              alt={glyphAlt}
              className="deck-glyph-red h-14 sm:h-16 w-auto object-contain pointer-events-none select-none"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>

          {/* Blood-Debt Exhaustion Crimson Tint & Organic Blood Splatter Overlay (Strictly Masked to cardbacks.png!) */}
          {isBloodExhausted && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-15"
              style={maskStyle}
            >
              {/* Deep arterial crimson stain soak across torn card face */}
              <div
                className="absolute inset-0 mix-blend-multiply"
                style={{
                  background:
                    'radial-gradient(ellipse 92% 82% at 64% 24%, rgba(168, 18, 22, 0.72) 0%, rgba(112, 10, 14, 0.62) 55%, rgba(56, 4, 7, 0.78) 100%)',
                }}
              />
              {/* Organic Arterial Blood Splatter, Impact Cast-Off Spray & Wet Drips */}
              <svg viewBox="0 0 88 125" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                <defs>
                  <radialGradient id={`splatDeep-${uid}`} cx="38%" cy="34%" r="68%">
                    <stop offset="0%" stopColor="#991418" stopOpacity="0.94" />
                    <stop offset="55%" stopColor="#5e090d" stopOpacity="0.94" />
                    <stop offset="100%" stopColor="#2b0305" stopOpacity="0.9" />
                  </radialGradient>
                  <linearGradient id={`splatDrip-${uid}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6e0b0f" stopOpacity="0.95" />
                    <stop offset="58%" stopColor="#991418" stopOpacity="0.92" />
                    <stop offset="100%" stopColor="#420508" stopOpacity="0.86" />
                  </linearGradient>
                </defs>

                {/* Upper-right heavy soaked blood crown with jagged organic drip rivulets */}
                <path
                  d="M 48 0 L 88 0 L 88 30 C 84 28, 82 32, 80 39 C 78.5 44, 76 44, 76 38 C 76 31, 73 25, 70 28 C 67.5 30.5, 67 48, 64.5 52 C 62.5 55, 61.5 49, 62 41 C 62.5 32, 59 24, 55.5 27 C 53 29.5, 53.5 39, 51.5 41.5 C 49.5 43.5, 49 36, 49.5 29 C 50 21, 44 16, 41 11 C 38 6, 42 2, 48 0 Z"
                  fill={`url(#splatDrip-${uid})`}
                />

                {/* Lower-left ragged spatter impact & downward smear */}
                <path
                  d="M 14 73 C 17 70, 21 71, 24 75 C 27 78, 32 77, 34 80 C 35.5 82.5, 31 84.5, 29 87 C 27 90, 31 94, 28.5 96.5 C 26 99, 23 93, 20.5 94.5 C 18 96, 18.5 107, 16 109.5 C 13.8 111.5, 13.5 103, 14 97 C 14.5 91, 9 91, 7.5 86.5 C 6 82, 10 79, 9.5 76 C 9 73.5, 11.5 75, 14 73 Z"
                  fill={`url(#splatDeep-${uid})`}
                />

                {/* Lower-right coagulated thumbprint edge stain */}
                <path
                  d="M 66 101 C 72 96, 81 95, 88 90 L 88 125 L 58 125 C 58 117, 60 106, 66 101 Z"
                  fill={`url(#splatDeep-${uid})`}
                  opacity="0.82"
                />

                {/* Sharp directional arterial cast-off streaks & fine mist spatter */}
                <g fill="#700b0f" opacity="0.92">
                  <path d="M 27 77 L 39 67 C 40 66.5, 37.5 70, 29 79 Z" />
                  <path d="M 15 74 L 7 61 C 6.5 60, 10 62.5, 17 72.5 Z" />
                  <path d="M 30 85 L 44 90 C 45.5 90.5, 41.5 91.5, 29 87.5 Z" />
                  <path d="M 50 18 L 31 11 C 29.5 10.5, 34 9.5, 51 15.5 Z" />
                  <path d="M 76 47 L 83 56 C 83.5 57, 80.5 55.5, 75 49 Z" />
                  <ellipse cx="36" cy="24" rx="1.9" ry="2.6" transform="rotate(-22 36 24)" />
                  <ellipse cx="26" cy="17" rx="1.2" ry="1.8" transform="rotate(-30 26 17)" />
                  <circle cx="19" cy="27" r="1.1" />
                  <circle cx="43" cy="36" r="1.4" />
                  <circle cx="46" cy="44" r="0.9" />
                  <ellipse cx="69" cy="64" rx="1.6" ry="2.7" transform="rotate(11 69 64)" />
                  <circle cx="75" cy="56" r="1.1" />
                  <circle cx="57" cy="58" r="1.2" />
                  <circle cx="44" cy="76" r="1.3" />
                  <circle cx="49" cy="83" r="0.9" />
                  <ellipse cx="36" cy="107" rx="1.8" ry="2.5" transform="rotate(14 36 107)" />
                  <circle cx="44" cy="112" r="1.2" />
                  <circle cx="29" cy="116" r="0.95" />
                  <circle cx="10" cy="104" r="1.4" />
                  <circle cx="21" cy="59" r="1.0" />
                  <circle cx="77" cy="78" r="1.2" />
                  <circle cx="71" cy="86" r="0.85" />
                </g>

                {/* Crisp dark-rose wet highlights on heavy drip tips */}
                <g fill="#f87171" opacity="0.48">
                  <ellipse cx="64.2" cy="49.2" rx="0.8" ry="1.7" />
                  <ellipse cx="77.2" cy="40.5" rx="0.7" ry="1.4" />
                  <ellipse cx="51.2" cy="39.2" rx="0.65" ry="1.2" />
                  <ellipse cx="16.2" cy="106.8" rx="0.7" ry="1.4" />
                  <ellipse cx="17.8" cy="81.2" rx="1.1" ry="2.0" transform="rotate(-14 17.8 81.2)" />
                </g>
              </svg>
            </div>
          )}

          {/* Optional Sealed Binding Overlay (Masked to Exact Card Shape) */}
          {isSealed && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-20 bg-red-950/35 flex items-center justify-center"
              style={maskStyle}
            >
              <svg viewBox="0 0 88 125" className="w-full h-full opacity-80">
                <line x1="6" y1="20" x2="82" y2="105" stroke="#7f1d1d" strokeWidth="4" />
                <line x1="6" y1="20" x2="82" y2="105" stroke="#b91c1c" strokeWidth="1.2" strokeDasharray="4 3" />
                <line x1="82" y1="20" x2="6" y2="105" stroke="#7f1d1d" strokeWidth="4" />
                <line x1="82" y1="20" x2="6" y2="105" stroke="#b91c1c" strokeWidth="1.2" strokeDasharray="4 3" />
              </svg>
            </div>
          )}
        </button>
      </div>

      {/* Diegetic Blood-Debt Warning Signifier (Positioned absolutely so it never shifts deck layout!) */}
      {isBloodExhausted && !isSealed && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-full mt-1 left-1/2 -translate-x-1/2 flex items-center gap-1 whitespace-nowrap z-30"
        >
          <svg viewBox="0 0 10 13" className="w-[8px] h-[10px] shrink-0 drop-shadow-[0_0_5px_rgba(239,68,68,0.95)]">
            <path
              d="M 5 0.8 C 5 0.8, 9 5.8, 9 8.5 C 9 10.8, 7.2 12.2, 5 12.2 C 2.8 12.2, 1 10.8, 1 8.5 C 1 5.8, 5 0.8, 5 0.8 Z"
              fill="#dc2626"
              stroke="#fca5a5"
              strokeWidth="0.65"
            />
            <ellipse cx="3.6" cy="8.2" rx="0.8" ry="1.4" fill="#fecaca" opacity="0.65" />
          </svg>
          <span
            className="font-mono text-[9.5px] font-black uppercase tracking-[0.14em] text-[#fecaca]"
            style={{ textShadow: '0 1px 4px rgba(0,0,0,1), 0 0 8px rgba(220,38,38,0.95)' }}
          >
            -1 BLOOD
          </span>
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   5. SIGIL / CREST INSPECTION RELIQUARY MODAL (CARVED SLATE & FORGED BRASS)
   ========================================================================= */
export interface SigilInspectionModalProps {
  name: string;
  desc: string;
  artUrl: string;
  fallbackSymbol?: string;
  onClose: () => void;
}

const SIGIL_PLAQUE_CLIP =
  'polygon(14px 1px, calc(100% - 14px) 1px, calc(100% - 1px) 14px, calc(100% - 1px) calc(100% - 14px), calc(100% - 14px) calc(100% - 1px), 14px calc(100% - 1px), 1px calc(100% - 14px), 1px 14px)';

export const SigilInspectionModal: React.FC<SigilInspectionModalProps> = ({
  name,
  desc,
  artUrl,
  fallbackSymbol = '✦',
  onClose,
}) => {
  const uid = useId().replace(/:/g, '');
  const baseUrl = import.meta.env.BASE_URL || './';
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [name, artUrl]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-[3px] select-none"
      role="dialog"
      aria-modal="true"
      aria-label={`${name} Crest Description`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-sigil-modal-in relative w-full max-w-[356px] px-7 pt-7 pb-6 flex flex-col items-center text-center"
        style={{
          filter: 'drop-shadow(0 24px 44px rgba(0,0,0,0.96)) drop-shadow(0 0 18px rgba(107,15,18,0.28))',
        }}
      >
        {/* 1. CARVED AGED-SLATE OCTAGONAL BODY */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            clipPath: SIGIL_PLAQUE_CLIP,
            backgroundImage: `radial-gradient(ellipse 90% 48% at 50% 6%, rgba(136, 20, 24, 0.34) 0%, rgba(36, 24, 18, 0.42) 48%, rgba(8, 6, 6, 0.92) 100%), linear-gradient(180deg, rgba(24, 19, 16, 0.68) 0%, rgba(10, 8, 8, 0.9) 100%), url("${baseUrl}assets/text/slate.jpg")`,
            backgroundSize: 'cover, cover, 160px 160px',
            backgroundPosition: 'center',
          }}
        />

        {/* 2. BEVELED STONE PERIMETER, ENGRAVED GROOVE & FORGED-BRASS CORNER CLASPS */}
        <svg
          viewBox="0 0 356 290"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 w-full h-full overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`sigilEdge-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#b08749" stopOpacity="0.92" />
              <stop offset="35%" stopColor="#5e4632" stopOpacity="0.9" />
              <stop offset="72%" stopColor="#3b2b20" stopOpacity="0.92" />
              <stop offset="100%" stopColor="#8f6a38" stopOpacity="0.88" />
            </linearGradient>
            <linearGradient id={`sigilBrass-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2c1b0d" />
              <stop offset="38%" stopColor="#9f773d" />
              <stop offset="62%" stopColor="#e2be7d" />
              <stop offset="100%" stopColor="#3e2611" />
            </linearGradient>
          </defs>

          {/* Outer shadow & chamfered slate bevel */}
          <polygon
            points="14,1 342,1 355,14 355,276 342,289 14,289 1,276 1,14"
            fill="none"
            stroke="#060404"
            strokeWidth="3"
          />
          <polygon
            points="14,1 342,1 355,14 355,276 342,289 14,289 1,276 1,14"
            fill="none"
            stroke={`url(#sigilEdge-${uid})`}
            strokeWidth="1.4"
          />

          {/* Recessed engraved inner brass hairline frame */}
          <polygon
            points="20,7.5 336,7.5 348.5,20 348.5,270 336,282.5 20,282.5 7.5,270 7.5,20"
            fill="none"
            stroke="rgba(196, 154, 92, 0.28)"
            strokeWidth="0.9"
          />

          {/* Subtle aged-stone hairline fissures */}
          <path d="M 10 92 L 22 99 L 18 109" fill="none" stroke="#080505" strokeWidth="1" opacity="0.65" />
          <path d="M 346 196 L 333 203 L 338 214" fill="none" stroke="#080505" strokeWidth="1" opacity="0.65" />

          {/* Four Forged Tarnished-Brass Corner Clamp Brackets */}
          <path d="M 14 0.5 L 40 0.5 L 40 4.5 L 16.5 4.5 L 4.5 16.5 L 4.5 40 L 0.5 40 L 0.5 14 Z" fill={`url(#sigilBrass-${uid})`} stroke="#140c07" strokeWidth="0.8" />
          <path d="M 342 0.5 L 316 0.5 L 316 4.5 L 339.5 4.5 L 351.5 16.5 L 351.5 40 L 355.5 40 L 355.5 14 Z" fill={`url(#sigilBrass-${uid})`} stroke="#140c07" strokeWidth="0.8" />
          <path d="M 14 289.5 L 40 289.5 L 40 285.5 L 16.5 285.5 L 4.5 273.5 L 4.5 250 L 0.5 250 L 0.5 276 Z" fill={`url(#sigilBrass-${uid})`} stroke="#140c07" strokeWidth="0.8" />
          <path d="M 342 289.5 L 316 289.5 L 316 285.5 L 339.5 285.5 L 351.5 273.5 L 351.5 250 L 355.5 250 L 355.5 276 Z" fill={`url(#sigilBrass-${uid})`} stroke="#140c07" strokeWidth="0.8" />

          {/* Corner Forged Brass Rivets */}
          {[
            [15.5, 15.5],
            [340.5, 15.5],
            [15.5, 274.5],
            [340.5, 274.5],
          ].map(([cx, cy], idx) => (
            <g key={idx}>
              <circle cx={cx} cy={cy} r="3" fill="#090605" />
              <circle cx={cx} cy={cy} r="2.1" fill="#4f371e" stroke="#dfba7c" strokeWidth="0.6" />
              <circle cx={cx - 0.55} cy={cy - 0.55} r="0.65" fill="#fef0c7" opacity="0.72" />
            </g>
          ))}
        </svg>

        {/* 3. FORGED-BRASS & SMOKED-OBSIDIAN RELIQUARY CREST MEDALLION */}
        <div className="relative mb-3.5 w-[78px] h-[78px] flex items-center justify-center">
          {/* Warm crimson-gold backlit ember aura */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-2.5 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(185, 28, 28, 0.34) 0%, rgba(180, 120, 48, 0.14) 48%, transparent 74%)',
            }}
          />
          <svg
            viewBox="0 0 80 80"
            className="pointer-events-none absolute inset-0 w-full h-full overflow-visible drop-shadow-[0_4px_10px_rgba(0,0,0,0.95)]"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={`medRing-${uid}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#e5c185" />
                <stop offset="32%" stopColor="#8f6a38" />
                <stop offset="68%" stopColor="#3a2512" />
                <stop offset="100%" stopColor="#c49a5c" />
              </linearGradient>
              <radialGradient id={`medWell-${uid}`} cx="50%" cy="42%" r="58%">
                <stop offset="0%" stopColor="#281613" />
                <stop offset="62%" stopColor="#120a09" />
                <stop offset="100%" stopColor="#070404" />
              </radialGradient>
            </defs>
            {/* Outer forged-iron flange */}
            <circle cx="40" cy="40" r="38" fill="#140d0a" stroke="#080504" strokeWidth="1.5" />
            {/* Tarnished-brass stepped bezel */}
            <circle cx="40" cy="40" r="35.2" fill={`url(#medWell-${uid})`} stroke={`url(#medRing-${uid})`} strokeWidth="2.8" />
            {/* Fine inner engraved crimson-gold ring */}
            <circle cx="40" cy="40" r="30.2" fill="none" stroke="rgba(185, 28, 28, 0.45)" strokeWidth="0.9" strokeDasharray="3 2.2" />
            {/* Cardinal brass studs */}
            {[
              [40, 4.8],
              [75.2, 40],
              [40, 75.2],
              [4.8, 40],
            ].map(([cx, cy], idx) => (
              <circle key={idx} cx={cx} cy={cy} r="1.8" fill="#dfba7c" stroke="#1b1109" strokeWidth="0.6" />
            ))}
          </svg>

          {/* Actual Sigil / Crest Artwork (with graceful symbol fallback) */}
          <div className="relative z-10 w-[50px] h-[50px] flex items-center justify-center">
            {!imgFailed && artUrl ? (
              <img
                src={artUrl}
                alt={name}
                onError={() => setImgFailed(true)}
                className="w-full h-full object-contain select-none"
                style={{
                  imageRendering: 'pixelated',
                  filter: 'drop-shadow(0 0 8px rgba(220, 38, 38, 0.48)) drop-shadow(0 2px 3px rgba(0,0,0,0.95))',
                }}
              />
            ) : (
              <span
                className="text-3xl leading-none text-[#e5c185]"
                style={{ textShadow: '0 0 10px rgba(185,28,28,0.65), 0 2px 4px rgba(0,0,0,1)' }}
              >
                {fallbackSymbol}
              </span>
            )}
          </div>
        </div>

        {/* 4. EYEBROW, ENGRAVED TITLE & CRIMSON-BRASS DIVIDER */}
        <div
          className="font-['Cinzel',_serif] text-[9.5px] font-bold uppercase tracking-[0.28em] text-[#c49a5c]/90 mb-1"
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.95)' }}
        >
          ◆ Crest Inscription ◆
        </div>
        <h3
          className="font-['Cinzel',_serif] text-[18px] font-bold uppercase tracking-[0.15em] text-[#f3dfb8] leading-tight"
          style={{ textShadow: '0 2px 6px rgba(0,0,0,1), 0 0 14px rgba(185,28,28,0.35)' }}
        >
          {name}
        </h3>

        {/* Tapered Brass-Crimson Rule with Centered Crimson Diamond */}
        <div className="w-full flex items-center justify-center gap-2 my-3.5" aria-hidden="true">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#9f773d]/75 to-[#b91c1c]/85" />
          <svg viewBox="0 0 10 10" className="w-[9px] h-[9px] shrink-0 overflow-visible">
            <polygon points="5,0.6 9.4,5 5,9.4 0.6,5" fill="#991b1b" stroke="#dfba7c" strokeWidth="0.9" />
          </svg>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#9f773d]/75 to-[#b91c1c]/85" />
        </div>

        {/* 5. RECESSED INSCRIPTION DESCRIPTION CHANNEL */}
        <div className="relative w-full px-4 py-3.5 mb-5 bg-[#080505]/72 border border-[#4a3524]/65 shadow-[inset_0_2px_10px_rgba(0,0,0,0.92)]">
          <span className="pointer-events-none absolute top-0.5 left-0.5 w-2 h-2 border-t border-l border-[#b08749]/55" />
          <span className="pointer-events-none absolute top-0.5 right-0.5 w-2 h-2 border-t border-r border-[#b08749]/55" />
          <span className="pointer-events-none absolute bottom-0.5 left-0.5 w-2 h-2 border-b border-l border-[#b08749]/55" />
          <span className="pointer-events-none absolute bottom-0.5 right-0.5 w-2 h-2 border-b border-r border-[#b08749]/55" />
          <p className="font-mono text-[12px] text-[#e1d1ba] leading-relaxed">
            {desc}
          </p>
        </div>

        {/* 6. SCULPTED FORGED-BRASS & SLATE DISMISS BUTTON */}
        <RitualSlateButton label="CLOSE" onClick={onClose} />
      </div>
    </div>
  );
};

/* =========================================================================
   6. ARCHITECTURAL CHAMFERED SLATE & FORGED-BRASS RELIQUARY CONTAINER SHELL
      (Shared by Sanctuary Pause Menu, Deck View, Compendium & Ritual Ledger)
   ========================================================================= */
export interface RitualReliquaryShellProps {
  children: React.ReactNode;
  variant?: 'crimson' | 'obsidian';
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

const RELIQUARY_SHELL_CLIP =
  'polygon(16px 1px, calc(100% - 16px) 1px, calc(100% - 1px) 16px, calc(100% - 1px) calc(100% - 16px), calc(100% - 16px) calc(100% - 1px), 16px calc(100% - 1px), 1px calc(100% - 16px), 1px 16px)';

export const RitualReliquaryShell: React.FC<RitualReliquaryShellProps> = ({
  children,
  variant = 'crimson',
  className = '',
  onClick,
}) => {
  const uid = useId().replace(/:/g, '');
  const baseUrl = import.meta.env.BASE_URL || './';
  const isObsidian = variant === 'obsidian';

  const metalStops = isObsidian
    ? { c0: '#27232c', c1: '#867e90', c2: '#cfc8d8', c3: '#36303d', edge: 'rgba(176,166,188,0.58)', inner: 'rgba(176,166,188,0.22)', rivetStroke: '#d4cde0' }
    : { c0: '#2a1a0c', c1: '#9f773d', c2: '#e2be7d', c3: '#3d2511', edge: 'rgba(182,140,78,0.68)', inner: 'rgba(196,154,92,0.24)', rivetStroke: '#dfba7c' };

  const renderCornerClamp = (cornerKey: string, posClass: string, transform: string) => (
    <svg
      viewBox="0 0 46 46"
      className={`pointer-events-none absolute ${posClass} w-[46px] h-[46px] z-30 overflow-visible`}
      style={{ transform }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`shellBrass-${uid}-${cornerKey}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={metalStops.c0} />
          <stop offset="38%" stopColor={metalStops.c1} />
          <stop offset="65%" stopColor={metalStops.c2} />
          <stop offset="100%" stopColor={metalStops.c3} />
        </linearGradient>
      </defs>
      {/* Chamfered dark bevel shadow + forged metal corner bracket */}
      <path
        d="M 16 0.6 L 44 0.6 L 44 4.8 L 18.2 4.8 L 4.8 18.2 L 4.8 44 L 0.6 44 L 0.6 16 Z"
        fill={`url(#shellBrass-${uid}-${cornerKey})`}
        stroke="#100a06"
        strokeWidth="0.9"
      />
      {/* Crisp inner chamfer miter groove */}
      <path
        d="M 21 8 L 44 8 M 8 21 L 8 44 M 21 8 L 8 21"
        fill="none"
        stroke={metalStops.inner}
        strokeWidth="0.95"
      />
      {/* Forged corner rivet */}
      <circle cx="17.5" cy="17.5" r="3.1" fill="#080505" />
      <circle cx="17.5" cy="17.5" r="2.15" fill={isObsidian ? '#3e3846' : '#4f371e'} stroke={metalStops.rivetStroke} strokeWidth="0.65" />
      <circle cx="16.9" cy="16.9" r="0.65" fill="#fff7e6" opacity="0.72" />
    </svg>
  );

  return (
    <div
      onClick={onClick}
      className={`relative ${className}`}
      style={{
        filter: isObsidian
          ? 'drop-shadow(0 28px 52px rgba(0,0,0,0.97)) drop-shadow(0 0 18px rgba(108,96,128,0.16))'
          : 'drop-shadow(0 28px 52px rgba(0,0,0,0.97)) drop-shadow(0 0 22px rgba(112,18,22,0.24))',
      }}
    >
      {/* 1. CARVED AGED-SLATE OCTAGONAL STONE BODY */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          clipPath: RELIQUARY_SHELL_CLIP,
          backgroundImage: isObsidian
            ? `radial-gradient(ellipse 85% 42% at 50% 0%, rgba(56, 48, 68, 0.44) 0%, rgba(16, 14, 20, 0.72) 55%, rgba(7, 6, 9, 0.94) 100%), linear-gradient(180deg, rgba(22, 19, 26, 0.64) 0%, rgba(9, 8, 12, 0.9) 100%), url("${baseUrl}assets/text/slate.jpg")`
            : `radial-gradient(ellipse 90% 42% at 50% 0%, rgba(122, 18, 22, 0.42) 0%, rgba(34, 15, 13, 0.56) 46%, rgba(8, 5, 5, 0.93) 100%), linear-gradient(180deg, rgba(24, 17, 15, 0.66) 0%, rgba(9, 7, 7, 0.91) 100%), url("${baseUrl}assets/text/slate.jpg")`,
          backgroundSize: 'cover, cover, 180px 180px',
          backgroundPosition: 'center',
        }}
      />

      {/* Subtle recessed inner shadow well */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          clipPath: RELIQUARY_SHELL_CLIP,
          boxShadow: 'inset 0 6px 24px rgba(0,0,0,0.92), inset 0 -6px 24px rgba(0,0,0,0.9)',
        }}
      />

      {/* 2. PERIMETER CHAMFERED BEVEL RAILS & ENGRAVED INNER HAIRLINE (Zero aspect distortion) */}
      <div aria-hidden="true" className="pointer-events-none absolute top-[1px] left-[44px] right-[44px] h-[1.5px] z-30" style={{ background: metalStops.edge }} />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-[1px] left-[44px] right-[44px] h-[1.5px] z-30" style={{ background: metalStops.edge }} />
      <div aria-hidden="true" className="pointer-events-none absolute left-[1px] top-[44px] bottom-[44px] w-[1.5px] z-30" style={{ background: metalStops.edge }} />
      <div aria-hidden="true" className="pointer-events-none absolute right-[1px] top-[44px] bottom-[44px] w-[1.5px] z-30" style={{ background: metalStops.edge }} />

      <div aria-hidden="true" className="pointer-events-none absolute top-[8px] left-[44px] right-[44px] h-px z-30" style={{ background: metalStops.inner }} />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-[8px] left-[44px] right-[44px] h-px z-30" style={{ background: metalStops.inner }} />
      <div aria-hidden="true" className="pointer-events-none absolute left-[8px] top-[44px] bottom-[44px] w-px z-30" style={{ background: metalStops.inner }} />
      <div aria-hidden="true" className="pointer-events-none absolute right-[8px] top-[44px] bottom-[44px] w-px z-30" style={{ background: metalStops.inner }} />

      {/* 3. FOUR FIXED-PROPORTION FORGED METAL CORNER CLAMPS WITH RIVETS */}
      {renderCornerClamp('tl', 'top-0 left-0', 'none')}
      {renderCornerClamp('tr', 'top-0 right-0', 'scaleX(-1)')}
      {renderCornerClamp('bl', 'bottom-0 left-0', 'scaleY(-1)')}
      {renderCornerClamp('br', 'bottom-0 right-0', 'scale(-1, -1)')}

      {/* 4. CONTENT SLOT */}
      <div
        className="relative z-10 flex flex-col w-full h-full min-h-0 overflow-hidden"
        style={{ clipPath: RELIQUARY_SHELL_CLIP }}
      >
        {children}
      </div>
    </div>
  );
};

/* =========================================================================
   7. DIEGETIC FORGED-BRASS & ARTERIAL CRIMSON VOLUME SLIDER
   ========================================================================= */
export interface RitualBrassSliderProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  onPointerUp?: () => void;
}

export const RitualBrassSlider: React.FC<RitualBrassSliderProps> = ({
  label,
  value,
  onChange,
  onPointerUp,
}) => {
  const pct = Math.min(100, Math.max(0, Math.round(value * 100)));

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.18em]">
        <span className="text-[#d6c6ae]">{label}</span>
        <span
          className="font-bold text-[#ecc987]"
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.95)' }}
        >
          {pct}%
        </span>
      </div>
      <div className="relative h-5 flex items-center select-none">
        {/* Recessed Forged-Iron Channel Track */}
        <div className="relative w-full h-[6px] rounded-[1px] bg-[#0a0505] border border-[#4a3524]/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.95)] overflow-hidden">
          <div
            className="h-full transition-[width] duration-75"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, #5e0b0f 0%, #991b1b 55%, #c99449 100%)',
              boxShadow: '0 0 8px rgba(185,28,28,0.65)',
            }}
          />
        </div>
        {/* Forged Tarnished-Brass Diamond Slider Thumb */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[14px] h-[14px] transition-[left] duration-75"
          style={{ left: `${pct}%` }}
        >
          <svg viewBox="0 0 14 14" className="w-full h-full overflow-visible drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
            <polygon points="7,0.8 13.2,7 7,13.2 0.8,7" fill="#3a2512" stroke="#e2be7d" strokeWidth="1.2" />
            <polygon points="7,3.4 10.6,7 7,10.6 3.4,7" fill="#991b1b" />
            <circle cx="7" cy="7" r="1.2" fill="#fde68a" />
          </svg>
        </div>
        {/* Native Accessible Range Overlay */}
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          onPointerUp={onPointerUp}
          aria-label={label}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer touch-manipulation"
        />
      </div>
    </div>
  );
};


