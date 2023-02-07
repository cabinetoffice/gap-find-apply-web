import { ErrorBanner, Radio, ValidationError } from 'gap-web-ui';
import { GetServerSideProps } from 'next';
import getConfig from 'next/config';
import Link from 'next/link';
import Layout from '../../../../../components/partials/Layout';
import Meta from '../../../../../components/partials/Meta';
import {
  getSectionById,
  postHasSectionBeenCompleted,
  QuestionType,
  SectionData,
  SectionReviewBody,
} from '../../../../../services/SubmissionService';
import callServiceMethod from '../../../../../utils/callServiceMethod';
import { getJwtFromCookies } from '../../../../../utils/jwt';
import { routes } from '../../../../../utils/routes';
import { ProcessMultiResponse } from './processMultiResponse';

const { publicRuntimeConfig } = getConfig();

export interface SectionRecapPage {
  submissionId: string;
  section: SectionData;
  csrfToken: string;
  fieldErrors: ValidationError[];
}

export const getServerSideProps: GetServerSideProps<SectionRecapPage> = async ({
  req,
  res,
  params,
}) => {
  const submissionId = params.submissionId.toString();
  const sectionId = params.sectionId.toString();
  const section = await getSectionById(
    submissionId,
    sectionId,
    getJwtFromCookies(req)
  );
  let fieldErrors = [] as ValidationError[];
  const response = await callServiceMethod(
    req,
    res,
    (body: SectionReviewBody) =>
      postHasSectionBeenCompleted(
        submissionId,
        sectionId,
        body,
        getJwtFromCookies(req)
      ),
    routes.submissions.sections(submissionId),
    {
      errorInformation:
        'Something went wrong while trying to set the completion of the section',
      linkAttributes: {
        href: routes.submissions.section(submissionId, sectionId),
        linkText: 'Please return',
        linkInformation: ' and try again.',
      },
    }
  );

  if ('redirect' in response) {
    return response;
  } else if ('body' in response) {
    fieldErrors = response.fieldErrors;
  }
  return {
    props: {
      submissionId,
      section,
      csrfToken: (req as any).csrfToken?.() || '',
      fieldErrors,
    },
  };
};

export default function SectionRecap({
  submissionId,
  section,
  csrfToken,
  fieldErrors,
}: SectionRecapPage) {
  const { sectionTitle, questions, sectionId } = section;
  const lastQuestionIndex = questions.length - 1;
  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Section summary - Apply for a grant`}
      />

      <Layout
        backBtnUrl={routes.submissions.question(
          submissionId,
          sectionId,
          questions[lastQuestionIndex].questionId
        )}
      >
        {fieldErrors.length > 0 && <ErrorBanner fieldErrors={fieldErrors} />}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1
              className="govuk-heading-l"
              id="main-content-focus"
              tabIndex={-1}
              data-cy="cy-manage-section-header"
            >
              Summary of {sectionTitle}
            </h1>
            <dl className="govuk-summary-list">
              {questions.map(
                (
                  {
                    responseType,
                    questionId,
                    fieldTitle,
                    multiResponse,
                    response,
                    validation,
                  }: QuestionType,
                  index: number
                ) => {
                  return (
                    <div className="govuk-summary-list__row" key={index}>
                      <dt
                        className="govuk-summary-list__key"
                        data-cy={`cy-section-details-${questionId}`}
                      >
                        {!validation.mandatory &&
                        !fieldTitle.endsWith(' (optional)')
                          ? `${fieldTitle} (optional)`
                          : fieldTitle}
                      </dt>
                      {multiResponse ? (
                        <ProcessMultiResponse
                          data={multiResponse}
                          id={questionId}
                          cyTag={questionId}
                          questionType={responseType}
                        />
                      ) : (
                        <dd
                          className="govuk-summary-list__value"
                          id={response}
                          data-cy={`cy-section-value-${response}`}
                        >
                          {response ? response : '-'}
                        </dd>
                      )}
                      <dd className="govuk-summary-list__actions">
                        <Link
                          href={routes.submissions.question(
                            submissionId,
                            sectionId,
                            questionId
                          )}
                        >
                          <a
                            className="govuk-link govuk-link--no-visited-state"
                            data-cy={`cy-section-details-navigation-${questionId}`}
                          >
                            {response || multiResponse ? 'Change' : 'Add'}
                            <span className="govuk-visually-hidden">
                              {questionId.replaceAll('_', ' ')}
                            </span>
                          </a>
                        </Link>
                      </dd>
                    </div>
                  );
                }
              )}
            </dl>

            <form
              action={
                publicRuntimeConfig.subPath +
                routes.submissions.section(submissionId, sectionId)
              }
              method="POST"
            >
              <Radio
                questionTitle="Have you completed this section?"
                fieldName="isComplete"
                radioOptions={[
                  {
                    label: "Yes, I've completed this section",
                    value: 'true',
                  },
                  { label: "No, I'll come back later", value: 'false' },
                ]}
                fieldErrors={fieldErrors}
                TitleTag="h2"
              />
              <input type="hidden" name="_csrf" value={csrfToken} />

              <div className="govuk-button-group">
                <button
                  className="govuk-button"
                  data-module="govuk-button"
                  data-cy="cy-submit-application-button"
                >
                  Save and continue
                </button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </>
  );
}
