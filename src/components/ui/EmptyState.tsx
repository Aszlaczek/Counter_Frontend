import type { ReactNode } from "react";

type Props = {
  title: string;
  message?: string;
  icon?: string;
  action?: ReactNode;
};

const EmptyState = ({ title, message, icon = "🗂️", action }: Props) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" aria-hidden="true">
        {icon}
      </div>
      <h3 className="empty-state-title">{title}</h3>
      {message && <p className="empty-state-message">{message}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
};

export default EmptyState;
