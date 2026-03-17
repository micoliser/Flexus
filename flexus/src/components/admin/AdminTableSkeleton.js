const AdminTableSkeleton = ({ gridClass = "", columns = 4, rows = 6 }) => {
  const rowClassName = `admin-table-row ${gridClass}`.trim();

  return (
    <>
      <div className="admin-skeleton-toolbar" aria-hidden="true">
        <span className="admin-skeleton-block admin-skeleton-input"></span>
        <span className="admin-skeleton-block admin-skeleton-select"></span>
      </div>

      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`admin-skeleton-row-${rowIndex}`} className={rowClassName}>
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <span
              key={`admin-skeleton-cell-${rowIndex}-${columnIndex}`}
              className={`admin-skeleton-block ${columnIndex === columns - 1 ? "admin-skeleton-pill" : "admin-skeleton-text"}`}
            ></span>
          ))}
        </div>
      ))}
    </>
  );
};

export default AdminTableSkeleton;
