import { Search, Filter, SortAsc } from 'lucide-react';
import { Priority, PRIORITY_LABELS } from '@/types/task';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterPriority: Priority | 'all';
  onFilterChange: (priority: Priority | 'all') => void;
  sortOrder: 'asc' | 'desc' | 'priority';
  onSortChange: (order: 'asc' | 'desc' | 'priority') => void;
}

const SearchBar = ({
  searchQuery,
  onSearchChange,
  filterPriority,
  onFilterChange,
  sortOrder,
  onSortChange,
}: SearchBarProps) => {
  return (
    <div className="flex items-center gap-3">
      {/* Search Input */}
      <div className="search-input flex-1 max-w-md">
        <Search className="w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Tìm kiếm công việc..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            {filterPriority === 'all' ? 'Tất cả' : PRIORITY_LABELS[filterPriority]}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Lọc theo trạng thái</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onFilterChange('all')}>
            Tất cả
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterChange('urgent')}>
            <span className="w-2 h-2 rounded-full bg-urgent mr-2" />
            {PRIORITY_LABELS.urgent}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterChange('later')}>
            <span className="w-2 h-2 rounded-full bg-later mr-2" />
            {PRIORITY_LABELS.later}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterChange('done')}>
            <span className="w-2 h-2 rounded-full bg-done mr-2" />
            {PRIORITY_LABELS.done}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sort */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <SortAsc className="w-4 h-4" />
            Sắp xếp
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Sắp xếp theo</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onSortChange('priority')}>
            Ưu tiên (KHẨN trước)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange('asc')}>
            Ngày tạo (cũ nhất)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange('desc')}>
            Ngày tạo (mới nhất)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default SearchBar;
