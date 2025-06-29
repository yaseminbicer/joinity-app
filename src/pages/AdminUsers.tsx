import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getUser } from '@/utils/auth';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  role?: string;
  created_at?: string;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
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
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    setLoading(true);

    const { data, error } = await supabase.from('users').select('id,email,role,created_at');
    if (error) {
      toast({ title: 'Hata', description: error.message, variant: 'destructive' });
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  // Basit admin kontrolü (ileride role tabanlı yapıya geçilebilir)
  if (!user) return <div className="p-8">Yükleniyor...</div>;
  if (user.email !== 'admin@email.com') {
    return <div className="p-8 text-red-600">Bu sayfaya erişim için admin olmalısınız.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Paneli - Kullanıcılar</h1>
      {loading ? (
        <div>Yükleniyor...</div>
      ) : users.length === 0 ? (
        <div>Kullanıcı yok.</div>
      ) : (
        <div className="space-y-4">
          {users.map(u => (
            <div key={u.id} className="border rounded-lg p-4 bg-white shadow flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
              <div>
                <div className="font-semibold">{u.email}</div>
                <div className="text-gray-500 text-sm">Kayıt: {u.created_at?.slice(0, 10)}</div>
                <div className="text-gray-700 text-sm">Rol: {u.role || 'kullanıcı'}</div>
              </div>
              {/* Rol atama, banlama, silme gibi işlemler eklenebilir */}
              {/* <Button variant="destructive">Sil</Button> */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
