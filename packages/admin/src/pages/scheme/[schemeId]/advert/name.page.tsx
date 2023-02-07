import {
  Button,
  FlexibleQuestionPageLayout,
  TextInput,
  ValidationError,
} from 'gap-web-ui';
import { GetServerSidePropsContext } from 'next';
import React from 'react';
import CustomLink from '../../../../components/custom-link/CustomLink';
import Meta from '../../../../components/layout/Meta';
import NoSSRWrapper from '../../../../components/layout/NoSSRWrapper';
import { createNewAdvert } from '../../../../services/AdvertPageService';
import InferProps from '../../../../types/InferProps';
import callServiceMethod from '../../../../utils/callServiceMethod';
import {
  generateErrorPageParams,
  generateErrorPageRedirect,
} from '../../../../utils/serviceErrorHelpers';
import { getSessionIdFromCookies } from '../../../../utils/session';
import { NoJSAssistedJourneyMessage } from './[advertId]/components/NoJSAssistedJourneyMessage.tsx';

type RequestBody = {
  name: string;
};

export const getServerSideProps = async ({
  params,
  req,
  res,
  resolvedUrl,
}: GetServerSidePropsContext) => {
  const { schemeId } = params as Record<string, string>;

  let defaultValue = '';
  let fieldErrors = [] as ValidationError[];

  if (!schemeId)
    return generateErrorPageRedirect(
      'Something went wrong while trying to create a new advert.',
      `/dashboard`
    );

  const result = await callServiceMethod(
    req,
    res,
    (body: RequestBody) =>
      createNewAdvert(getSessionIdFromCookies(req), schemeId, body.name),
    (result) => {
      return `/scheme/${schemeId}/advert/${result.id}/section-overview`;
    },
    generateErrorPageParams(
      'Something went wrong while trying to create a new advert.',
      `/scheme/${schemeId}/advert/name`
    )
  );

  if ('redirect' in result) {
    // Redirect (both, in case of success and error)
    return result;
  } else if ('body' in result) {
    // If adding the name to the session failed due to a validation error, pass these errors to the page
    fieldErrors = result.fieldErrors;
    defaultValue = result.body.name;
  }

  return {
    props: {
      fieldErrors,
      backButtonHref: `/scheme/${schemeId}`,
      formAction: resolvedUrl,
      defaultValue,
      csrfToken: (req as any).csrfToken?.() || '',
    },
  };
};

const AdvertName = ({
  fieldErrors,
  backButtonHref,
  formAction,
  defaultValue = '',
  csrfToken,
}: InferProps<typeof getServerSideProps>) => {
  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Create an advert - Manage a grant`}
      />

      <CustomLink
        href={`${backButtonHref}`}
        dataCy="cyBackNewAdvertName"
        isBackButton
      />

      <div className="govuk-!-padding-top-7">
        <NoSSRWrapper>
          <FlexibleQuestionPageLayout
            formAction={formAction}
            fieldErrors={fieldErrors}
            csrfToken={csrfToken}
          >
            <TextInput
              questionTitle="What is the name of your grant?"
              fieldName="name"
              fieldErrors={fieldErrors}
              defaultValue={defaultValue}
            />
            <Button text="Save and continue" />
          </FlexibleQuestionPageLayout>
        </NoSSRWrapper>
        <NoJSAssistedJourneyMessage backButtonHref={backButtonHref} />
      </div>
    </>
  );
};

export default AdvertName;
