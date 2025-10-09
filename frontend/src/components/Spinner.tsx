import React from 'react';

const SIZE = 60;
const STROKE_WIDTH = 4;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const Spinner: React.FC = () => {
	return (
		<div className="flex items-center justify-center p-5">
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
					stroke="#d00" // KeNIC red
					strokeWidth={STROKE_WIDTH}
					fill="none"
					strokeDasharray={`${CIRCUMFERENCE * 0.3}, ${CIRCUMFERENCE}`}
					strokeLinecap="round"
				/>
			</svg>
		</div>
	);
};

export default Spinner;
