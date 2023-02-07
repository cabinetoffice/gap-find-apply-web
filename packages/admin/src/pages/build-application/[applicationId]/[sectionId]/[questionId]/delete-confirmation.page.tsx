import React from 'react';
import Link from '../../../../../components/custom-link/CustomLink';
import { GetServerSideProps } from 'next';
import Meta from '../../../../../components/layout/Meta';
import {
  FlexibleQuestionPageLayout,
  Radio,
  Button,
  ValidationError,
} from 'gap-web-ui';
import SchemeQuestionPage from '../../../../../types/SchemeQuestionPage';
import callServiceMethod from '../../../../../utils/callServiceMethod';
import { deleteQuestion } from '../../../../../services/QuestionService';
import { getSessionIdFromCookies } from '../../../../../utils/session';

export const getServerSideProps: GetServerSideProps = async ({
  params,
  resolvedUrl,
  req,
  res,
}) => {
  const { applicationId, sectionId, questionId } = params as Record<
    string,
    string
  >;
  const errorPageParams = {
    errorInformation: 'Something went wrong while trying to delete a question',
    linkAttributes: {
      href: `/build-application/${applicationId}/dashboard`,
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
        await deleteQuestion(
          getSessionIdFromCookies(req),
          applicationId,
          sectionId,
          questionId
        );
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
      fieldErrors: fieldErrors,
      backButtonHref: `/build-application/${applicationId}/dashboard`,
      formAction: resolvedUrl,
      csrfToken: (req as any).csrfToken?.() || '',
    },
  };
};

const DeleteQuestion = ({
  fieldErrors,
  backButtonHref,
  formAction,
  csrfToken,
}: SchemeQuestionPage) => {
  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Delete a question - Manage a grant`}
      />

      <Link href={backButtonHref}>
        <a className="govuk-back-link">Back</a>
      </Link>

      <div className="govuk-!-padding-top-7">
        <FlexibleQuestionPageLayout
          formAction={formAction}
          fieldErrors={fieldErrors}
          csrfToken={csrfToken}
        >
          <Radio
            questionTitle="Do you want to delete this question?"
            fieldName="deleteBool"
            fieldErrors={fieldErrors}
          />
          <div className="govuk-button-group">
            <Button text="Confirm" />

            <Link href={backButtonHref}>
              <a className="govuk-link" data-cy="cy_deleteQuestion-cancelLink">
                Cancel
              </a>
            </Link>
          </div>
        </FlexibleQuestionPageLayout>
      </div>
    </>
  );
};

type RequestBody = {
  deleteBool: string;
};

export default DeleteQuestion;
