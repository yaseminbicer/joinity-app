
import React, { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { getUser } from '@/utils/auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar, MapPin, Users, Image, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: () => void;
}


const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose, onEventCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category_id: '',
    maxAttendees: '',
    image: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const u = await getUser();
      setUser(u);
    })();
  }, [isOpen]);

  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    (async () => {
      const supabase = await getSupabaseClient();
      const { data } = await supabase.from('categories').select('*').order('name');
      setCategories(data || []);
    })();
  }, [isOpen]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Form validation
    if (!formData.title || !formData.description || !formData.date || !formData.time || 
        !formData.location || !formData.category_id) {
      toast({
        title: "Hata",
        description: "Lütfen tüm zorunlu alanları doldurun.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }
    try {
      const supabase = await getSupabaseClient();
      // Adresi koordinata çevir
      let location_lat = null;
      let location_lng = null;
      try {
        const resp = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(formData.location)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`);
        const geo = await resp.json();
        if (geo.features && geo.features[0]) {
          location_lng = geo.features[0].center[0];
          location_lat = geo.features[0].center[1];
        }
      } catch (e) {}
      const { error } = await supabase.from('events').insert([
        {
          title: formData.title,
          description: formData.description,
          date: formData.date,
          time: formData.time,
          location: formData.location,
          location_lat,
          location_lng,
          category_id: formData.category_id ? Number(formData.category_id) : null,

          maxAttendees: formData.maxAttendees ? Number(formData.maxAttendees) : null,
          image: formData.image,
          is_approved: false,
        }
      ]);
      if (error) throw error;
      toast({
        title: "Başarılı!",
        description: "Etkinliğiniz başarıyla oluşturuldu. Admin onayından sonra yayınlanacak.",
      });
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        category_id: '',

        maxAttendees: '',
        image: ''
      });
      onEventCreated();
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error?.message || "Etkinlik oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Yeni Etkinlik Oluştur
          </DialogTitle>
        </DialogHeader>

        {!user ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-lg text-gray-700 mb-4">Etkinlik oluşturmak için giriş yapmalısınız.</p>
            <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">Giriş Yap</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                Etkinlik Başlığı *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Etkinliğinizin başlığını girin"
                className="w-full"
              />
            </div>
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Açıklama *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Etkinliğinizi detaylı bir şekilde açıklayın"
                rows={4}
                className="w-full"
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium text-gray-700 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Tarih *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time" className="text-sm font-medium text-gray-700 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Saat *
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium text-gray-700 flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                Konum *
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Etkinlik yeri (örn: Teknoloji Merkezi, İstanbul)"
                className="w-full"
              />
            </div>

            {/* Category, Price and Max Attendees */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Kategori *
                </Label>
                <Select value={formData.category_id} onValueChange={(value) => handleInputChange('category_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxAttendees" className="text-sm font-medium text-gray-700 flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  Maksimum Katılımcı
                </Label>
                <Input
                  id="maxAttendees"
                  type="number"
                  value={formData.maxAttendees}
                  onChange={(e) => handleInputChange('maxAttendees', e.target.value)}
                  placeholder="Opsiyonel"
                  className="w-full"
                />
              </div>
            </div>

            {/* Image */}
            <div className="space-y-2">
              <Label htmlFor="image" className="text-sm font-medium text-gray-700 flex items-center">
                <Image className="h-4 w-4 mr-1" />
                Etkinlik Görseli (URL)
              </Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => handleInputChange('image', e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full"
              />
            </div>

            {/* Admin Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Not:</strong> Oluşturduğunuz etkinlik admin onayından sonra yayınlanacaktır. 
                Genellikle 24 saat içinde onaylanır.
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                İptal
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Oluşturuluyor...' : 'Etkinlik Oluştur'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventModal;
