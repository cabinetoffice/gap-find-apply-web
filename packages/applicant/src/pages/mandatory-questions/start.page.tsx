import { Button } from 'gap-web-ui';
import { GetServerSidePropsContext } from 'next';
import Layout from '../../components/partials/Layout';
import Meta from '../../components/partials/Meta';

export async function getServerSideProps({ query }: GetServerSidePropsContext) {
  const { schemeId } = query as Record<string, string>;
  return {
    props: {
      schemeId,
    },
  };
}

export default function MandatoryQuestionsBeforeYouStart({ schemeId }) {
  return (
    <>
      <Meta title="Before you start" />
      <Layout>
        <h1 className="govuk-heading-l">Before you start</h1>
        <p className="govuk-body">
          Before you start, we’d like to ask you a few questions.
        </p>
        <p className="govuk-body">
          These questions will be used by the grant’s administrators to prevent
          fraud and help Find a grant understand the demand for this grant.
        </p>
        <p className="govuk-body">You will need:</p>
        <ul className="govuk-list govuk-list--bullet">
          <li data-cy="cy-before-you-start-help-text-bullet-1">
            your organisation’s address
          </li>
          <li data-cy="cy-before-you-start-help-text-bullet-2">
            your Companies House number (if you have one)
          </li>
          <li data-cy="cy-before-you-start-help-text-bullet-3">
            your Charity Commission number (if you have one)
          </li>
        </ul>
        <Button text="Continue" />
      </Layout>
    </>
  );
}
