import React from 'react';

const SIZE = 60;
const STROKE_WIDTH = 4;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const SpinnerOverlay: React.FC = () => {
	return (
		<div className="absolute inset-0 z-50 bg-slate-600/40 flex items-center justify-center p-20">
			<svg
				className="animate-spin"
				width={SIZE}
				height={SIZE}
				viewBox={`0 0 ${SIZE} ${SIZE}`}
			>
				<circle
					cx={SIZE / 2}
					cy={SIZE / 2}
					r={RADIUS}
					stroke="#ccc"
					strokeWidth={STROKE_WIDTH}
					fill="none"
				/>
				<circle
					cx={SIZE / 2}
					cy={SIZE / 2}
					r={RADIUS}
					stroke="#d00"
					strokeWidth={STROKE_WIDTH}
					fill="none"
					strokeDasharray={`${CIRCUMFERENCE * 0.3}, ${CIRCUMFERENCE}`}
					strokeLinecap="round"
				/>
			</svg>
		</div>
	);
};

export default SpinnerOverlay;
