export function OrnateRule({ className }) {
  return (
    <div className={className} style={className ? undefined : ornateStyle} aria-hidden="true">
      <span style={lineStyle} />
      <svg width="6" height="6" viewBox="0 0 6 6">
        <rect x="3" y="0" width="4.24" height="4.24" transform="rotate(45 3 3)" fill="currentColor" />
      </svg>
      <span style={lineStyle} />
    </div>
  );
}

const ornateStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  color: 'rgba(26, 23, 20, 0.14)',
  margin: '0.6rem 0',
};

const lineStyle = { flex: 1, height: 1, background: 'currentColor' };

export function Leaf({ className }) {
  return (
    <svg
      className={className}
      width="11"
      height="11"
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={className ? undefined : { color: 'var(--color-accent)', flexShrink: 0 }}
    >
      <path
        d="M12 2 C 6 6, 4 12, 4 20 C 10 20, 18 16, 20 8 C 16 6, 14 4, 12 2 Z"
        fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"
      />
      <path d="M6 18 Q 12 12, 18 8" fill="none" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}
