import React, { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { getUser } from '@/utils/auth';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface Event {
  id: string;
  title: string;
  description: string;
  image: string;
  is_approved: boolean;
}

const AdminModeration: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const u = await getUser();
      setUser(u);
    })();
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchAllEvents();
  }, [user]);

  const fetchAllEvents = async () => {
    setLoading(true);
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase.from('events').select('id,title,description,image,is_approved');
    if (error) {
      toast({ title: 'Hata', description: error.message, variant: 'destructive' });
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (eventId: string) => {
    const supabase = await getSupabaseClient();
    const { error } = await supabase.from('events').delete().eq('id', eventId);
    if (error) {
      toast({ title: 'Hata', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Silindi', description: 'Etkinlik silindi.' });
      setEvents(events.filter(e => e.id !== eventId));
    }
  };

  if (!user) return <div className="p-8">Yükleniyor...</div>;
  if (user.email !== 'admin@email.com') {
    return <div className="p-8 text-red-600">Bu sayfaya erişim için admin olmalısınız.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Paneli - İçerik Moderasyonu</h1>
      {loading ? (
        <div>Yükleniyor...</div>
      ) : events.length === 0 ? (
        <div>Etkinlik yok.</div>
      ) : (
        <div className="space-y-4">
          {events.map(event => (
            <div key={event.id} className="border rounded-lg p-4 bg-white shadow flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
              <div className="flex-1">
                <div className="font-semibold">{event.title}</div>
                <div className="text-gray-700 text-sm mb-2 line-clamp-2">{event.description}</div>
                <div className="text-xs text-gray-400">Durum: {event.is_approved ? 'Onaylı' : 'Onaysız'}</div>
              </div>
              {event.image && <img src={event.image} alt={event.title} className="w-20 h-20 object-cover rounded" />}
              <Button variant="destructive" onClick={() => handleDelete(event.id)}>Sil</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminModeration;
