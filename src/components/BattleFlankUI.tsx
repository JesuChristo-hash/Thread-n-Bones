import React, { useId } from 'react';

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
  variant?: 'default' | 'dev';
}

export const RitualSlateButton: React.FC<RitualSlateButtonProps> = ({
  label,
  onClick,
  icon,
  title,
  variant = 'default',
}) => {
  const uid = useId().replace(/:/g, '');
  const baseUrl = import.meta.env.BASE_URL || './';
  const isDev = variant === 'dev';

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="group/rbtn relative w-38 sm:w-40 py-[5.5px] px-3.5 flex items-center justify-center gap-2 cursor-pointer select-none bg-transparent border-0 outline-none transition-transform duration-120 hover:-translate-y-[1px] active:translate-y-[1px] active:scale-[0.985]"
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
            isDev
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
          background:
            'radial-gradient(ellipse 75% 110% at 50% 50%, rgba(127,20,24,0.42) 0%, rgba(180,125,55,0.12) 60%, transparent 100%)',
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
        className="pointer-events-none absolute -left-[2px] top-1/2 -translate-y-1/2 w-[11px] h-[22px] overflow-visible"
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
        className="pointer-events-none absolute -right-[2px] top-1/2 -translate-y-1/2 w-[11px] h-[22px] overflow-visible"
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
        className="relative z-10 font-['Cinzel',_serif] font-bold text-[10px] sm:text-[10.5px] uppercase tracking-[0.2em] text-[#d6c2a5] group-hover/rbtn:text-[#fff1d6] transition-colors duration-150"
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
}) => {
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
    <div className="group/deck flex flex-col items-center">
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
          <div className="w-full h-full bg-black/85" style={maskStyle} />
        </div>

        {/* Physical Layered Aged-Parchment Card Stack Edges (Exact cardbacks.png Ragged Silhouette!) */}
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
                  background: isEven
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
              ? 'cursor-pointer animate-deck-glow group-hover/deck:-translate-y-2 group-hover/deck:-rotate-[1.4deg] group-hover/deck:scale-[1.03] active:translate-y-0 active:scale-[0.98]'
              : 'opacity-92 cursor-not-allowed [filter:drop-shadow(0_1.5px_0_rgba(12,8,5,0.95))_drop-shadow(0_3px_5px_rgba(0,0,0,0.9))]'
          }`}
        >
          {/* Card Back Artwork (Exact Ragged Card Silhouette) */}
          <img
            src={cardBackSrc}
            alt={alt}
            className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
            style={{
              imageRendering: 'pixelated',
              filter: isDrawReady && !disabled ? 'brightness(1.04) contrast(1.05)' : 'brightness(0.86) contrast(1.05)',
            }}
          />

          {/* Dead-Center Iconic Crimson Glyphed S / C */}
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <img
              src={glyphSrc}
              alt={glyphAlt}
              className="deck-glyph-red h-14 sm:h-16 w-auto object-contain pointer-events-none select-none"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>

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
    </div>
  );
};
