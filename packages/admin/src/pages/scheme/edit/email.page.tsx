import {
  Button,
  FlexibleQuestionPageLayout,
  TextInput,
  ValidationError,
} from 'gap-web-ui';
import { GetServerSideProps } from 'next';
import Link from '../../../components/custom-link/CustomLink';
import Meta from '../../../components/layout/Meta';
import { patchScheme } from '../../../services/SchemeService';
import SchemeQuestionPage from '../../../types/SchemeQuestionPage';
import callServiceMethod from '../../../utils/callServiceMethod';
import { getSessionIdFromCookies } from '../../../utils/session';

type RequestBody = {
  contactEmail: string;
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
    defaultValue = response.body.contactEmail;
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

const SchemeEmail = ({
  fieldErrors,
  backButtonHref,
  formAction,
  defaultValue,
  csrfToken,
}: SchemeQuestionPage) => {
  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Edit support email - Edit grant scheme - Manage a grant`}
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
            questionTitle="Enter the email address you want to use for support"
            questionHintText="Enter the address people can contact if they need support. You can change this later if you need to."
            fieldName="contactEmail"
            fieldErrors={fieldErrors}
            defaultValue={defaultValue}
            textInputSubtype="email"
          />
          <Button text="Save and continue" />
        </FlexibleQuestionPageLayout>
      </div>
    </>
  );
};

export default SchemeEmail;
