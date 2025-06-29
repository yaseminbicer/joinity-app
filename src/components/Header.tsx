
import React, { useState, useEffect } from 'react';
import { Calendar, User, Search, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AuthModal from '@/components/AuthModal';
import { supabase } from '@/lib/supabaseClient';

const Header = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    let listener: any;
    (async () => {

      await supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null));
      listener = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
      });
    })();
    return () => {
      if (listener && listener.subscription) listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                EtkinlikHub
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Etkinlik ara..."
                className="pl-10 pr-4 py-2 w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-full"
              />
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-700">{user.email}</span>
                <Button variant="ghost" className="text-gray-700 hover:text-blue-600" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Çıkış Yap
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" className="text-gray-700 hover:text-blue-600" onClick={() => setAuthModalOpen(true)}>
                  Giriş Yap
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6" onClick={() => setAuthModalOpen(true)}>
                  <User className="mr-2 h-4 w-4" /> Kayıt Ol
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} onAuthSuccess={() => {}} />
    </header>
  );
};

export default Header;
