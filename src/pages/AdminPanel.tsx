import React, { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { getUser } from '@/utils/auth';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  maxAttendees: number | null;
  image: string;
  is_approved: boolean;
}

const AdminPanel: React.FC = () => {
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
    fetchPendingEvents();
  }, [user]);

  const fetchPendingEvents = async () => {
    setLoading(true);
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_approved', false)
      .order('date', { ascending: true });
    if (error) {
      toast({ title: 'Hata', description: error.message, variant: 'destructive' });
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  };

  const handleApprove = async (eventId: string) => {
    const supabase = await getSupabaseClient();
    const { error } = await supabase
      .from('events')
      .update({ is_approved: true })
      .eq('id', eventId);
    if (error) {
      toast({ title: 'Hata', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Onaylandı', description: 'Etkinlik onaylandı.' });
      setEvents(events.filter(e => e.id !== eventId));
    }
  };

  const handleReject = async (eventId: string) => {
    const supabase = await getSupabaseClient();
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);
    if (error) {
      toast({ title: 'Hata', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Silindi', description: 'Etkinlik reddedildi ve silindi.' });
      setEvents(events.filter(e => e.id !== eventId));
    }
  };

  // Basit admin kontrolü (ileride role tabanlı yapıya geçilebilir)
  if (!user) return <div className="p-8">Yükleniyor...</div>;
  if (user.email !== 'admin@email.com') {
    return <div className="p-8 text-red-600">Bu sayfaya erişim için admin olmalısınız.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Paneli - Etkinlik Onay</h1>
      {loading ? (
        <div>Yükleniyor...</div>
      ) : events.length === 0 ? (
        <div>Onay bekleyen etkinlik yok.</div>
      ) : (
        <div className="space-y-6">
          {events.map(event => (
            <div key={event.id} className="border rounded-lg p-4 bg-white shadow flex flex-col gap-2">
              <div className="flex items-center gap-4">
                {event.image && <img src={event.image} alt={event.title} className="w-20 h-20 object-cover rounded" />}
                <div className="flex-1">
                  <div className="font-semibold text-lg">{event.title}</div>
                  <div className="text-gray-500 text-sm">{event.date} {event.time} - {event.location}</div>
                  <div className="text-gray-700 mt-1 line-clamp-2">{event.description}</div>
                </div>
              </div>
              <div className="flex gap-3 mt-2">
                <Button onClick={() => handleApprove(event.id)} className="bg-green-600 hover:bg-green-700">Onayla</Button>
                <Button onClick={() => handleReject(event.id)} variant="destructive">Reddet</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
