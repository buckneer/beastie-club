import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { G, Path, Text } from 'react-native-svg';

type DebugWheelProps = {
	wheelSize: number;
};

const DebugWheel: React.FC<DebugWheelProps> = ({ wheelSize }) => {
	const prizes = [
		'FREE BURGER',
		'NO REWARD',
		'20% OFF',
		'NO REWARD',
		'10% OFF',
		'NO REWARD',
		'30% OFF',
		'NO REWARD',
		'20% OFF',
		'NO REWARD',
		'10% OFF',
		'NO REWARD',
	];

	const radius = wheelSize / 2;
	const numberOfSegments = prizes.length;
	const segmentAngle = 360 / numberOfSegments;

	const getSegmentPath = (startAngle: number, endAngle: number, radius: number) => {
		const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
		const start = polarToCartesian(radius, radius, radius, endAngle);
		const end = polarToCartesian(radius, radius, radius, startAngle);

		return [
			'M', radius, radius,
			'L', start.x, start.y,
			'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
			'Z'
		].join(' ');
	};

	const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
		const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

		return {
			x: centerX + (radius * Math.cos(angleInRadians)),
			y: centerY + (radius * Math.sin(angleInRadians))
		};
	};

	const segments = prizes.map((label, index) => {
		const startAngle = index * segmentAngle;
		const endAngle = startAngle + segmentAngle;

		return { label, startAngle, endAngle };
	});

	return (
		<View style={[styles.container, { width: wheelSize, height: wheelSize }]}>
			<Svg width={wheelSize} height={wheelSize}>
				<G>
					{segments.map((segment, index) => (
						<G key={index}>
							<Path
								d={getSegmentPath(segment.startAngle, segment.endAngle, radius)}
								fill={`hsl(${(index * 360 / numberOfSegments)}, 100%, 50%)`}
								stroke="#000"
								strokeWidth="1"
							/>
							<Text
								x={polarToCartesian(radius, radius, radius - 40, segment.startAngle + segmentAngle / 2).x}
								y={polarToCartesian(radius, radius, radius - 40, segment.startAngle + segmentAngle / 2).y}
								fill="#000"
								textAnchor="middle"
								fontSize="12"
								fontWeight="bold"
								transform={`rotate(${segment.startAngle + segmentAngle / 2} ${radius} ${radius})`}
							>
								{segment.label}
							</Text>
						</G>
					))}
				</G>
			</Svg>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		justifyContent: 'center',
		alignItems: 'center',
	},
});

export default DebugWheel;
