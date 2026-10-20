import React from 'react';

interface BadgeProps {
  status: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const getStyle = (st: string) => {
    switch (st.toUpperCase()) {
      case 'SUCCESS':
      case 'APPROVED':
      case 'COMPLETED':
      case 'ACTIVE':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'PENDING':
      case 'PENDING_PAYMENT':
      case 'PROCESSING':
      case 'PAID_BY_BUYER':
      case 'IN_PROGRESS':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'REJECTED':
      case 'FAILED':
      case 'CANCELLED':
      case 'FROZEN':
      case 'SUSPENDED':
      case 'TIMEOUT':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'APPEALED':
      case 'DISPUTED':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getLabel = (st: string) => {
    switch (st.toUpperCase()) {
      case 'PAID_BY_BUYER':
        return 'Paid (Verify)';
      case 'PENDING_PAYMENT':
        return 'Pending Pay';
      default:
        return st.replace(/_/g, ' ');
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${getStyle(
        status
      )} ${className}`}
    >
      {getLabel(status)}
    </span>
  );
};

export default Badge;
