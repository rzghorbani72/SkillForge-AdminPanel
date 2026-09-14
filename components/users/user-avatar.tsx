function getInitials(name?: string) {
  if (!name) return '?';
  return name
    .trim()
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function toneToHsl(tone: number) {
  return {
    bg: `hsl(${tone} 80% 95%)`,
    text: `hsl(${tone} 70% 38%)`,
    dot: `hsl(${tone} 70% 50%)`,
  };
}

export function UserAvatar({
  name,
  tone = 22,
  size = 32,
}: {
  name?: string;
  tone?: number;
  size?: number;
}) {
  const colors = toneToHsl(tone);
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: colors.bg,
        color: colors.text,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        fontSize: size * 0.35,
        flexShrink: 0,
      }}
    >
      {getInitials(name)}
    </span>
  );
}
