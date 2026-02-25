import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Circle } from 'lucide-react';

interface MemberStatus {
  id: string;
  name: string;
  unit: string;
  isOnline: boolean;
}

const OnlineMembers = () => {
  const [members, setMembers] = useState<MemberStatus[]>([]);

  useEffect(() => {
    const fetchMembers = async () => {
      const { data } = await supabase
        .from('members')
        .select('id, name, unit')
        .order('name')
        .limit(20);
      if (data) {
        // Simulate online/offline status randomly
        setMembers(
          data.map((m: any) => ({
            id: m.id,
            name: m.name,
            unit: m.unit,
            isOnline: Math.random() > 0.5,
          }))
        );
      }
    };
    fetchMembers();
  }, []);

  const online = members.filter(m => m.isOnline);
  const offline = members.filter(m => !m.isOnline);

  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-card-foreground mb-3">
        Thành viên ({online.length} online / {offline.length} offline)
      </h3>
      <div className="flex flex-wrap gap-2">
        {members.map(m => (
          <div
            key={m.id}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-xs font-medium"
            title={`${m.name} - ${m.unit}`}
          >
            <Circle
              className={`w-2.5 h-2.5 fill-current ${
                m.isOnline ? 'text-done' : 'text-muted-foreground'
              }`}
            />
            <span className="truncate max-w-[100px]">{m.name.split(' ').slice(-2).join(' ')}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnlineMembers;
