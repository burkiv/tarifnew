'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Recipe,
  RecipeInput,
  ImagePosition,
  getRecipes,
  getCategories,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  uploadImage
} from '@/lib/recipes';
import {
  getDemoRecipes,
  getDemoCategories,
  createDemoRecipe,
  updateDemoRecipe,
  deleteDemoRecipe,
  fileToBase64,
} from '@/lib/demo';
import BookCover from '@/components/BookCover';
import BookSpread from '@/components/BookSpread';
import TableOfContents from '@/components/TableOfContents';
import RecipePage from '@/components/RecipePage';
import RecipeEditor from '@/components/RecipeEditor';
import AuthModal from '@/components/AuthModal';

type ViewMode = 'cover' | 'contents' | 'recipe';

// Default text styles
const DEFAULT_FONT_SIZE = 16;
const DEFAULT_FONT_FAMILY = 'Georgia, serif';
const DEFAULT_FONT_COLOR = '#5D4037';

export default function Home() {
  const { user, profile, loading, signOut, isDemo } = useAuth();

  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('cover');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showEditorPanel, setShowEditorPanel] = useState(true);

  // Data State
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [loadingRecipes, setLoadingRecipes] = useState(false);

  // Editor State
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editLeftContent, setEditLeftContent] = useState('');
  const [editRightContent, setEditRightContent] = useState('');
  const [editLeftImages, setEditLeftImages] = useState<ImagePosition[]>([]);
  const [editRightImages, setEditRightImages] = useState<ImagePosition[]>([]);
  const [editFontSize, setEditFontSize] = useState(DEFAULT_FONT_SIZE);
  const [editFontFamily, setEditFontFamily] = useState(DEFAULT_FONT_FAMILY);
  const [editFontColor, setEditFontColor] = useState(DEFAULT_FONT_COLOR);
  const [isSaving, setIsSaving] = useState(false);
  const [isNewRecipe, setIsNewRecipe] = useState(false);
  const [tempRecipeId, setTempRecipeId] = useState<string | null>(null);

  // Load recipes when user logs in
  useEffect(() => {
    if (user) {
      loadRecipes();
    } else {
      setRecipes([]);
      setCategories([]);
    }
  }, [user, isDemo]);

  const loadRecipes = async () => {
    if (!user) return;

    setLoadingRecipes(true);
    try {
      if (isDemo) {
        // Demo mode - use localStorage
        setRecipes(getDemoRecipes());
        setCategories(getDemoCategories());
      } else {
        // Firebase mode
        const [recipesData, categoriesData] = await Promise.all([
          getRecipes(user.uid),
          getCategories(user.uid),
        ]);
        setRecipes(recipesData);
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setLoadingRecipes(false);
    }
  };

  const handleOpenBook = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      setViewMode('contents');
    }
  };

  const handleCloseBook = () => {
    setViewMode('cover');
    setSelectedRecipe(null);
    setIsEditing(false);
  };

  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setViewMode('recipe');
    setIsEditing(false);
  };

  const handleNewRecipe = async () => {
    if (!user) return;

    setIsNewRecipe(true);
    setEditTitle('');
    setEditCategory('');
    setEditLeftContent('');
    setEditRightContent('');
    setEditLeftImages([]);
    setEditRightImages([]);
    setEditFontSize(DEFAULT_FONT_SIZE);
    setEditFontFamily(DEFAULT_FONT_FAMILY);
    setEditFontColor(DEFAULT_FONT_COLOR);

    if (isDemo) {
      // Demo mode - create temp recipe ID
      setTempRecipeId(`temp-${Date.now()}`);
    } else {
      // Firebase mode - create a temporary recipe to get an ID for image uploads
      try {
        const tempId = await createRecipe(user.uid, {
          title: 'Yeni Tarif',
          category: '',
          leftPageContent: '',
          rightPageContent: '',
          leftPageImages: [],
          rightPageImages: [],
          fontSize: DEFAULT_FONT_SIZE,
          fontFamily: DEFAULT_FONT_FAMILY,
          fontColor: DEFAULT_FONT_COLOR,
        });
        setTempRecipeId(tempId);
      } catch (error) {
        console.error('Error creating temp recipe:', error);
      }
    }

    setIsEditing(true);
    setShowEditorPanel(true);
    setViewMode('recipe');
    setSelectedRecipe(null);
  };

  const handleEditRecipe = () => {
    if (!selectedRecipe) return;

    setEditTitle(selectedRecipe.title);
    setEditCategory(selectedRecipe.category);
    setEditLeftContent(selectedRecipe.leftPageContent);
    setEditRightContent(selectedRecipe.rightPageContent);
    setEditLeftImages([...selectedRecipe.leftPageImages]);
    setEditRightImages([...selectedRecipe.rightPageImages]);
    setEditFontSize(selectedRecipe.fontSize || DEFAULT_FONT_SIZE);
    setEditFontFamily(selectedRecipe.fontFamily || DEFAULT_FONT_FAMILY);
    setEditFontColor(selectedRecipe.fontColor || DEFAULT_FONT_COLOR);
    setIsNewRecipe(false);
    setTempRecipeId(null);
    setIsEditing(true);
    setShowEditorPanel(true);
  };

  const handleSaveRecipe = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const recipeData: RecipeInput = {
        title: editTitle,
        category: editCategory,
        leftPageContent: editLeftContent,
        rightPageContent: editRightContent,
        leftPageImages: editLeftImages,
        rightPageImages: editRightImages,
        fontSize: editFontSize,
        fontFamily: editFontFamily,
        fontColor: editFontColor,
      };

      if (isDemo) {
        // Demo mode - use localStorage
        if (isNewRecipe) {
          createDemoRecipe(recipeData);
        } else if (selectedRecipe) {
          updateDemoRecipe(selectedRecipe.id, recipeData);
        }
      } else {
        // Firebase mode
        if (isNewRecipe && tempRecipeId) {
          await updateRecipe(user.uid, tempRecipeId, recipeData);
        } else if (selectedRecipe) {
          await updateRecipe(user.uid, selectedRecipe.id, recipeData);
        }
      }

      await loadRecipes();
      setIsEditing(false);
      setIsNewRecipe(false);
      setTempRecipeId(null);
      setViewMode('contents');
    } catch (error) {
      console.error('Error saving recipe:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Hide editor panel (X button) - user can continue editing pages
  const handleHideEditorPanel = () => {
    setShowEditorPanel(false);
  };

  // Full cancel - truly cancels editing and goes back
  const handleCancelEdit = async () => {
    if (!confirm('Değişiklikler kaydedilmedi. Çıkmak istediğinize emin misiniz?')) {
      return;
    }

    // If it's a new recipe that wasn't saved in Firebase mode, delete the temp recipe
    if (isNewRecipe && tempRecipeId && user && !isDemo) {
      try {
        await deleteRecipe(user.uid, tempRecipeId);
      } catch (error) {
        console.error('Error deleting temp recipe:', error);
      }
    }

    setIsEditing(false);
    setIsNewRecipe(false);
    setTempRecipeId(null);
    setShowEditorPanel(true);

    if (!selectedRecipe) {
      setViewMode('contents');
    }
  };

  const handleDeleteRecipe = async () => {
    if (!user || !selectedRecipe) return;

    if (!confirm('Bu tarifi silmek istediğinize emin misiniz?')) return;

    try {
      if (isDemo) {
        deleteDemoRecipe(selectedRecipe.id);
      } else {
        await deleteRecipe(user.uid, selectedRecipe.id);
      }
      await loadRecipes();
      setSelectedRecipe(null);
      setIsEditing(false);
      setViewMode('contents');
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  const handleImageUpload = async (file: File, page: 'left' | 'right') => {
    if (!user) return;

    const recipeId = isNewRecipe ? tempRecipeId : selectedRecipe?.id;
    if (!recipeId) return;

    try {
      let url: string;

      if (isDemo) {
        // Demo mode - convert to base64
        url = await fileToBase64(file);
      } else {
        // Firebase mode - upload to Storage
        url = await uploadImage(user.uid, recipeId, file);
      }

      const newImage: ImagePosition = {
        id: `img-${Date.now()}`,
        url,
        x: 10 + Math.random() * 30,
        y: 10 + Math.random() * 30,
        width: 25,
        height: 25,
        zIndex: page === 'left' ? editLeftImages.length : editRightImages.length,
      };

      if (page === 'left') {
        setEditLeftImages([...editLeftImages, newImage]);
      } else {
        setEditRightImages([...editRightImages, newImage]);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleImageUpdate = (page: 'left' | 'right') => (
    id: string,
    updates: { x: number; y: number; width: number; height: number }
  ) => {
    if (page === 'left') {
      setEditLeftImages(editLeftImages.map(img =>
        img.id === id ? { ...img, ...updates } : img
      ));
    } else {
      setEditRightImages(editRightImages.map(img =>
        img.id === id ? { ...img, ...updates } : img
      ));
    }
  };

  const handleImageDelete = (page: 'left' | 'right') => (id: string) => {
    if (page === 'left') {
      setEditLeftImages(editLeftImages.filter(img => img.id !== id));
    } else {
      setEditRightImages(editRightImages.filter(img => img.id !== id));
    }
  };

  // Get current font styles (for viewing or editing)
  const currentFontSize = isEditing ? editFontSize : (selectedRecipe?.fontSize || DEFAULT_FONT_SIZE);
  const currentFontFamily = isEditing ? editFontFamily : (selectedRecipe?.fontFamily || DEFAULT_FONT_FAMILY);
  const currentFontColor = isEditing ? editFontColor : (selectedRecipe?.fontColor || DEFAULT_FONT_COLOR);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF8E7] to-[#FFE4C4]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#E9967A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#8B4513]">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Cover view
  if (viewMode === 'cover') {
    return (
      <>
        <BookCover onOpen={handleOpenBook} />
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

        {/* Demo mode indicator */}
        {isDemo && (
          <div className="fixed bottom-4 left-4 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg text-sm shadow-lg">
            🧪 Demo Modu - Veriler tarayıcıda saklanıyor
          </div>
        )}
      </>
    );
  }

  // Navbar content - responsive for mobile
  const navbarContent = (
    <>
      <button
        onClick={() => setViewMode('contents')}
        className={`px-4 md:px-6 py-2 rounded-full text-sm md:text-base font-medium transition-all ${viewMode === 'contents'
          ? 'bg-[#F4A460] text-white'
          : 'bg-white/50 text-[#8B4513] hover:bg-white/80'
          }`}
      >
        İçindekiler
      </button>

      <button
        onClick={handleNewRecipe}
        className="px-4 md:px-6 py-2 rounded-full text-sm md:text-base font-medium bg-[#20B2AA] text-white hover:bg-[#008B8B] transition-colors"
      >
        Yeni Tarif
      </button>

      <button
        onClick={handleCloseBook}
        className="px-4 md:px-6 py-2 rounded-full text-sm md:text-base font-medium bg-[#E9967A] text-white hover:bg-[#CD853F] transition-colors"
      >
        Kapat
      </button>

      {profile && (
        <div className="hidden md:flex absolute right-6 items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#E9967A] flex items-center justify-center text-white font-bold">
              {profile.displayName?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="text-[#8B4513] font-medium">{profile.displayName}</span>
            {isDemo && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Demo</span>
            )}
          </div>
          <button
            onClick={signOut}
            className="text-[#8B4513] hover:text-[#5D4037] transition-colors text-sm underline"
          >
            Çıkış
          </button>
        </div>
      )}
    </>
  );

  // Contents or Recipe view
  return (
    <>
      {isEditing && showEditorPanel && (
        <RecipeEditor
          title={editTitle}
          category={editCategory}
          categories={categories}
          fontSize={editFontSize}
          fontFamily={editFontFamily}
          fontColor={editFontColor}
          onTitleChange={setEditTitle}
          onCategoryChange={setEditCategory}
          onFontSizeChange={setEditFontSize}
          onFontFamilyChange={setEditFontFamily}
          onFontColorChange={setEditFontColor}
          onImageUpload={handleImageUpload}
          onSave={handleSaveRecipe}
          onCancel={handleCancelEdit}
          onHide={handleHideEditorPanel}
          onDelete={selectedRecipe ? handleDeleteRecipe : undefined}
          isNewRecipe={isNewRecipe}
          isSaving={isSaving}
        />
      )}

      {/* Floating button to reopen editor panel */}
      {isEditing && !showEditorPanel && (
        <button
          onClick={() => setShowEditorPanel(true)}
          className="fixed bottom-20 left-4 z-50 w-12 h-12 bg-gradient-to-r from-[#E9967A] to-[#F4A460] text-white rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center text-xl"
          title="Ayarları Aç"
        >
          ⚙️
        </button>
      )}

      <div className={isEditing && showEditorPanel ? 'md:ml-72' : ''}>
        <BookSpread
          navbarContent={navbarContent}
          leftPage={
            viewMode === 'contents' ? (
              <TableOfContents
                recipes={recipes}
                onRecipeSelect={handleRecipeSelect}
                onNewRecipe={handleNewRecipe}
              />
            ) : (
              <RecipePage
                content={isEditing ? editLeftContent : (selectedRecipe?.leftPageContent || '')}
                images={isEditing ? editLeftImages : (selectedRecipe?.leftPageImages || [])}
                isEditing={isEditing}
                fontSize={currentFontSize}
                fontFamily={currentFontFamily}
                fontColor={currentFontColor}
                onContentChange={setEditLeftContent}
                onImageUpdate={handleImageUpdate('left')}
                onImageDelete={handleImageDelete('left')}
                onImageUpload={(file) => handleImageUpload(file, 'left')}
                placeholder="Sol sayfa içeriği..."
              />
            )
          }
          rightPage={
            viewMode === 'contents' ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="text-6xl mb-4">📖</div>
                <p className="text-[#8B4513] text-lg">
                  {recipes.length} tarif kayıtlı
                </p>
                <p className="text-[#A0522D] mt-2">
                  Soldan bir tarif seçin veya yeni tarif ekleyin
                </p>
              </div>
            ) : (
              <>
                <RecipePage
                  content={isEditing ? editRightContent : (selectedRecipe?.rightPageContent || '')}
                  images={isEditing ? editRightImages : (selectedRecipe?.rightPageImages || [])}
                  isEditing={isEditing}
                  fontSize={currentFontSize}
                  fontFamily={currentFontFamily}
                  fontColor={currentFontColor}
                  onContentChange={setEditRightContent}
                  onImageUpdate={handleImageUpdate('right')}
                  onImageDelete={handleImageDelete('right')}
                  onImageUpload={(file) => handleImageUpload(file, 'right')}
                  placeholder="Sağ sayfa içeriği..."
                />

                {/* Edit button (view mode only) */}
                {!isEditing && selectedRecipe && (
                  <button
                    onClick={handleEditRecipe}
                    className="absolute top-4 right-4 px-4 py-2 bg-[#20B2AA] text-white rounded-lg hover:bg-[#008B8B] transition-colors font-medium"
                  >
                    Düzenle
                  </button>
                )}
              </>
            )
          }
        />
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
