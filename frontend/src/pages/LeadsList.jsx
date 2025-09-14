import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { api } from '../api';

// AG Grid base styles
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);

// Page styles (all CSS for this page lives here)
import '../styles/leads.css';

export default function LeadsList() {
  const navigate = useNavigate();

  // table data + pagination
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // filter state (maps to backend query params)
  const [filters, setFilters] = useState({
    email_contains: '',
    company_contains: '',
    city_contains: '',
    status: '',
    source: '',
    score_gt: '',
    score_lt: '',
    created_at_after: '',
    created_at_before: '',
    is_qualified: '',
  });

  const cols = useMemo(
    () => [
      { headerName: 'First', field: 'first_name', minWidth: 140 },
      { headerName: 'Last', field: 'last_name', minWidth: 140 },
      { headerName: 'Email', field: 'email', minWidth: 220 },
      { headerName: 'Phone', field: 'phone', minWidth: 180 },
      { headerName: 'Company', field: 'company', minWidth: 200 },
      { headerName: 'City', field: 'city', minWidth: 160 },
      { headerName: 'State', field: 'state', minWidth: 120 },
      { headerName: 'Source', field: 'source', minWidth: 130 },
      { headerName: 'Status', field: 'status', minWidth: 130 },
      { headerName: 'Score', field: 'score', width: 100 },
      { headerName: 'Value', field: 'lead_value', width: 110 },
      {
        headerName: 'Last Activity',
        field: 'last_activity_at',
        minWidth: 200,
        valueFormatter: (p) => (p.value ? new Date(p.value).toLocaleString() : ''),
      },
      {
        headerName: 'Qualified',
        field: 'is_qualified',
        width: 110,
        valueFormatter: (p) => (p.value ? 'true' : 'false'),
      },
      {
        headerName: 'Actions',
        width: 170,
        pinned: 'right',
        cellRenderer: (p) => (
          <div className="actions">
            <button
              className="action-btn"
              onClick={() => navigate(`/leads/${p.data._id}`)}
            >
              Edit
            </button>
            <button
              className="action-btn action-danger"
              onClick={async () => {
                if (!confirm('Delete this lead?')) return;
                try {
                  await api.delete(`/leads/${p.data._id}`);
                  fetchData(page, limit, filters);
                } catch (e) {
                  if (e?.response?.status === 401) navigate('/login');
                  alert(e?.response?.data?.error || 'Delete failed');
                }
              }}
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    [navigate, page, limit, filters]
  );

  async function fetchData(p = page, l = limit, f = filters) {
    setLoading(true);
    try {
      const params = { page: p, limit: l };
      for (const [k, v] of Object.entries(f)) {
        if (v !== '' && v !== null && v !== undefined) params[k] = v;
      }
      const { data } = await api.get('/leads', { params });
      setRows(data.data);
      setPage(data.page);
      setLimit(data.limit);
      setTotalPages(data.totalPages);
    } catch (e) {
      if (e?.response?.status === 401) navigate('/login');
      else console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData(1, limit, filters);
  }, []);

  return (
    <div className="leads-page">
      {/* Toolbar */}
      <div className="leads-toolbar">
        <h2 className="leads-title">Leads</h2>
        <Link to="/leads/new" className="btn btn-primary btn-sm">New Lead</Link>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filters-row">
          <input
            className="control"
            placeholder="email contains"
            value={filters.email_contains}
            onChange={(e) => setFilters((f) => ({ ...f, email_contains: e.target.value }))}
          />
          <input
            className="control"
            placeholder="company contains"
            value={filters.company_contains}
            onChange={(e) => setFilters((f) => ({ ...f, company_contains: e.target.value }))}
          />
          <input
            className="control"
            placeholder="city contains"
            value={filters.city_contains}
            onChange={(e) => setFilters((f) => ({ ...f, city_contains: e.target.value }))}
          />
          <select
            className="control"
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          >
            <option value="">status</option>
            <option>new</option><option>contacted</option><option>qualified</option>
            <option>lost</option><option>won</option>
          </select>
          <select
            className="control"
            value={filters.source}
            onChange={(e) => setFilters((f) => ({ ...f, source: e.target.value }))}
          >
            <option value="">source</option>
            <option>website</option><option>facebook_ads</option><option>google_ads</option>
            <option>referral</option><option>events</option><option>other</option>
          </select>
          <input
            className="control narrow"
            type="number"
            placeholder="score >"
            value={filters.score_gt}
            onChange={(e) => setFilters((f) => ({ ...f, score_gt: e.target.value }))}
          />
          <input
            className="control narrow"
            type="number"
            placeholder="score <"
            value={filters.score_lt}
            onChange={(e) => setFilters((f) => ({ ...f, score_lt: e.target.value }))}
          />
          <input
            className="control narrow"
            type="date"
            value={filters.created_at_after}
            onChange={(e) => setFilters((f) => ({ ...f, created_at_after: e.target.value }))}
          />
          <input
            className="control narrow"
            type="date"
            value={filters.created_at_before}
            onChange={(e) => setFilters((f) => ({ ...f, created_at_before: e.target.value }))}
          />
          <select
            className="control narrow"
            value={filters.is_qualified}
            onChange={(e) => setFilters((f) => ({ ...f, is_qualified: e.target.value }))}
          >
            <option value="">qualified?</option>
            <option value="true">true</option>
            <option value="false">false</option>
          </select>

          <button className="btn" onClick={() => fetchData(1, limit, filters)}>Apply</button>
          <button
            className="btn"
            onClick={() => {
              const empty = {
                email_contains: '',
                company_contains: '',
                city_contains: '',
                status: '',
                source: '',
                score_gt: '',
                score_lt: '',
                created_at_after: '',
                created_at_before: '',
                is_qualified: '',
              };
              setFilters(empty);
              fetchData(1, limit, empty);
            }}
          >
            Reset
          </button>

          <select
            className="control narrow"
            value={limit}
            onChange={(e) => {
              const l = Number(e.target.value);
              setLimit(l);
              fetchData(1, l, filters);
            }}
            title="Rows per page"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="ag-theme-quartz leads-grid grid-wrap">
        <AgGridReact
          rowData={rows}
          columnDefs={cols}
          defaultColDef={{ flex: 1, minWidth: 120, resizable: true }}
          animateRows
          pagination={false}
          domLayout="autoHeight"
          suppressCellFocus
        />
      </div>

      {/* Pagination */}
      <div className="pager">
        <div className="pager-info">
          Page {page} of {totalPages} {loading ? '(loading...)' : ''}
        </div>
        <div className="pager-actions">
          <button
            className="btn"
            disabled={page <= 1 || loading}
            onClick={() => fetchData(page - 1, limit, filters)}
          >
            Prev
          </button>
          <button
            className="btn"
            disabled={page >= totalPages || loading}
            onClick={() => fetchData(page + 1, limit, filters)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
