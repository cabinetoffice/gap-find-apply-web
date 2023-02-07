import Link from 'next/link';
import gloss from '../../utils/glossary.json';
import { useRouter } from 'next/router';

function BreadCrumbs({ routes = [] }) {
  const router = useRouter();
  if (Array.isArray(routes) && routes?.length === 0) {
    return (
      <a
        onClick={() => router.back()}
        className="govuk-back-link"
        data-cy="cy-"
      >
        {gloss.buttons.back}
      </a>
    );
  }
  return (
    <div className="govuk-breadcrumbs">
      <ol className="govuk-breadcrumbs__list">
        {Array.isArray(routes) &&
          routes.map(({ label, path }) => (
            <li key={path} className="govuk-breadcrumbs__list-item">
              <Link href={path}>
                <a className="govuk-breadcrumbs__link" href="#">
                  {label}
                </a>
              </Link>
            </li>
          ))}
      </ol>
    </div>
  );
}

export { BreadCrumbs };
