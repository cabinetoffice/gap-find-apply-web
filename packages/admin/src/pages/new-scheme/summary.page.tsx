import { GetServerSideProps } from 'next';
import getConfig from 'next/config';
import CustomLink from '../../components/custom-link/CustomLink';
import Meta from '../../components/layout/Meta';
import SummaryList from '../../components/summary-list/SummaryList';
import SummaryListProps from '../../components/summary-list/SummaryListType';
import { createNewScheme } from '../../services/SchemeService';
import { getSummaryFromSession } from '../../services/SessionService';
import callServiceMethod from '../../utils/callServiceMethod';
import { getSessionIdFromCookies } from '../../utils/session';
import { errorPageParams, serviceErrorRedirect } from './newSchemeServiceError';

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const sessionCookie = getSessionIdFromCookies(req);
  const backButtonHref = `backButtonHref=${encodeURIComponent(
    '/new-scheme/summary'
  )}`;
  const successRedirect = `successRedirect=${encodeURIComponent(
    '/new-scheme/summary'
  )}`;
  const changeDetailsQueryParams = `${backButtonHref}&${successRedirect}`;

  if (!sessionCookie) {
    return serviceErrorRedirect;
  }

  const schemeSummary = await getSummaryFromSession('newScheme', sessionCookie);

  const result = await callServiceMethod(
    req,
    res,
    () =>
      createNewScheme(
        sessionCookie,
        schemeSummary['grantName'],
        schemeSummary['ggisReference'],
        schemeSummary['contactEmail']
      ),
    '/dashboard',
    errorPageParams
  );

  if ('redirect' in result) {
    // If we successfully added the name to the session, redirect to the ggis-reference page
    // If adding the name to the session failed, and the cause was NOT a validation error, redirect to the service error page
    return result;
  } else if ('body' in result) {
    // If adding the name to the session failed due to a validation error, redirect to the service error page
    return serviceErrorRedirect;
  }

  const summaryData: SummaryListProps = {
    rows: [
      {
        key: 'Grant name',
        value: schemeSummary['grantName'],
        action: {
          href: `/new-scheme/name?${changeDetailsQueryParams}`,
          label: 'Change',
          ariaLabel: 'Change scheme name',
        },
      },
      {
        key: 'GGIS Scheme Reference Number',
        value: schemeSummary['ggisReference'],
        action: {
          href: `/new-scheme/ggis-reference?${changeDetailsQueryParams}`,
          label: 'Change',
          ariaLabel: 'Change scheme GGIS reference',
        },
      },
      {
        key: 'Support email address',
        value: schemeSummary['contactEmail'],
        action: {
          href: `/new-scheme/email?${changeDetailsQueryParams}`,
          label: 'Change',
          ariaLabel: 'Change scheme contact email address',
        },
      },
    ],
  };
  return {
    props: {
      summaryData: summaryData,
      csrfToken: res.getHeader('x-csrf-token') as string,
    },
  };
};

const SchemeSummary = ({ summaryData, csrfToken }: SchemeSummaryProps) => {
  const { publicRuntimeConfig } = getConfig();
  return (
    <>
      <Meta title="Confirm details - Add a grant - Manage a grant" />

      <CustomLink href="/new-scheme/email" isBackButton />

      <div className="govuk-grid-row govuk-!-padding-top-7">
        <div className="govuk-grid-column-two-thirds govuk-!-margin-bottom-6">
          <h1 className="govuk-heading-l">
            Check and confirm the details of your grant
          </h1>

          <form
            action={`${publicRuntimeConfig.SUB_PATH}/new-scheme/summary`}
            method="post"
            noValidate
            data-testid="form-test-id"
          >
            <SummaryList {...summaryData} />

            <input type="hidden" name="_csrf" value={csrfToken} />

            <button
              className="govuk-button"
              data-module="govuk-button"
              data-cy="cy_addAGrantConfirmationPageButton"
            >
              Confirm
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

interface SchemeSummaryProps {
  summaryData: SummaryListProps;
  csrfToken: string;
}

export default SchemeSummary;
