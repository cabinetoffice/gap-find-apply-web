import React from 'react';
import { GetServerSideProps } from 'next';
import Meta from '../../../../components/layout/Meta';
import {
  FlexibleQuestionPageLayout,
  Radio,
  Button,
  ValidationError,
} from 'gap-web-ui';
import SchemeQuestionPage from '../../../../types/SchemeQuestionPage';
import { deleteSection } from '../../../../services/SectionService';
import callServiceMethod from '../../../../utils/callServiceMethod';
import CustomLink from '../../../../components/custom-link/CustomLink';
import { getSessionIdFromCookies } from '../../../../utils/session';

export const getServerSideProps: GetServerSideProps = async ({
  params,
  resolvedUrl,
  req,
  res,
}) => {
  const sessionId = getSessionIdFromCookies(req);
  const { applicationId, sectionId } = params as Record<string, string>;
  const errorPageParams = {
    errorInformation: 'Something went wrong while trying to delete a section',
    linkAttributes: {
      href: '/',
      linkText: 'Please return',
      linkInformation: ' and try again.',
    },
  };

  let fieldErrors: ValidationError[] = [];

  const result = await callServiceMethod(
    req,
    res,
    async (body: RequestBody) => {
      // if the user has Yes radio selected, run delete service call. else, do nothing
      if (body.deleteBool === 'true') {
        await deleteSection(sessionId, applicationId, sectionId);
      } else if (body.deleteBool === 'false') {
        // do nothing, redirect back to overview
      } else {
        // imitating a validation error from the backend if the user hasn't selected an option
        return Promise.reject({
          response: {
            data: {
              fieldErrors: [
                {
                  fieldName: 'deleteBool',
                  errorMessage: 'You must select an option',
                },
              ],
            },
          },
        });
      }
    },
    `/build-application/${applicationId}/dashboard`,
    errorPageParams
  );

  if ('redirect' in result) {
    return result;
  } else if ('body' in result) {
    fieldErrors = result.fieldErrors;
  }

  return {
    props: {
      fieldErrors,
      backButtonHref: `/build-application/${applicationId}/dashboard`,
      formAction: resolvedUrl,
      csrfToken: (req as any).csrfToken?.() || '',
    },
  };
};

const DeleteSectionContent = ({
  fieldErrors,
  backButtonHref,
  formAction,
  csrfToken,
}: DeleteSectionPageProps) => {
  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Delete this section - Manage a grant`}
      />

      <CustomLink href={backButtonHref} isBackButton />

      <div className="govuk-!-padding-top-7">
        <FlexibleQuestionPageLayout
          formAction={formAction}
          fieldErrors={fieldErrors}
          csrfToken={csrfToken}
        >
          <Radio
            questionTitle="Do you want to delete this section?"
            titleSize="l"
            fieldName="deleteBool"
            fieldErrors={fieldErrors}
          />
          <div className="govuk-button-group">
            <Button text="Confirm" />
            <CustomLink
              href={backButtonHref}
              dataCy="cy_deleteSection-cancelLink"
            >
              Cancel
            </CustomLink>
          </div>
        </FlexibleQuestionPageLayout>
      </div>
    </>
  );
};

type DeleteSectionPageProps = SchemeQuestionPage & RequestBody;

type RequestBody = {
  deleteBool: string;
};

export default DeleteSectionContent;
