import {
  Button,
  FlexibleQuestionPageLayout,
  TextInput,
  ValidationError,
} from 'gap-web-ui';
import { GetServerSideProps } from 'next';
import {
  default as CustomLink,
  default as Link,
} from '../../../components/custom-link/CustomLink';
import Meta from '../../../components/layout/Meta';
import { patchScheme } from '../../../services/SchemeService';
import SchemeQuestionPage from '../../../types/SchemeQuestionPage';
import callServiceMethod from '../../../utils/callServiceMethod';
import { getSessionIdFromCookies } from '../../../utils/session';

type RequestBody = {
  ggisReference: string;
};

export const getServerSideProps: GetServerSideProps = async ({
  query,
  req,
  res,
  resolvedUrl,
}) => {
  const { schemeId } = query;
  let { defaultValue = null } = query;

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
      formAction: process.env.SUB_PATH + resolvedUrl,
      defaultValue: defaultValue,
      csrfToken: res.getHeader('x-csrf-token') as string,
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
        }Edit GGIS reference - Edit grant scheme - Manage a grant`}
      />

      <Link
        href={backButtonHref}
        data-cy="cy_emailQuestionPageBackButton"
        isBackButton
      />

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
