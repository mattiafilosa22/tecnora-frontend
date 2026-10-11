import type { ReactNode } from 'react';
import {
  DUE_HELP,
  DUE_LABEL,
  PRIORITY_HELP,
  PRIORITY_LABEL,
  STATUS_HELP,
  STATUS_LABEL,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  type DueStatus,
} from '../prototype/format';
import type { TicketPriority, TicketStatus } from '../prototype/types';

const base = 'inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium';

const STATUS_CLASS: Record<TicketStatus, string> = {
  aperto: 'bg-blue-100 text-blue-800',
  in_carico: 'bg-amber-100 text-amber-800',
  in_attesa: 'bg-slate-200 text-slate-700',
  chiuso: 'bg-green-100 text-green-800',
};

const PRIORITY_CLASS: Record<TicketPriority, string> = {
  urgente: 'bg-red-600 text-white',
  alta: 'bg-red-100 text-red-800',
  media: 'bg-amber-100 text-amber-800',
  bassa: 'bg-slate-100 text-slate-700',
};

const DUE_CLASS: Record<DueStatus, string> = {
  scaduta: 'bg-red-100 text-red-800',
  in_scadenza: 'bg-amber-100 text-amber-800',
  programmata: 'bg-green-100 text-green-800',
};

interface BadgeProps {
  label: string;
  help: string;
  className: string;
  /** false quando la spiegazione è già scritta accanto, per non farla leggere due volte. */
  describe?: boolean;
}

// `title` resta come suggerimento al passaggio del mouse; per tastiera, touch e lettori di
// schermo la spiegazione è nel testo (nascosto alla vista) e nelle legende visibili.
function Badge({ label, help, className, describe = true }: BadgeProps) {
  return (
    <span className={`${base} ${className}`} title={help}>
      {label}
      {describe && <span className="sr-only">: {help}</span>}
    </span>
  );
}

type DescribeProp = Pick<BadgeProps, 'describe'>;

interface TicketStatusBadgeProps extends DescribeProp {
  status: TicketStatus;
}

interface PriorityBadgeProps extends DescribeProp {
  priority: TicketPriority;
}

interface DueBadgeProps extends DescribeProp {
  status: DueStatus;
}

export function TicketStatusBadge({ status, describe }: TicketStatusBadgeProps) {
  return (
    <Badge
      label={STATUS_LABEL[status]}
      help={STATUS_HELP[status]}
      className={STATUS_CLASS[status]}
      describe={describe}
    />
  );
}

export function PriorityBadge({ priority, describe }: PriorityBadgeProps) {
  return (
    <Badge
      label={PRIORITY_LABEL[priority]}
      help={PRIORITY_HELP[priority]}
      className={PRIORITY_CLASS[priority]}
      describe={describe}
    />
  );
}

export function DueBadge({ status, describe }: DueBadgeProps) {
  return (
    <Badge
      label={DUE_LABEL[status]}
      help={DUE_HELP[status]}
      className={DUE_CLASS[status]}
      describe={describe}
    />
  );
}

const legendSummary =
  'cursor-pointer rounded-sm font-medium text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

function LegendRow({ badge, help }: { badge: ReactNode; help: string }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-3">
      <dt className="sm:w-32 sm:shrink-0">{badge}</dt>
      <dd className="text-slate-600">{help}</dd>
    </div>
  );
}

/** Spiegazione visibile di stati e priorità dei ticket. */
export function TicketLegend() {
  return (
    <details className="mb-4 text-sm">
      <summary className={legendSummary}>Cosa significano stati e priorità</summary>
      <div className="mt-2 grid gap-4 md:grid-cols-2">
        <dl className="space-y-2">
          {TICKET_STATUSES.map((s) => (
            <LegendRow
              key={s}
              badge={<TicketStatusBadge status={s} describe={false} />}
              help={STATUS_HELP[s]}
            />
          ))}
        </dl>
        <dl className="space-y-2">
          {TICKET_PRIORITIES.map((p) => (
            <LegendRow
              key={p}
              badge={<PriorityBadge priority={p} describe={false} />}
              help={PRIORITY_HELP[p]}
            />
          ))}
        </dl>
      </div>
    </details>
  );
}

const DUE_STATUSES: DueStatus[] = ['scaduta', 'in_scadenza', 'programmata'];

/** Spiegazione visibile dello stato delle scadenze. */
export function DueLegend() {
  return (
    <details className="mb-4 text-sm">
      <summary className={legendSummary}>Cosa significano gli stati delle scadenze</summary>
      <dl className="mt-2 space-y-2">
        {DUE_STATUSES.map((s) => (
          <LegendRow key={s} badge={<DueBadge status={s} describe={false} />} help={DUE_HELP[s]} />
        ))}
      </dl>
    </details>
  );
}
