'use client';

import { QRCodeCanvas } from 'qrcode.react';

interface QRCodeComponentProps {
  timerId: string;
}

export default function QRCodeComponent({ timerId }: QRCodeComponentProps) {
  const mobileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/timer/${timerId}/mobile`
    : `https://localhost:3000/timer/${timerId}/mobile`;

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">Escaneie para controlar</p>
      <QRCodeCanvas
        value={mobileUrl}
        size={200}
        level="H"
        includeMargin={true}
      />
    </div>
  );
}
