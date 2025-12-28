'use client';

import { Recipe } from '@/lib/recipes';

interface TableOfContentsProps {
    recipes: Recipe[];
    onRecipeSelect: (recipe: Recipe) => void;
    onNewRecipe: () => void;
}

export default function TableOfContents({
    recipes,
    onRecipeSelect,
    onNewRecipe,
}: TableOfContentsProps) {
    // Group recipes by category
    const recipesByCategory = recipes.reduce((acc, recipe) => {
        const category = recipe.category || 'Diğer';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(recipe);
        return acc;
    }, {} as Record<string, Recipe[]>);

    const categories = Object.keys(recipesByCategory).sort();

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(date);
    };

    return (
        <div className="h-full">
            <h1
                className="text-3xl font-bold text-[#5D4037] text-center mb-8 underline underline-offset-8 decoration-[#DEB887]"
                style={{ fontFamily: 'Georgia, serif' }}
            >
                İçindekiler
            </h1>

            {categories.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-[#8B4513] mb-4">Henüz tarif eklemediniz.</p>
                    <button
                        onClick={onNewRecipe}
                        className="px-6 py-3 bg-gradient-to-r from-[#E9967A] to-[#F4A460] text-white rounded-full hover:opacity-90 transition-opacity font-medium"
                    >
                        İlk Tarifinizi Ekleyin
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {categories.map((category) => (
                        <div key={category}>
                            {/* Category header */}
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-3 h-3 rounded-full bg-[#E9967A]" />
                                <h2 className="text-lg font-semibold text-[#CD853F]">
                                    {category}
                                </h2>
                            </div>

                            {/* Recipes in category */}
                            <div className="space-y-2 pl-5">
                                {recipesByCategory[category].map((recipe) => (
                                    <button
                                        key={recipe.id}
                                        onClick={() => onRecipeSelect(recipe)}
                                        className="w-full text-left group flex items-baseline gap-2 hover:text-[#E9967A] transition-colors"
                                    >
                                        <span className="text-[#5D4037] group-hover:text-[#E9967A] font-medium">
                                            {recipe.title}
                                        </span>
                                        <span className="flex-1 border-b border-dotted border-[#DEB887] mx-2" />
                                        <span className="text-sm text-[#A0522D]">
                                            ({formatDate(recipe.createdAt)})
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
