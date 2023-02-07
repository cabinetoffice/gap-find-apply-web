import { GetServerSideProps } from 'next';
import {
  Button,
  FlexibleQuestionPageLayout,
  TextInput,
  ValidationError,
} from 'gap-web-ui';
import SchemeQuestionPage from '../../../types/SchemeQuestionPage';
import Link from '../../../components/custom-link/CustomLink';
import Meta from '../../../components/layout/Meta';
import callServiceMethod from '../../../utils/callServiceMethod';
import { patchScheme } from '../../../services/SchemeService';
import { getSessionIdFromCookies } from '../../../utils/session';
import CustomLink from '../../../components/custom-link/CustomLink';

type RequestBody = {
  ggisReference: string;
};

export const getServerSideProps: GetServerSideProps = async ({
  query,
  req,
  res,
  resolvedUrl,
}) => {
  let { schemeId, defaultValue = null } = query;

  let fieldErrors = [] as ValidationError[];

  const errorPageParams = {
    errorInformation: 'Something went wrong while trying to update the scheme.',
    linkAttributes: {
      href: `/scheme/${schemeId}`,
      linkText: 'Please try again.',
      linkInformation: 'Your previous progress has been lost.',
    },
  };

  if (!schemeId) {
    return {
      redirect: {
        destination: `/service-error?serviceErrorProps=${JSON.stringify({
          errorInformation:
            'Something went wrong while trying to update the scheme.',
          linkAttributes: {
            href: `/dashboard`,
            linkText: 'Please try again.',
            linkInformation: 'Your previous progress has been lost.',
          },
        })}`,
        permanent: false,
      },
    };
  }

  const response = await callServiceMethod(
    req,
    res,
    (body: RequestBody) =>
      patchScheme(schemeId as string, body, getSessionIdFromCookies(req)),
    `/scheme/${schemeId}`,
    errorPageParams
  );

  if ('redirect' in response) {
    return response;
  } else if ('body' in response) {
    fieldErrors = response.fieldErrors;
    defaultValue = response.body.ggisReference;
  }

  return {
    props: {
      fieldErrors: fieldErrors,
      backButtonHref: `/scheme/${schemeId}`,
      formAction: resolvedUrl,
      defaultValue: defaultValue,
      csrfToken: (req as any).csrfToken?.() || '',
    },
  };
};

const SchemeGGiSReference = ({
  fieldErrors,
  backButtonHref,
  formAction,
  defaultValue,
  csrfToken,
}: SchemeQuestionPage) => {
  const questionHint = (
    <>
      <p>
        GGIS stands for the Government Grant Information System. It holds the
        official list of all grants available across government.
      </p>
      <CustomLink
        href="https://grantshub.civilservice.gov.uk/ggis/s/login/?ec=302&startURL=%2Fggis%2Fs%2F"
        excludeSubPath
      >
        Where can I find my GGIS Scheme Reference Number?
      </CustomLink>
    </>
  );

  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Edit grant scheme - Manage a grant`}
      />

      <Link href={backButtonHref}>
        <a className="govuk-back-link" data-cy="cy_emailQuestionPageBackButton">
          Back
        </a>
      </Link>

      <div className="govuk-!-padding-top-7">
        <FlexibleQuestionPageLayout
          formAction={formAction}
          fieldErrors={fieldErrors}
          csrfToken={csrfToken}
        >
          <TextInput
            questionTitle="Enter your GGIS Scheme Reference Number"
            questionHintText={questionHint}
            fieldName="ggisReference"
            fieldErrors={fieldErrors}
            defaultValue={defaultValue}
          />
          <Button text="Save and continue" />
        </FlexibleQuestionPageLayout>
      </div>
    </>
  );
};
export default SchemeGGiSReference;
