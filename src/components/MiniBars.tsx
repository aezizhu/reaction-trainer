export default function MiniBars({ current, avg, width = 160, height = 40, labels = ['Current', '7d avg'], colors = ['#7c5cff', '#2b2f55'] }: { current: number; avg: number; width?: number; height?: number; labels?: [string, string] | string[]; colors?: [string, string] | string[] }) {
  const max = Math.max(current, avg, 1);
  const cH = Math.round((current / max) * (height - 16));
  const aH = Math.round((avg / max) * (height - 16));
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <rect x={20} y={height - cH - 6} width={40} height={cH} fill={colors[0]} rx={4} />
      <rect x={80} y={height - aH - 6} width={40} height={aH} fill={colors[1]} rx={4} />
      <text x={40} y={height - 2} textAnchor="middle" fontSize="10" fill="#aab1c4">{labels[0]}</text>
      <text x={100} y={height - 2} textAnchor="middle" fontSize="10" fill="#aab1c4">{labels[1]}</text>
    </svg>
  );
}


