import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
  initialTab?: 'login' | 'register';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess, initialTab }) => {
  const [isLogin, setIsLogin] = useState(initialTab !== 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const emailInputRef = React.useRef<HTMLInputElement>(null);

  // Modal açıldığında veya giriş/kayıt geçişlerinde inputları sıfırla ve focus'u ayarla
  React.useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setError(null);
      setIsLogin(initialTab !== 'register');
      setTimeout(() => {
        emailInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      }
      console.log('CALLING onAuthSuccess');
      await onAuthSuccess();
      onClose();
    } catch (err: any) {
      console.log('LOGIN ERROR:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8 relative h-auto max-h-[90vh] overflow-auto">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            ref={emailInputRef}
            type="email"
            className="w-full border rounded px-3 py-2"
            placeholder="E-posta"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            placeholder="Şifre"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Yükleniyor...' : isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <button
            className="text-blue-600 hover:underline text-sm"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Hesabınız yok mu? Kayıt olun.' : 'Zaten hesabınız var mı? Giriş yapın.'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
