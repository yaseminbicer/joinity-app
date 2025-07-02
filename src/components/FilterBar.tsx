import { useState } from 'react';
import { Filter, Calendar, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FilterBarProps {
  onFiltersChange: (filters: any) => void;
}

const FilterBar = ({ onFiltersChange }: FilterBarProps) => {
  const [filters, setFilters] = useState({
    category: '',
    dateRange: '',
    location: '',
    sortBy: 'date'
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
      <div className="flex items-center space-x-4 flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-700">Filtreler:</span>
        </div>

        <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Kategori seç" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Teknoloji</SelectItem>
            <SelectItem value="2">Sanat</SelectItem>
            <SelectItem value="3">Spor</SelectItem>
            <SelectItem value="4">Müzik</SelectItem>
            <SelectItem value="5">Eğitim</SelectItem>
            <SelectItem value="6">Sosyal</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Konum ara..."
            className="pl-10 w-48"
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
          />
        </div>

        <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)} defaultValue="date">
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sıralama" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Tarihe Göre</SelectItem>
            <SelectItem value="popularity">Popülerliğe Göre</SelectItem>
            <SelectItem value="location">Konuma Göre</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => {
            setFilters({ category: '', dateRange: '', location: '', sortBy: 'date' });
            onFiltersChange({ category: '', dateRange: '', location: '', sortBy: 'date' });
          }}
        >
          Temizle
        </Button>
      </div>
    </div>
  );
};

export default FilterBar;
