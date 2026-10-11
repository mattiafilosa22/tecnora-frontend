import { Link } from 'react-router';
import { PageHeader } from '../components/PageHeader';
import { link } from '../components/styles';

export function NotFoundPage() {
  return (
    <>
      <PageHeader
        title="Pagina non trovata"
        description="L'indirizzo aperto non corrisponde a nessuna schermata del prototipo."
      />
      <Link to="/dashboard" className={link}>
        Torna alla dashboard
      </Link>
    </>
  );
}
