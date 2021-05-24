interface ProgressbarProps {
  progress: number;
  progressColor?: string;
  height?: string;
}

export default function ProgressBar({
  progress,
  progressColor = 'bg-gray-500',
  height = 'h-4',
}: ProgressbarProps): JSX.Element {
  return (
    <div className={`w-full rounded ${height}`}>
      <div
        className={`h-full ${progressColor}`}
        style={{
          width: `${progress.toFixed(2)}%`,
        }}
      ></div>
    </div>
  );
}
