
import React, { useState } from 'react';
import Header from '@/components/Header';
import EventList from '@/components/EventList';
import CreateEventModal from '@/components/CreateEventModal';
import { Calendar, Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Carousel } from '@/components/ui/carousel';
import { ChartContainer } from '@/components/ui/chart';
import { SidebarProvider } from '@/components/ui/sidebar';

const Index = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshEvents, setRefreshEvents] = useState(0);

  const handleEventCreated = () => {
    setRefreshEvents(prev => prev + 1);
    setIsCreateModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Topluluk Etkinlik Takvimi
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Çevrendeki etkinlikleri keşfet, yeni insanlarla tanış ve unutulmaz anılar biriktir
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Plus className="mr-2 h-5 w-5" />
                Etkinlik Oluştur
              </Button>
              <div className="flex items-center space-x-6 text-blue-100">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>150+ Etkinlik</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  <span>2.5K+ Katılımcı</span>
                </div>

              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-blue-50 to-transparent"></div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <SidebarProvider>
          <Carousel>
            <ChartContainer config={{}}>
              <EventList key={refreshEvents} />
            </ChartContainer>
          </Carousel>
        </SidebarProvider>
      </div>

      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onEventCreated={handleEventCreated}
      />
    </div>
  );
};

export default Index;
