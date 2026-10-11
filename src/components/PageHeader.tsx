import { useEffect, type ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  useEffect(() => {
    document.title = `${title} · Tecnora DFM (prototipo)`;
  }, [title]);

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {/* tabIndex -1: il Layout sposta qui il focus a ogni cambio di pagina. */}
        <h1 tabIndex={-1} className="text-2xl font-semibold text-slate-900 focus:outline-none">
          {title}
        </h1>
        {description && <p className="mt-1 max-w-3xl text-slate-600">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
