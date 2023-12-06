import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import Layout from '../../components/partials/Layout';
import Meta from '../../components/partials/Meta';
import { GrantMandatoryQuestionService } from '../../services/GrantMandatoryQuestionService';
import InferProps from '../../types/InferProps';
import { getJwtFromCookies } from '../../utils/jwt';
import { routes } from '../../utils/routes';

export async function getServerSideProps({
  req,
  query,
}: GetServerSidePropsContext) {
  const { schemeId } = query as Record<string, string>;
  const jwt = getJwtFromCookies(req);
  const mandatoryQuestionService = GrantMandatoryQuestionService.getInstance();
  try {
    const mandatoryQuestionExists =
      await mandatoryQuestionService.existBySchemeIdAndApplicantId(
        schemeId,
        jwt
      );
    if (mandatoryQuestionExists) {
      const mandatoryQuestion =
        await mandatoryQuestionService.getMandatoryQuestionBySchemeId(
          jwt,
          schemeId
        );
      if (mandatoryQuestion.submissionId) {
        return {
          redirect: {
            destination: routes.applications,
            permanent: false,
          },
        };
      }
    }
  } catch (error) {
    console.error(error);
    return {
      redirect: {
        destination: `/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to retrieve your mandatory questions","linkAttributes":{"href":"/mandatory-questions/start?schemeId=${schemeId}","linkText":"Please return","linkInformation":" and try again."}}`,
        permanent: false,
      },
    };
  }
  return {
    props: {
      schemeId,
    },
  };
}

export default function MandatoryQuestionsBeforeYouStart({
  schemeId,
}: InferProps<typeof getServerSideProps>) {
  return (
    <>
      <Meta title="Before you start" />
      <Layout>
        <h1 className="govuk-heading-l">Before you start</h1>
        <p className="govuk-body">
          Before you start, we’d like to ask you a few questions.
        </p>
        <p className="govuk-body">
          These questions will be used by the grant administrators to prevent
          fraud and help understand the demand for this grant.
        </p>
        <p className="govuk-body">You will need:</p>
        <ul className="govuk-list govuk-list--bullet">
          <li data-cy="cy-before-you-start-help-text-bullet-1">your address</li>
          <li data-cy="cy-before-you-start-help-text-bullet-2">
            your Companies House number (if you have one)
          </li>
          <li data-cy="cy-before-you-start-help-text-bullet-3">
            your Charity Commission number (if you have one)
          </li>
        </ul>

        <Link href={routes.api.createMandatoryQuestion(schemeId)}>
          <a
            className="govuk-button"
            data-module="govuk-button"
            aria-disabled="false"
            role="button"
          >
            Continue
          </a>
        </Link>
      </Layout>
    </>
  );
}
