'use client';

import { useState, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import Image from 'next/image';

interface DraggableImageProps {
    id: string;
    url: string;
    x: number; // percentage
    y: number; // percentage
    width: number; // percentage
    height: number; // percentage
    zIndex: number;
    isEditing: boolean;
    containerWidth: number;
    containerHeight: number;
    onUpdate: (id: string, updates: { x: number; y: number; width: number; height: number }) => void;
    onDelete: (id: string) => void;
}

export default function DraggableImage({
    id,
    url,
    x,
    y,
    width,
    height,
    zIndex,
    isEditing,
    containerWidth,
    containerHeight,
    onUpdate,
    onDelete,
}: DraggableImageProps) {
    const [isHovered, setIsHovered] = useState(false);

    // Convert percentage to pixels
    const pixelX = (x / 100) * containerWidth;
    const pixelY = (y / 100) * containerHeight;
    const pixelWidth = (width / 100) * containerWidth;
    const pixelHeight = (height / 100) * containerHeight;

    const handleDragStop = (_e: unknown, d: { x: number; y: number }) => {
        // Convert pixels back to percentage
        const newX = (d.x / containerWidth) * 100;
        const newY = (d.y / containerHeight) * 100;
        onUpdate(id, { x: newX, y: newY, width, height });
    };

    const handleResizeStop = (
        _e: unknown,
        _direction: unknown,
        ref: HTMLElement,
        _delta: unknown,
        position: { x: number; y: number }
    ) => {
        // Convert pixels back to percentage
        const newWidth = (parseInt(ref.style.width) / containerWidth) * 100;
        const newHeight = (parseInt(ref.style.height) / containerHeight) * 100;
        const newX = (position.x / containerWidth) * 100;
        const newY = (position.y / containerHeight) * 100;
        onUpdate(id, { x: newX, y: newY, width: newWidth, height: newHeight });
    };

    if (!isEditing) {
        // View mode - just display the image
        return (
            <div
                className="absolute"
                style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    width: `${width}%`,
                    height: `${height}%`,
                    zIndex,
                }}
            >
                <Image
                    src={url}
                    alt=""
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                />
            </div>
        );
    }

    // Edit mode - draggable and resizable
    return (
        <Rnd
            position={{ x: pixelX, y: pixelY }}
            size={{ width: pixelWidth, height: pixelHeight }}
            onDragStop={handleDragStop}
            onResizeStop={handleResizeStop}
            bounds="parent"
            style={{ zIndex: zIndex + 100 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`${isHovered ? 'ring-2 ring-[#E9967A]' : ''}`}
            minWidth={50}
            minHeight={50}
        >
            <div className="relative w-full h-full group">
                <Image
                    src={url}
                    alt=""
                    fill
                    className="object-contain pointer-events-none"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    draggable={false}
                />

                {/* Delete button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(id);
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-sm font-bold hover:bg-red-600 z-50"
                >
                    ×
                </button>

                {/* Resize handles indicator */}
                <div className="absolute inset-0 border-2 border-dashed border-[#E9967A]/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
        </Rnd>
    );
}
