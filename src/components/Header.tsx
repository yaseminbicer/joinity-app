
import React, { useState } from 'react';
import { Calendar, User, Search, LogOut, Bell, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AuthModal from '@/components/AuthModal';

interface HeaderProps {
  currentUser: any;
  onCreateEvent: () => void;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onCreateEvent, onLogout }) => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

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

          {/* Sağ üst alan */}
          <div className="flex items-center gap-6">
            {currentUser ? (
              <>
                <Button
                  className="bg-gradient-to-r from-[#4fc3f7] to-[#a259f7] text-white font-medium shadow px-5 py-2 rounded-full flex items-center gap-2 text-base min-h-[40px] h-10 transition hover:opacity-90"
                  onClick={onCreateEvent}
                >
                  <Plus className="w-5 h-5 mr-1" /> Etkinlik Oluştur
                </Button>
                <Bell className="w-5 h-5 text-black mx-2" />
                <span className="font-normal text-base text-black mx-2">{currentUser.email}</span>
                <User className="w-5 h-5 text-black mx-2" />
              </>
            ) : (
              <>
                <Button variant="ghost" className="text-gray-700 hover:text-blue-600" onClick={() => { setAuthModalOpen(true); setAuthModalTab('login'); }}>
                  Giriş Yap
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6" onClick={() => { setAuthModalOpen(true); setAuthModalTab('register'); }}>
                  <User className="mr-2 h-4 w-4" /> Kayıt Ol
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Eğer AuthModal'da initialTab prop'u yoksa, eklenmesi gerekir! */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} onAuthSuccess={() => {}} initialTab={authModalTab} />
    </header>
  );
};

export default Header;
