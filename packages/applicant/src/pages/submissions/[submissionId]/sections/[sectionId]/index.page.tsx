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
import { GrantMandatoryQuestionService } from '../../../../../services/GrantMandatoryQuestionService';

const { publicRuntimeConfig } = getConfig();

export interface SectionRecapPage {
  submissionId: string;
  section: SectionData;
  mandatoryQuestionId: string;
  csrfToken: string;
  fieldErrors: ValidationError[];
}

export const getQuestionUrl = (
  sectionId: string,
  questionId: string,
  mandatoryQuestionId: string,
  submissionId: string
) => {
  const queryParam = `?fromSubmissionPage=true&submissionId=${submissionId}&sectionId=${sectionId}`;
  if (sectionId === 'ORGANISATION_DETAILS') {
    switch (questionId) {
      case 'APPLICANT_ORG_NAME': {
        return (
          routes.mandatoryQuestions.namePage(mandatoryQuestionId) + queryParam
        );
      }
      case 'APPLICANT_ORG_ADDRESS': {
        return (
          routes.mandatoryQuestions.addressPage(mandatoryQuestionId) +
          queryParam
        );
      }
      case 'APPLICANT_TYPE': {
        return (
          routes.mandatoryQuestions.typePage(mandatoryQuestionId) + queryParam
        );
      }
      case 'APPLICANT_ORG_COMPANIES_HOUSE': {
        return (
          routes.mandatoryQuestions.companiesHouseNumberPage(
            mandatoryQuestionId
          ) + queryParam
        );
      }
      case 'APPLICANT_ORG_CHARITY_NUMBER': {
        return (
          routes.mandatoryQuestions.charityCommissionNumberPage(
            mandatoryQuestionId
          ) + queryParam
        );
      }
    }
  } else if (sectionId === 'FUNDING_DETAILS') {
    switch (questionId) {
      case 'APPLICANT_AMOUNT': {
        return (
          routes.mandatoryQuestions.fundingAmountPage(mandatoryQuestionId) +
          queryParam
        );
      }
      case 'BENEFITIARY_LOCATION': {
        return (
          routes.mandatoryQuestions.fundingLocationPage(mandatoryQuestionId) +
          queryParam
        );
      }
    }
  } else {
    return routes.submissions.question(submissionId, sectionId, questionId);
  }
};

export const getServerSideProps: GetServerSideProps<SectionRecapPage> = async ({
  req,
  res,
  params,
}) => {
  const submissionId = params.submissionId.toString();
  const sectionId = params.sectionId.toString();
  const jwt = getJwtFromCookies(req);

  const isOrganisationDetailsOrFunding =
    sectionId === 'ORGANISATION_DETAILS' || sectionId === 'FUNDING_DETAILS';
  let mandatoryQuestionId;
  if (isOrganisationDetailsOrFunding) {
    const mandatoryQuestionService =
      GrantMandatoryQuestionService.getInstance();
    const mandatoryQuestionDto =
      await mandatoryQuestionService.getMandatoryQuestionBySubmissionId(
        submissionId,
        jwt
      );
    mandatoryQuestionId = mandatoryQuestionDto.id;
  }

  const section = await getSectionById(submissionId, sectionId, jwt);

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
      mandatoryQuestionId,
      csrfToken: (req as any).csrfToken?.() || '',
      fieldErrors,
    },
  };
};

export default function SectionRecap({
  submissionId,
  section,
  mandatoryQuestionId,
  csrfToken,
  fieldErrors,
}: SectionRecapPage) {
  const { sectionTitle, questions, sectionId } = section;
  const lastQuestionIndex = questions.length - 1;

  function sectionSummary(sectionId: string) {
    let sectionSummary = null;
    if (sectionId === 'Your Organisation' || sectionId === 'Funding') {
      sectionSummary = (
        <div className="govuk-body">
          <p className="govuk-body">
            This information has been taken from the answers you provided
            earlier. You can change anything you need to.
            {sectionId === 'Your Organisation' && (
              <> Any changes you make will be saved to your profile.</>
            )}
          </p>
          <p className="govuk-body">
            When you are finished, you can mark this section as
            &apos;completed&apos;.
          </p>
          <p className="govuk-body govuk-!-padding-bottom-4">
            You will still be able to come back and change this section until
            you submit the whole application form.
          </p>
        </div>
      );
    }
    return sectionSummary;
  }

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
              {sectionTitle === 'Your Organisation' ||
              sectionTitle === 'Funding'
                ? sectionTitle
                : `Summary of ${sectionTitle}`}
            </h1>

            {sectionSummary(sectionTitle)}

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
                          href={getQuestionUrl(
                            sectionId,
                            questionId,
                            mandatoryQuestionId,
                            submissionId
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
