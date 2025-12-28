'use client';

import { useRef, useState, useEffect } from 'react';
import DraggableImage from './DraggableImage';
import { ImagePosition } from '@/lib/recipes';

interface RecipePageProps {
    content: string;
    images: ImagePosition[];
    isEditing: boolean;
    fontSize?: number;
    fontFamily?: string;
    fontColor?: string;
    onContentChange?: (content: string) => void;
    onImageUpdate?: (id: string, updates: { x: number; y: number; width: number; height: number }) => void;
    onImageDelete?: (id: string) => void;
    onImageUpload?: (file: File) => void;
    placeholder?: string;
}

export default function RecipePage({
    content,
    images,
    isEditing,
    fontSize = 16,
    fontFamily = 'Georgia, serif',
    fontColor = '#5D4037',
    onContentChange,
    onImageUpdate,
    onImageDelete,
    onImageUpload,
    placeholder = 'İçerik ekleyin...',
}: RecipePageProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                setContainerSize({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight,
                });
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);

        // Use ResizeObserver for more accurate tracking
        const resizeObserver = new ResizeObserver(updateSize);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            window.removeEventListener('resize', updateSize);
            resizeObserver.disconnect();
        };
    }, []);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingOver(false);

        if (!isEditing || !onImageUpload) return;

        const files = Array.from(e.dataTransfer.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));

        imageFiles.forEach(file => onImageUpload(file));
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (isEditing) setIsDraggingOver(true);
    };

    const handleDragLeave = () => {
        setIsDraggingOver(false);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || !onImageUpload) return;

        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                onImageUpload(file);
            }
        });

        // Reset input
        e.target.value = '';
    };

    const textStyles = {
        fontFamily,
        fontSize: `${fontSize}px`,
        color: fontColor,
        lineHeight: 1.6,
    };

    return (
        <div
            ref={containerRef}
            className={`relative h-full min-h-[600px] ${isDraggingOver ? 'bg-[#E9967A]/10 border-2 border-dashed border-[#E9967A]' : ''
                }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
        >
            {/* Images layer */}
            <div className="absolute inset-0 overflow-hidden">
                {images.map((img) => (
                    <DraggableImage
                        key={img.id}
                        {...img}
                        isEditing={isEditing}
                        containerWidth={containerSize.width}
                        containerHeight={containerSize.height}
                        onUpdate={onImageUpdate || (() => { })}
                        onDelete={onImageDelete || (() => { })}
                    />
                ))}
            </div>

            {/* Content layer */}
            <div className="relative z-10 h-full">
                {isEditing ? (
                    <textarea
                        value={content}
                        onChange={(e) => onContentChange?.(e.target.value)}
                        placeholder={placeholder}
                        className="w-full h-full min-h-[600px] bg-transparent resize-none focus:outline-none leading-relaxed"
                        style={textStyles}
                    />
                ) : (
                    <div
                        className="whitespace-pre-wrap leading-relaxed"
                        style={textStyles}
                    >
                        {content || <span className="text-gray-400 italic">{placeholder}</span>}
                    </div>
                )}
            </div>

            {/* Image upload button (editing mode) */}
            {isEditing && (
                <>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-[#E9967A] to-[#F4A460] text-white rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center text-2xl z-50"
                        title="Görsel Ekle"
                    >
                        📷
                    </button>
                </>
            )}

            {/* Drop zone indicator */}
            {isEditing && isDraggingOver && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#E9967A]/20 z-40 pointer-events-none">
                    <div className="text-[#8B4513] text-lg font-medium bg-white/80 px-6 py-3 rounded-lg">
                        Görseli buraya bırakın
                    </div>
                </div>
            )}
        </div>
    );
}
