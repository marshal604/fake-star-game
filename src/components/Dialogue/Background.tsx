interface BackgroundProps {
  location?: string | undefined;
  imageUrl?: string | undefined;
}

interface LocationStyle {
  gradient: string;
  accent: string;
  label: string;
}

const LOCATION_STYLES: Record<string, LocationStyle> = {
  office: {
    gradient: 'from-[#3a2c18] via-[#241b10] to-[#140f08]',
    accent: 'radial-gradient(ellipse at 50% 30%, rgba(245,209,168,0.15), transparent 60%)',
    label: '鉅子娛樂辦公室',
  },
  default: {
    gradient: 'from-[#1a1a18] via-[#121210] to-[#0a0a08]',
    accent: 'radial-gradient(ellipse at 50% 30%, rgba(201,149,74,0.08), transparent 60%)',
    label: '',
  },
};

export function Background({ location, imageUrl }: BackgroundProps) {
  const style = LOCATION_STYLES[location ?? ''] ?? LOCATION_STYLES.default;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {imageUrl ? (
        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <>
          <div className={`h-full w-full bg-gradient-to-b ${style.gradient}`} />
          <div className="absolute inset-0" style={{ backgroundImage: style.accent }} />
        </>
      )}
      <div className="absolute inset-0 bg-black/30" />
      {style.label ? (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[11px] tracking-[0.3em] text-ink-100/40 uppercase">
          {style.label}
        </div>
      ) : null}
    </div>
  );
}
