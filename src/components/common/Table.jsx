import { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * Data table with sorting, pagination, and actions column
 * @component
 * @example
 * <Table
 *   columns={[
 *     { key: 'name', header: 'Name', sortable: true },
 *     { key: 'email', header: 'Email', sortable: true },
 *     { key: 'actions', header: 'Actions', render: (row) => <Button>Edit</Button> }
 *   ]}
 *   data={users}
 *   pagination={{ page: 1, pageSize: 10, total: 100 }}
 *   onPageChange={setPage}
 *   onSort={handleSort}
 * />
 */
const Table = ({
  columns = [],
  data = [],
  pagination,
  onPageChange,
  onSort,
  sortBy,
  sortOrder = 'asc',
  loading = false,
  emptyMessage = 'No data available',
  rowKey = 'id',
  striped = false,
  hoverable = true,
  bordered = false,
  compact = false,
  className = '',
  caption,
  responsive = true,
  ...props
}) => {
  const [sortConfig, setSortConfig] = useState({ key: sortBy, order: sortOrder });

  const handleSort = useCallback((key) => {
    if (!onSort) return;
    let order = 'asc';
    if (sortConfig.key === key && sortConfig.order === 'asc') {
      order = 'desc';
    }
    setSortConfig({ key, order });
    onSort(key, order);
  }, [onSort, sortConfig]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !onSort) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.order === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.order === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig, onSort]);

  const paginatedData = pagination ? sortedData.slice(
    (pagination.page - 1) * pagination.pageSize,
    pagination.page * pagination.pageSize
  ) : sortedData;

  const tableClasses = ['table', className].filter(Boolean).join(' ');

  const wrapperClasses = ['table__wrapper'];
  if (responsive) wrapperClasses.push('table-responsive');
  if (className) wrapperClasses.push(className);

  return (
    <div className={wrapperClasses.join(' ')} {...props}>
      {caption && <caption className="table__caption">{caption}</caption>}
      <div className="table__container">
        <table className={tableClasses} role="grid">
          <thead>
            <tr role="row">
              {columns.map((column, colIndex) => (
                <th
                  key={colIndex}
                  scope="col"
                  className={`table__th ${column.align ? `text-${column.align}` : ''} ${column.sortable ? 'table__th--sortable' : ''}`}
                  style={{ width: column.width }}
                  aria-sort={sortConfig.key === column.key ? (sortConfig.order === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  <div className="table__th-content">
                    <span>{column.header}</span>
                    {column.sortable && (
                      <button
                        type="button"
                        className="table__sort-btn"
                        onClick={() => handleSort(column.key)}
                        aria-label={`Sort by ${column.header} ${sortConfig.key === column.key && sortConfig.order === 'asc' ? 'descending' : 'ascending'}`}
                      >
                        <svg className="table__sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polyline points="18 15 12 9 6 15" />
                        </svg>
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="table__loading-cell">
                  <div className="table__loading">
                    <span className="table__spinner" aria-hidden="true" />
                    <span>Loading...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="table__empty-cell">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr key={row[rowKey] || rowIndex} role="row" className="table__tr">
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} role="gridcell" className={`table__td ${column.align ? `text-${column.align}` : ''}`}>
                      {column.render
                        ? column.render(row, rowIndex)
                        : column.key
                        ? row[column.key]
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="table__pagination" role="navigation" aria-label="Pagination">
          <div className="table__pagination-info">
            Showing {(pagination.page - 1) * pagination.pageSize + 1} to {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} results
          </div>
          <div className="table__pagination-controls">
            <button
              type="button"
              className="table__page-btn"
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page <= 1}
              aria-label="Previous page"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <span className="table__page-info" aria-live="polite">
              Page {pagination.page} of {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            <button
              type="button"
              className="table__page-btn"
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
              aria-label="Next page"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

Table.displayName = 'Table';

Table.propTypes = {
  /** Column definitions */
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      header: PropTypes.string.isRequired,
      sortable: PropTypes.bool,
      width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      align: PropTypes.oneOf(['left', 'center', 'right']),
      render: PropTypes.func,
    })
  ),
  /** Table data */
  data: PropTypes.arrayOf(PropTypes.object),
  /** Pagination config */
  pagination: PropTypes.shape({
    page: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
  }),
  /** Page change handler */
  onPageChange: PropTypes.func,
  /** Sort handler */
  onSort: PropTypes.func,
  /** Current sort key */
  sortBy: PropTypes.string,
  /** Current sort order */
  sortOrder: PropTypes.oneOf(['asc', 'desc']),
  /** Loading state */
  loading: PropTypes.bool,
  /** Empty state message */
  emptyMessage: PropTypes.string,
  /** Row key for React keys */
  rowKey: PropTypes.string,
  /** Zebra striping (not used in new CSS) */
  striped: PropTypes.bool,
  /** Hover highlight */
  hoverable: PropTypes.bool,
  /** Show borders (not used in new CSS) */
  bordered: PropTypes.bool,
  /** Compact density (not used in new CSS) */
  compact: PropTypes.bool,
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Table caption */
  caption: PropTypes.string,
  /** Make table responsive */
  responsive: PropTypes.bool,
};

Table.defaultProps = {
  columns: [],
  data: [],
  pagination: undefined,
  onPageChange: undefined,
  onSort: undefined,
  sortBy: undefined,
  sortOrder: 'asc',
  loading: false,
  emptyMessage: 'No data available',
  rowKey: 'id',
  striped: false,
  hoverable: true,
  bordered: false,
  compact: false,
  className: '',
  caption: undefined,
  responsive: true,
};

export default Table;