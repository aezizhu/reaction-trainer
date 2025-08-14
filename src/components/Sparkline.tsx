export default function Sparkline({ data, width = 120, height = 32, color = '#7c5cff' }: { data: number[]; width?: number; height?: number; color?: string }) {
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const norm = (v: number) => (max === min ? 0.5 : (v - min) / (max - min));
  const pts = data.map((d, i) => `${(i / (data.length - 1)) * width},${height - norm(d) * height}`).join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline fill="none" stroke={color} strokeWidth="2" points={pts} />
    </svg>
  );
}


