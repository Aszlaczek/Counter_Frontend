type Props = {
  page: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
};

const Pagination = ({ page, hasMore, onPageChange }: Props) => {
  if (page <= 1 && !hasMore) return null;

  return (
    <div className="pagination">
      <button
        type="button"
        className="pagination-btn"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Poprzednia strona"
      >
        ← Poprzednia
      </button>
      <span className="pagination-info">Strona {page}</span>
      <button
        type="button"
        className="pagination-btn"
        disabled={!hasMore}
        onClick={() => onPageChange(page + 1)}
        aria-label="Następna strona"
      >
        Następna →
      </button>
    </div>
  );
};

export default Pagination;
