import Link from 'next/link';
import gloss from '../../../utils/glossary.json';

export function GrantDetailsApplyButton({ grant }) {
  return (
    <div className="govuk-grid-row govuk-body">
      <div className="govuk-grid-column-full">
        {grant.grantShowApplyButton ? (
          <Link
            href={{
              pathname: '/apply/[pid]',
              query: { pid: grant.label },
            }}
          >
            <a
              target="_blank"
              className="govuk-button"
              data-module="govuk-button"
              aria-disabled="false"
              role="button"
            >
              {gloss.buttons.newApplication}
            </a>
          </Link>
        ) : (
          <a
            className="govuk-button govuk-button--disabled"
            data-module="govuk-button"
            disabled="disabled"
            aria-disabled="true"
            href="#"
            role="button"
          >
            {gloss.buttons.newApplication}
          </a>
        )}
      </div>
    </div>
  );
}
