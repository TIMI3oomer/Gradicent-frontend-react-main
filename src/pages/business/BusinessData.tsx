import { useState, useMemo, useEffect } from 'react';
import { Search, Download, Database } from 'lucide-react';
import { BusinessLayout } from '../../layouts/BusinessLayout/BusinessLayout';
import { DataTable, type Column } from '../../components/shared/DataTable/DataTable';
import { Badge } from '../../components/shared/Badge';
import { Pagination } from '../../components/shared/Pagination';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

const PAGE_SIZE = 15;
type DatasetKey = 'transactions' | 'clients' | 'appointments';

export function BusinessData() {
  const { user } = useAuth();
  
  const [dataset, setDataset] = useState<DatasetKey>('transactions');
  const [rawData, setRawData] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Re-fetches the correct subset of data anytime the tab changes
  useEffect(() => {
    const loadDataset = async () => {
      if (!user?.id) return;
      try {
        setIsLoading(true);
        let endpoint = '';
        if (dataset === 'clients') endpoint = '/api/binder/client/search';
        // These rely on you creating matching simple search endpoints on your backend
        if (dataset === 'transactions') endpoint = '/api/binder/transactions/search'; 
        if (dataset === 'appointments') endpoint = '/api/binder/appointments/search'; 

        const res = await api.searchEntities<any>(endpoint, {
          domain: 'business', user_id: user.id, query: ''
        });
        
        const results = res.data?.results || res.data || [];
        setRawData(Array.isArray(results) ? results : []);
      } catch (err) {
        console.error(`Failed loading ${dataset}:`, err);
        setRawData([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadDataset();
  }, [dataset, user?.id]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return rawData;
    return rawData.filter(row => JSON.stringify(row).toLowerCase().includes(q));
  }, [rawData, search]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Column definitions (txnCols, clientCols, aptCols) remain exactly identical...
  const cols: Column<Record<string, unknown>>[] = []; // assigned below based on active tab in real code

  return (
    <BusinessLayout title="Data Explorer">
      {/* UI Tab Buttons and Search remain identical... */}

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>Executing database query...</div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <DataTable data={paginated} columns={cols} rowKey="id" emptyTitle="No records match your search." />
        </div>
      )}
    </BusinessLayout>
  );
}