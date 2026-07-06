import { useState } from 'react';

export default function StampBadge({ status = 'pending', onSettle, size = 'md' }) {
  const [pressing, setPressing] = useState(false);

  const sizes = { sm: 'w-12 h-12 text-[6px]', md: 'w-14 h-14 text-[7px]', lg: 'w-16 h-16 text-[8px]' };

  const handleSettle = () => {
    if (status !== 'pending' || !onSettle) return;
    setPressing(true);
    setTimeout(() => {
      setPressing(false);
      onSettle();
    }, 400);
  };

  const isPending = status === 'pending';

  return (
    <div
      className={`stamp-badge ${isPending ? 'pending' : 'settled'} ${sizes[size]} ${pressing ? 'stamp-pressing' : ''} ${onSettle && isPending ? 'cursor-pointer' : ''}`}
      onClick={handleSettle}
      title={onSettle && isPending ? 'Click to settle' : undefined}
      role={onSettle && isPending ? 'button' : undefined}
      aria-label={`Status: ${status}`}
    >
      <span className="stamp-badge-text font-mono">
        {isPending ? 'PENDING' : 'SETTLED'}
      </span>
    </div>
  );
}
