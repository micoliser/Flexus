import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/api";

const LogsPanel = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [dateMode, setDateMode] = useState("all");
  const [specificDate, setSpecificDate] = useState("");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  });

  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm]);

  const todayStr = new Date().toISOString().split("T")[0];

  const getDateParams = () => {
    if (dateMode === "1" || dateMode === "7" || dateMode === "30") {
      const since = new Date();
      since.setDate(since.getDate() - parseInt(dateMode, 10));
      return { startDate: since.toISOString() };
    }
    if (dateMode === "date" && specificDate) {
      return {
        startDate: new Date(specificDate + "T00:00:00.000").toISOString(),
        endDate: new Date(specificDate + "T23:59:59.999").toISOString(),
      };
    }
    if (dateMode === "range" && rangeStart && rangeEnd) {
      return {
        startDate: new Date(rangeStart + "T00:00:00.000").toISOString(),
        endDate: new Date(rangeEnd + "T23:59:59.999").toISOString(),
      };
    }
    return {};
  };

  const fetchLogs = useCallback(
    async (nextPage = 1) => {
      setIsLoading(true);
      try {
        const params = { page: nextPage, limit: 20, ...getDateParams() };
        if (debouncedSearchTerm) params.search = debouncedSearchTerm;
        const { data } = await api.get("/logs", { params });
        setLogs(data.data || []);
        setPagination(data.pagination || pagination);
        setPage(nextPage);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load logs.");
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [debouncedSearchTerm, dateMode, specificDate, rangeStart, rangeEnd],
  );

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
        <div className="admin-products-toolbar">
          <div className="admin-search-wrapper">
            <input
              type="text"
              className="admin-form-control"
              placeholder="Search by email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search logs by email"
            />
            {searchTerm && (
              <button
                type="button"
                className="admin-search-clear"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          <select
            className="admin-form-control"
            value={dateMode}
            onChange={(e) => setDateMode(e.target.value)}
            aria-label="Filter logs by date"
          >
            <option value="all">All time</option>
            <option value="1">Last 1 day</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="date">Specific date</option>
            <option value="range">Date range</option>
          </select>
        </div>

        {dateMode === "date" && (
          <div className="admin-logs-date-filter">
            <label htmlFor="logs-specific-date">Date:</label>
            <input
              id="logs-specific-date"
              type="date"
              className="admin-form-control"
              value={specificDate}
              max={todayStr}
              onChange={(e) => setSpecificDate(e.target.value)}
            />
          </div>
        )}

        {dateMode === "range" && (
          <div className="admin-logs-date-filter">
            <label htmlFor="logs-range-start">From:</label>
            <input
              id="logs-range-start"
              type="date"
              className="admin-form-control"
              value={rangeStart}
              max={rangeEnd || todayStr}
              onChange={(e) => setRangeStart(e.target.value)}
            />
            <label htmlFor="logs-range-end">To:</label>
            <input
              id="logs-range-end"
              type="date"
              className="admin-form-control"
              value={rangeEnd}
              min={rangeStart || undefined}
              max={todayStr}
              onChange={(e) => setRangeEnd(e.target.value)}
            />
          </div>
        )}

        <div className="admin-table-head admin-logs-grid">
          <span>Timestamp</span>
          <span>Action</span>
          <span>Performed By</span>
          <span>Details</span>
          <span>Status</span>
        </div>

        {isLoading && <div className="admin-table-empty">Loading logs...</div>}

        {!isLoading && logs.length === 0 && (
          <div className="admin-table-empty">No logs found.</div>
        )}

        {!isLoading &&
          logs.map((log) => (
            <div
              key={log.id || log._id}
              className="admin-table-row admin-logs-grid"
            >
              <span className="admin-log-time">
                {formatDate(log.createdAt)}
              </span>
              <span className="admin-log-action">{log.action || "-"}</span>
              <span className="admin-log-performer">
                {log.actorEmail || log.actorName || "System"}
              </span>
              <span className="admin-log-details">{log.message || "-"}</span>
              <span
                className={`admin-pill ${
                  log.status === "failure"
                    ? "admin-pill-failure"
                    : "admin-pill-success"
                }`}
              >
                {log.status || "success"}
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
