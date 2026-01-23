'use client';

import { useEffect, useState } from 'react';

type IconType = 'disk' | 'heart' | 'star' | 'skull' | 'folder' | 'search' | 'lightning';

interface PixelIconProps {
    type: IconType;
    size?: number;
    className?: string;
    animated?: boolean;
}

export default function PixelIcon({ type, size = 24, className = '', animated = true }: PixelIconProps) {
    const [frame, setFrame] = useState(0);

    useEffect(() => {
        if (!animated) return;
        const interval = setInterval(() => {
            setFrame(f => (f + 1) % 2);
        }, 500); // 2FPS blink animation
        return () => clearInterval(interval);
    }, [animated]);

    // Simple 8x8 or 16x16 bitmaps defined as arrays of strings
    // '1' = filled, '0' = transparent
    const getPath = () => {
        switch (type) {
            case 'disk': // Floppy Disk
                return [
                    "01111110",
                    "11000011",
                    "10111101",
                    "10111101",
                    "10000001",
                    "10111101",
                    "11000011",
                    "01111110"
                ];
            case 'heart':
                return frame === 0 ? [
                    "01100110",
                    "11111111",
                    "11111111",
                    "01111110",
                    "00111100",
                    "00011000",
                    "00000000",
                    "00000000"
                ] : [
                    "00000000",
                    "01100110",
                    "11111111",
                    "01111110",
                    "00111100",
                    "00000000",
                    "00000000",
                    "00000000"
                ];
            case 'star':
                return [
                    "00010000",
                    "01010100",
                    "00111000",
                    "11111110",
                    "00111000",
                    "01010100",
                    "00010000",
                    "00000000"
                ];
            case 'folder':
                return [
                    "00000000",
                    "00111000",
                    "01100110",
                    "11000011",
                    "11000011",
                    "11111111",
                    "00000000",
                    "00000000"
                ];
            case 'search':
                return [
                    "00111000",
                    "01000100",
                    "10000010",
                    "10000010",
                    "01000100",
                    "00111100",
                    "00000110",
                    "00000011"
                ];
            case 'lightning':
                return [
                    "00001100",
                    "00011000",
                    "00110000",
                    "01111100",
                    "00001100",
                    "00011000",
                    "00110000",
                    "00100000"
                ];
            default: return [];
        }
    };

    const bitmap = getPath();
    const pixelSize = size / 8;

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className={className}
            style={{ shapeRendering: 'crispEdges' }} // Crucial for pixel art
        >
            {bitmap.map((row, y) =>
                row.split('').map((pixel, x) =>
                    pixel === '1' ? (
                        <rect
                            key={`${x}-${y}`}
                            x={x * pixelSize}
                            y={y * pixelSize}
                            width={pixelSize}
                            height={pixelSize}
                            fill="currentColor"
                        />
                    ) : null
                )
            )}
        </svg>
    );
}
