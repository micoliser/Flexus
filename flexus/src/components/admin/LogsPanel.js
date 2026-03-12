import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/api";

const LogsPanel = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  });

  const fetchLogs = useCallback(async (nextPage = 1) => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/logs", {
        params: { page: nextPage, limit: 20 },
      });
      setLogs(data.data || []);
      setPagination(data.pagination || pagination);
      setPage(nextPage);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load logs.");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  const formatDate = (value) => {
    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  };

  return (
    <section className="admin-panel-content">
      <div className="admin-panel-header">
        <h2 className="admin-panel-title">View Logs</h2>
      </div>

      <div className="admin-table-card">
        <div className="admin-table-head admin-logs-grid">
          <span>Timestamp</span>
          <span>Action</span>
          <span>Performed By</span>
        </div>

        {isLoading && <div className="admin-table-empty">Loading logs...</div>}

        {!isLoading && logs.length === 0 && (
          <div className="admin-table-empty">No logs found.</div>
        )}

        {!isLoading &&
          logs.map((log) => (
            <div key={log.id || log._id} className="admin-table-row admin-logs-grid">
              <span className="admin-log-time">{formatDate(log.createdAt)}</span>
              <span className="admin-log-action">{log.action || "-"}</span>
              <span className="admin-log-performer">
                {log.actorEmail || log.actorName || "System"}
              </span>
            </div>
          ))}

        {!isLoading && pagination.total > 0 && (
          <div className="admin-pagination-row">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => fetchLogs(page - 1)}
              disabled={!pagination.hasPrevious}
            >
              Previous
            </button>
            <span className="admin-pagination-meta">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => fetchLogs(page + 1)}
              disabled={!pagination.hasNext}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default LogsPanel;
