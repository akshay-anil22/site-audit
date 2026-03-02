import React, { useId } from 'react';

/**
 * Semi-circular health score gauge matching Figma properties.
 */
const HealthScoreCircle = ({ 
  score = 0, 
  size = 100, 
  strokeWidth = 14, 
  showLabel = true,
  className = ''
}) => {
  const pixelSize = size;
  const radius = (pixelSize - strokeWidth) / 2;
  const center = pixelSize / 2;

  const startAngle = 220;
  const endAngle = -40;
  const angleRange = startAngle - endAngle;
  const scoreEndAngle = startAngle - (score / 100) * angleRange;

  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const getPoint = (angleDeg) => {
    const rad = toRadians(angleDeg);
    return {
      x: center + radius * Math.cos(rad),
      y: center - radius * Math.sin(rad),
    };
  };
  
  const describeArc = (startDeg, endDeg) => {
    const start = getPoint(startDeg);
    const end = getPoint(endDeg);
    const largeArcFlag = Math.abs(startDeg - endDeg) > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  };

  const getLabel = (s) => {
    if (s >= 80) return 'Good';
    if (s >= 50) return 'Average';
    if (s >= 25) return 'Poor';
    return 'Critical';
  };

  const gradientId = useId().replace(/:/g, '-') + '-gauge';

  return (
    <div
      className={`relative flex flex-col items-center justify-center ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
    >
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox={`0 0 ${pixelSize} ${pixelSize}`}
        className="overflow-visible"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2={pixelSize} y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#22C55E" />
          </linearGradient>
        </defs>

        <path
          d={describeArc(startAngle, endAngle)}
          fill="none"
          stroke="#F4F4F5"
          strokeWidth={strokeWidth}
          strokeLinecap="butt" 
        />
        
        {score > 0 && (
          <path
            d={describeArc(startAngle, scoreEndAngle)}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="butt" 
            className="transition-all duration-1000 ease-out"
          />
        )}
      </svg>

      {/* ✨ EXACT FIGMA TYPOGRAPHY APPLIED HERE ✨ */}
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center mt-1">
          <div className="text-[25px] font-semibold text-[#71717A] leading-[27px]">{score}</div>
          <div className="text-[12px] font-medium text-[#71717A] mt-0.5">{getLabel(score)}</div>
        </div>
      )}
    </div>
  );
};

export { HealthScoreCircle };
export default HealthScoreCircle;