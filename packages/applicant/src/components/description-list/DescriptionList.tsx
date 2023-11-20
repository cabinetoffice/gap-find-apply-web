import Link from 'next/link';
import { useRouter } from 'next/router';
import { FC } from 'react';
import { MQ_ORG_TYPES } from '../../utils/constants';

const ORGANISATION = 'Organisation';

export interface DescriptionListProps {
  organisationType?: string;
  data: DescriptionListDataProps[];
  needAddOrChangeButtons: boolean;
  needBorder: boolean;
}
export interface DescriptionListDataProps {
  term: string; //dt
  detail: string; //dd
}

export const DescriptionList: FC<DescriptionListProps> = ({
  data,
  needAddOrChangeButtons,
  needBorder,
  organisationType,
}) => {
  const router = useRouter();
  let pathname: string;
  if (router) {
    pathname = router.pathname;
  }

  const removeOrganisationRowForIndividuals = (row: DescriptionListDataProps) =>
    row.term !== ORGANISATION || organisationType !== MQ_ORG_TYPES.INDIVIDUAL;

  const accountData = data.filter(removeOrganisationRowForIndividuals);

  return (
    <>
      {data && (
        <>
          <dl
            aria-label="description-list"
            className={`govuk-summary-list ${
              needBorder ? '' : 'govuk-summary-list--no-border'
            }`}
          >
            {accountData.map(({ term, detail }) => {
              return (
                <div className="govuk-summary-list__row" key={term}>
                  <dt className="govuk-summary-list__key" aria-label={term}>
                    {term}
                  </dt>
                  <dd
                    className="govuk-summary-list__value"
                    aria-label={!detail ? '-' : detail}
                  >
                    {!detail ? '-' : detail}
                  </dd>
                  {needAddOrChangeButtons && (
                    <dd
                      className="govuk-summary-list__actions"
                      aria-label={`${!detail ? 'Add' : 'Change'} ${term}`}
                    >
                      <Link href={`${pathname}/${term.toLowerCase()}`}>
                        <a className="govuk-link--no-visited-state">
                          {!detail ? 'Add' : 'Change'}
                          <span className="govuk-visually-hidden"> {term}</span>
                        </a>
                      </Link>
                    </dd>
                  )}
                </div>
              );
            })}
          </dl>
        </>
      )}
    </>
  );
};
