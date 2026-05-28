interface TimerDisplayProps {
  seconds: number;
  size?: 'small' | 'large';
}

export default function TimerDisplay({ seconds, size = 'large' }: TimerDisplayProps) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const display = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const sizeClass = size === 'large' ? 'text-9xl' : 'text-4xl';

  return (
    <div className={`font-mono font-bold ${sizeClass} text-center`}>
      {display}
    </div>
  );
}
