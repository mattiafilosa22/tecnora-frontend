import { useState } from 'react';
import { Link } from 'react-router';
import { PageHeader } from '../components/PageHeader';
import { card, fieldInput, fieldLabel, link, table, td, th } from '../components/styles';
import { usePrototype } from '../prototype/context';
import { BUILDING_TYPES } from '../prototype/format';

export function BuildingsPage() {
  const { state } = usePrototype();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');

  const q = query.trim().toLowerCase();
  const buildings = state.buildings.filter(
    (b) =>
      (!type || b.type === type) &&
      [b.name, b.address, b.city, b.code].some((field) => field.toLowerCase().includes(q)),
  );
  const activityCount = (id: string) => state.activities.filter((a) => a.buildingId === id).length;
  const openTicketCount = (id: string) =>
    state.tickets.filter((t) => t.buildingId === id && t.status !== 'chiuso').length;

  return (
    <>
      <PageHeader
        title="Edifici"
        description="Gli edifici in gestione. Apri una scheda per vedere referente, attività e ticket."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-[2fr_1fr]">
        <div>
          <label htmlFor="cerca-edificio" className={fieldLabel}>
            Cerca edificio
          </label>
          <input
            id="cerca-edificio"
            type="search"
            className={fieldInput}
            placeholder="Nome, indirizzo, città o codice"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="tipo-edificio" className={fieldLabel}>
            Tipo edificio
          </label>
          <select
            id="tipo-edificio"
            className={fieldInput}
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">Tutti</option>
            {BUILDING_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {buildings.length === 0 ? (
        <p className={card}>Nessun edificio corrisponde alla ricerca.</p>
      ) : (
        <div className={`${card} overflow-x-auto p-0`}>
          <table className={table}>
            <thead className="bg-slate-50">
              <tr>
                <th className={th}>Edificio</th>
                <th className={th}>Indirizzo</th>
                <th className={th}>Città</th>
                <th className={th}>Tipo</th>
                <th className={th}>Attività</th>
                <th className={th}>Ticket aperti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {buildings.map((b) => (
                <tr key={b.id}>
                  <td className={td}>
                    <Link to={`/edifici/${b.id}`} className={link}>
                      {b.name}
                    </Link>
                    <p className="text-xs text-slate-500">{b.code}</p>
                  </td>
                  <td className={td}>{b.address}</td>
                  <td className={td}>{b.city}</td>
                  <td className={td}>{b.type}</td>
                  <td className={td}>{activityCount(b.id)}</td>
                  <td className={td}>{openTicketCount(b.id)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
