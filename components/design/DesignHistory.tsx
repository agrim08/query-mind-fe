import React, { useEffect, useState } from 'react';
import { History, Search, Loader2, Clock, X, DatabaseZap, SearchX } from 'lucide-react';
import { getDesignHistory, DesignHistoryEntry } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

export function DesignHistory({
  onLoadDesign,
  isOpen,
  onClose
}: {
  onLoadDesign: (schema: any) => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [history, setHistory] = useState<DesignHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await getDesignHistory();
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredHistory = history.filter(h => 
    h.prompt.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: 380,
        height: '100%',
        backgroundColor: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border-default)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.4)',
        animation: 'slideIn 0.3s ease-out'
      }}
    >
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-raised)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <History size={20} className="text-accent" />
          <h2 className="font-heading" style={{ fontSize: 18, letterSpacing: '0.02em' }}>Design History</h2>
        </div>
        <button 
          className="btn btn-ghost btn-sm" 
          onClick={onClose}
          style={{ width: 32, height: 32, padding: 0, borderRadius: '50%' }}
        >
          <X size={18} />
        </button>
      </div>

      <div style={{ padding: '12px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: 12, color: 'var(--text-secondary)' }} />
          <input 
            className="input" 
            placeholder="Search prompt..." 
            style={{ paddingLeft: 30, fontSize: 13 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 12px 12px' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <Loader2 className="animate-spin" />
          </div>
        ) : filteredHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-tertiary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'var(--bg-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SearchX size={24} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>No history found</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>Try a different search term or generate a new design.</p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredHistory.map((item) => (
              <div 
                key={item.id}
                onClick={() => onLoadDesign(item.schema_json)}
                style={{ 
                  padding: '14px', 
                  backgroundColor: 'var(--bg-raised)',
                  border: '1px solid var(--border-subtle)', 
                  borderRadius: 12, 
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                className="hover:border-[var(--accent)] hover:shadow-[0_0_12px_var(--accent-glow)] group"
              >
                <p style={{ 
                  fontSize: 13, 
                  marginBottom: 10, 
                  fontWeight: 500, 
                  color: 'var(--text-primary)',
                  display: '-webkit-box', 
                  WebkitLineClamp: 2, 
                  WebkitBoxOrient: 'vertical', 
                  overflow: 'hidden',
                  lineHeight: 1.5
                }}>
                  {item.prompt}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-tertiary)' }}>
                    <Clock size={12} />
                    {formatDistanceToNow(new Date(item.created_at))} ago
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Load Design
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
