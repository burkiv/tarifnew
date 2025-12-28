'use client';

import { useState, useRef, useEffect } from 'react';

interface RecipeEditorProps {
    title: string;
    category: string;
    categories: string[];
    fontSize: number;
    fontFamily: string;
    fontColor: string;
    onTitleChange: (title: string) => void;
    onCategoryChange: (category: string) => void;
    onFontSizeChange: (size: number) => void;
    onFontFamilyChange: (family: string) => void;
    onFontColorChange: (color: string) => void;
    onImageUpload: (file: File, page: 'left' | 'right') => void;
    onSave: () => void;
    onCancel: () => void;
    onHide: () => void;
    onDelete?: () => void;
    isNewRecipe: boolean;
    isSaving: boolean;
}

const FONT_FAMILIES = [
    { value: 'Georgia, serif', label: 'El Yazısı' },
    { value: 'Arial, sans-serif', label: 'Modern' },
    { value: '"Times New Roman", serif', label: 'Klasik' },
    { value: '"Courier New", monospace', label: 'Daktilo' },
    { value: '"Comic Sans MS", cursive', label: 'Eğlenceli' },
];

const FONT_COLORS = [
    { value: '#5D4037', label: 'Kahverengi' },
    { value: '#333333', label: 'Siyah' },
    { value: '#1a365d', label: 'Lacivert' },
    { value: '#744210', label: 'Koyu Turuncu' },
    { value: '#7b341e', label: 'Bordo' },
    { value: '#22543d', label: 'Yeşil' },
];

export default function RecipeEditor({
    title,
    category,
    categories,
    fontSize,
    fontFamily,
    fontColor,
    onTitleChange,
    onCategoryChange,
    onFontSizeChange,
    onFontFamilyChange,
    onFontColorChange,
    onImageUpload,
    onSave,
    onCancel,
    onHide,
    onDelete,
    isNewRecipe,
    isSaving,
}: RecipeEditorProps) {
    const [newCategory, setNewCategory] = useState('');
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [activeUploadPage, setActiveUploadPage] = useState<'left' | 'right'>('left');
    const [isMobile, setIsMobile] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleCategorySelect = (value: string) => {
        if (value === '__new__') {
            setShowNewCategory(true);
        } else {
            onCategoryChange(value);
            setShowNewCategory(false);
        }
    };

    const handleNewCategorySubmit = () => {
        if (newCategory.trim()) {
            onCategoryChange(newCategory.trim());
            setNewCategory('');
            setShowNewCategory(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                onImageUpload(file, activeUploadPage);
            }
        });

        e.target.value = '';
    };

    // Mobile: Full screen modal, Desktop: Side panel
    if (isMobile) {
        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
                <div className="bg-gradient-to-b from-[#FFE4E1] to-[#FFDAB9] w-full max-h-[90vh] rounded-t-3xl shadow-xl overflow-y-auto">
                    <div className="p-4 space-y-4">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-[#8B4513]">
                                {isNewRecipe ? 'Yeni Tarif' : 'Tarifi Düzenle'}
                            </h2>
                            <button
                                onClick={onHide}
                                className="text-[#8B4513] hover:text-[#5D4037] text-2xl w-8 h-8 flex items-center justify-center"
                            >
                                ×
                            </button>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-xs text-[#8B4513] mb-1">Tarif Adı</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => onTitleChange(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl border border-[#DEB887] bg-white focus:outline-none focus:ring-2 focus:ring-[#E9967A] text-[#5D4037]"
                                placeholder="Örn: Havuçlu Kek"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-xs text-[#8B4513] mb-1">Kategori</label>
                            {showNewCategory ? (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        className="flex-1 px-3 py-2.5 rounded-xl border border-[#DEB887] bg-white focus:outline-none focus:ring-2 focus:ring-[#E9967A] text-[#5D4037]"
                                        placeholder="Yeni kategori"
                                        onKeyDown={(e) => e.key === 'Enter' && handleNewCategorySubmit()}
                                    />
                                    <button
                                        onClick={handleNewCategorySubmit}
                                        className="px-4 py-2.5 bg-[#E9967A] text-white rounded-xl hover:bg-[#CD853F]"
                                    >
                                        ✓
                                    </button>
                                </div>
                            ) : (
                                <select
                                    value={category}
                                    onChange={(e) => handleCategorySelect(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-xl border border-[#DEB887] bg-white focus:outline-none focus:ring-2 focus:ring-[#E9967A] text-[#5D4037]"
                                >
                                    <option value="">Kategori Seçin</option>
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                    <option value="__new__">+ Yeni Kategori</option>
                                </select>
                            )}
                        </div>

                        {/* Text Formatting - Compact for mobile */}
                        <div className="flex gap-3 items-end">
                            <div className="flex-1">
                                <label className="block text-xs text-[#8B4513] mb-1">Font</label>
                                <select
                                    value={fontFamily}
                                    onChange={(e) => onFontFamilyChange(e.target.value)}
                                    className="w-full px-2 py-2 rounded-lg border border-[#DEB887] bg-white text-[#5D4037] text-sm"
                                >
                                    {FONT_FAMILIES.map((font) => (
                                        <option key={font.value} value={font.value}>{font.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-20">
                                <label className="block text-xs text-[#8B4513] mb-1">{fontSize}px</label>
                                <input
                                    type="range"
                                    min="12"
                                    max="24"
                                    value={fontSize}
                                    onChange={(e) => onFontSizeChange(parseInt(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        {/* Color */}
                        <div>
                            <label className="block text-xs text-[#8B4513] mb-1">Renk</label>
                            <div className="flex gap-2 flex-wrap">
                                {FONT_COLORS.map((color) => (
                                    <button
                                        key={color.value}
                                        onClick={() => onFontColorChange(color.value)}
                                        className={`w-8 h-8 rounded-full border-2 transition-all ${fontColor === color.value
                                            ? 'border-[#E9967A] scale-110'
                                            : 'border-transparent'
                                            }`}
                                        style={{ backgroundColor: color.value }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setActiveUploadPage('left')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium ${activeUploadPage === 'left'
                                        ? 'bg-[#E9967A] text-white'
                                        : 'bg-white/50 text-[#8B4513]'
                                        }`}
                                >
                                    Sol Sayfa
                                </button>
                                <button
                                    onClick={() => setActiveUploadPage('right')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium ${activeUploadPage === 'right'
                                        ? 'bg-[#E9967A] text-white'
                                        : 'bg-white/50 text-[#8B4513]'
                                        }`}
                                >
                                    Sağ Sayfa
                                </button>
                            </div>

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full py-3 border-2 border-dashed border-[#DEB887] rounded-xl text-center text-[#8B4513] hover:border-[#E9967A]"
                            >
                                📷 Görsel Yükle
                            </button>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={onSave}
                                disabled={isSaving || !title.trim()}
                                className="flex-1 py-3 bg-gradient-to-r from-[#E9967A] to-[#F4A460] text-white font-semibold rounded-xl disabled:opacity-50"
                            >
                                {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                            </button>
                            <button
                                onClick={onCancel}
                                className="px-6 py-3 bg-white/50 text-[#8B4513] font-medium rounded-xl"
                            >
                                İptal
                            </button>
                        </div>

                        {!isNewRecipe && onDelete && (
                            <button
                                onClick={onDelete}
                                className="w-full py-3 bg-red-100 text-red-600 font-medium rounded-xl"
                            >
                                Tarifi Sil
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Desktop: Side panel
    return (
        <div className="fixed left-0 top-0 bottom-0 w-72 bg-gradient-to-b from-[#FFE4E1] to-[#FFDAB9] shadow-xl z-40 overflow-y-auto">
            <div className="p-5 space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-[#8B4513]">
                        {isNewRecipe ? 'Yeni Tarif' : 'Tarifi Düzenle'}
                    </h2>
                    <button
                        onClick={onHide}
                        className="text-[#8B4513] hover:text-[#5D4037] text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* Basic Info */}
                <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-[#CD853F] uppercase tracking-wide">
                        Temel Bilgiler
                    </h3>

                    {/* Title */}
                    <div>
                        <label className="block text-xs text-[#8B4513] mb-1">Tarif Adı</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => onTitleChange(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-[#DEB887] bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#E9967A] text-[#5D4037] text-sm"
                            placeholder="Örn: Havuçlu Kek"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-xs text-[#8B4513] mb-1">Kategori</label>
                        {showNewCategory ? (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    className="flex-1 px-3 py-2 rounded-lg border border-[#DEB887] bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#E9967A] text-[#5D4037] text-sm"
                                    placeholder="Yeni kategori"
                                    onKeyDown={(e) => e.key === 'Enter' && handleNewCategorySubmit()}
                                />
                                <button
                                    onClick={handleNewCategorySubmit}
                                    className="px-3 py-2 bg-[#E9967A] text-white rounded-lg hover:bg-[#CD853F] text-sm"
                                >
                                    ✓
                                </button>
                            </div>
                        ) : (
                            <select
                                value={category}
                                onChange={(e) => handleCategorySelect(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-[#DEB887] bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#E9967A] text-[#5D4037] text-sm"
                            >
                                <option value="">Kategori Seçin</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                                <option value="__new__">+ Yeni Kategori</option>
                            </select>
                        )}
                    </div>
                </div>

                {/* Text Formatting */}
                <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-[#CD853F] uppercase tracking-wide">
                        Yazı Formatı
                    </h3>

                    {/* Font Size */}
                    <div>
                        <label className="block text-xs text-[#8B4513] mb-1">
                            Boyut: {fontSize}px
                        </label>
                        <input
                            type="range"
                            min="12"
                            max="24"
                            value={fontSize}
                            onChange={(e) => onFontSizeChange(parseInt(e.target.value))}
                            className="w-full h-2 bg-white/50 rounded-lg appearance-none cursor-pointer accent-[#E9967A]"
                        />
                    </div>

                    {/* Font Family */}
                    <div>
                        <label className="block text-xs text-[#8B4513] mb-1">Font</label>
                        <select
                            value={fontFamily}
                            onChange={(e) => onFontFamilyChange(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-[#DEB887] bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#E9967A] text-[#5D4037] text-sm"
                        >
                            {FONT_FAMILIES.map((font) => (
                                <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                                    {font.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Font Color */}
                    <div>
                        <label className="block text-xs text-[#8B4513] mb-1">Renk</label>
                        <div className="flex gap-2 flex-wrap">
                            {FONT_COLORS.map((color) => (
                                <button
                                    key={color.value}
                                    onClick={() => onFontColorChange(color.value)}
                                    className={`w-7 h-7 rounded-full border-2 transition-all ${fontColor === color.value
                                        ? 'border-[#E9967A] scale-110'
                                        : 'border-transparent hover:border-[#DEB887]'
                                        }`}
                                    style={{ backgroundColor: color.value }}
                                    title={color.label}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-[#CD853F] uppercase tracking-wide">
                        Görsel Yükle
                    </h3>

                    {/* Page selector */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveUploadPage('left')}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeUploadPage === 'left'
                                ? 'bg-[#E9967A] text-white'
                                : 'bg-white/50 text-[#8B4513] hover:bg-white/80'
                                }`}
                        >
                            Sol Sayfa
                        </button>
                        <button
                            onClick={() => setActiveUploadPage('right')}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeUploadPage === 'right'
                                ? 'bg-[#E9967A] text-white'
                                : 'bg-white/50 text-[#8B4513] hover:bg-white/80'
                                }`}
                        >
                            Sağ Sayfa
                        </button>
                    </div>

                    {/* Upload area */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-[#DEB887] rounded-lg p-4 text-center cursor-pointer hover:border-[#E9967A] hover:bg-white/30 transition-colors"
                    >
                        <div className="text-2xl mb-1">📷</div>
                        <p className="text-xs text-[#8B4513]">Görsel Seç</p>
                        <p className="text-xs text-[#A0522D] mt-0.5">PNG, JPG, GIF</p>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    <p className="text-xs text-[#A0522D] text-center">
                        💡 Görselleri sürükleyip sayfaya da bırakabilirsiniz
                    </p>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-3 border-t border-[#DEB887]">
                    <button
                        onClick={onSave}
                        disabled={isSaving || !title.trim()}
                        className="w-full py-2.5 bg-gradient-to-r from-[#E9967A] to-[#F4A460] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
                    >
                        {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>

                    <button
                        onClick={onCancel}
                        className="w-full py-2.5 bg-white/50 text-[#8B4513] font-medium rounded-lg hover:bg-white/80 transition-colors text-sm"
                    >
                        İptal
                    </button>

                    {!isNewRecipe && onDelete && (
                        <button
                            onClick={onDelete}
                            className="w-full py-2.5 bg-red-100 text-red-600 font-medium rounded-lg hover:bg-red-200 transition-colors text-sm"
                        >
                            Tarifi Sil
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
