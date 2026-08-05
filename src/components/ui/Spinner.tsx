type Props = {
  label?: string;
  full?: boolean;
};

const Spinner = ({ label, full }: Props) => {
  return (
    <div
      className={`spinner-wrapper${full ? " spinner-full" : ""}`}
      role="status"
      aria-live="polite"
    >
      <div className="spinner" aria-hidden="true" />
      {label && <p className="spinner-label">{label}</p>}
    </div>
  );
};

export default Spinner;
