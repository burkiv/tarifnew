'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn, signUp, isDemo } = useAuth();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await signIn(email, password);
            } else {
                if (!displayName.trim()) {
                    setError('Lütfen adınızı girin');
                    setLoading(false);
                    return;
                }
                await signUp(email, password, displayName);
            }
            onClose();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu';
            if (errorMessage.includes('auth/email-already-in-use')) {
                setError('Bu e-posta adresi zaten kullanımda');
            } else if (errorMessage.includes('auth/invalid-email')) {
                setError('Geçersiz e-posta adresi');
            } else if (errorMessage.includes('auth/weak-password')) {
                setError('Şifre en az 6 karakter olmalı');
            } else if (errorMessage.includes('auth/user-not-found') || errorMessage.includes('auth/wrong-password')) {
                setError('E-posta veya şifre hatalı');
            } else {
                setError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-md mx-4 p-8 bg-[#FFF8F0] rounded-2xl shadow-2xl">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-[#8B4513]">
                        {isLogin ? 'Hoş Geldiniz' : 'Kayıt Ol'}
                    </h2>
                    <p className="text-[#A0522D] mt-2">
                        {isLogin ? 'Tarif defterinize giriş yapın' : 'Yeni bir hesap oluşturun'}
                    </p>

                    {/* Demo mode indicator */}
                    {isDemo && (
                        <div className="mt-3 bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg text-sm">
                            🧪 Demo Modu - Şifre gerekmez, sadece e-posta ve isim girin
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-[#8B4513] mb-1">
                                Adınız
                            </label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-[#DEB887] bg-white focus:outline-none focus:ring-2 focus:ring-[#E9967A] text-[#5D4037]"
                                placeholder="Adınızı girin"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-[#8B4513] mb-1">
                            E-posta
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-[#DEB887] bg-white focus:outline-none focus:ring-2 focus:ring-[#E9967A] text-[#5D4037]"
                            placeholder="ornek@email.com"
                            required
                        />
                    </div>

                    {/* Only show password field if not in demo mode */}
                    {!isDemo && (
                        <div>
                            <label className="block text-sm font-medium text-[#8B4513] mb-1">
                                Şifre
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-[#DEB887] bg-white focus:outline-none focus:ring-2 focus:ring-[#E9967A] text-[#5D4037]"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    )}

                    {error && (
                        <p className="text-red-500 text-sm text-center">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-[#E9967A] to-[#F4A460] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loading ? 'Lütfen bekleyin...' : isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                        }}
                        className="text-[#CD853F] hover:text-[#8B4513] transition-colors"
                    >
                        {isLogin ? 'Hesabınız yok mu? Kayıt olun' : 'Zaten hesabınız var mı? Giriş yapın'}
                    </button>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-[#8B4513] hover:text-[#5D4037] transition-colors text-2xl"
                >
                    ×
                </button>
            </div>
        </div>
    );
}
