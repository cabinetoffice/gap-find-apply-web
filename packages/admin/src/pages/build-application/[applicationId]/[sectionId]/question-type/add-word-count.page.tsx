import { GetServerSideProps } from 'next';
import { getSessionIdFromCookies } from '../../../../../utils/session';
import { getApplicationFormSummary } from '../../../../../services/ApplicationService';
import QuestionPageGetServerSideProps from '../../../../../utils/QuestionPageGetServerSideProps';
import Meta from '../../../../../components/layout/Meta';
import CustomLink from '../../../../../components/custom-link/CustomLink';
import { Button, FlexibleQuestionPageLayout, TextInput } from 'gap-web-ui';
import { ApplicationFormSection } from '../../../../../types/ApplicationForm';
import {
  getQuestion,
  postQuestion,
} from '../../../../../services/QuestionService';
import { getSummaryFromSession } from '../../../../../services/SessionService';
import {
  QuestionSummary,
  QuestionWithOptionsSummary,
} from '../../../../../types/QuestionSummary';
import ResponseTypeEnum from '../../../../../enums/ResponseType';

type RequestBody = {
  fieldTitle: string;
  hintText: string;
  optional: string;
  maxWords?: string;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { applicationId, sectionId } = context.params as Record<string, string>;
  const sessionCookie = getSessionIdFromCookies(context.req);

  const applicationFormSummary = await getApplicationFormSummary(
    applicationId,
    sessionCookie
  );

  const { sectionTitle } = applicationFormSummary.sections.find(
    (section) => section.sectionId === sectionId
  ) as ApplicationFormSection;

  const fetchPageData = async (jwt: string) => {
    return {
      backButtonHref: `/build-application/${applicationId}/${sectionId}/question-type`,
      applicationId,
      sectionTitle,
    };
  };

  async function handleRequest(body: RequestBody, jwt: string) {
    const questionSummary = (await getSummaryFromSession(
      'newQuestion',
      sessionCookie
    )) as QuestionWithOptionsSummary;

    const { optional, ...restOfQuestionSummary } = questionSummary;
    const { maxWords, ...restOfBody } = body;

    await postQuestion(jwt, applicationId, sectionId, {
      ...restOfQuestionSummary,
      ...restOfBody,
      responseType: ResponseTypeEnum.LongAnswer,
      validation: {
        maxWords: Number(body.maxWords),
        mandatory: optional !== 'true',
      },
    });
  }

  return QuestionPageGetServerSideProps({
    context,
    fetchPageData,
    onSuccessRedirectHref: `/build-application/${applicationId}/${sectionId}`,
    jwt: sessionCookie,
    onErrorMessage: 'Something went wrong while trying to load this page.',
    handleRequest,
  });
};

export default function AddWordCount({
  fieldErrors,
  formAction,
  previousValues,
  pageData: { sectionTitle, backButtonHref },
  csrfToken,
}: any) {
  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Add a question - Manage a grant`}
      />

      <CustomLink
        href={backButtonHref}
        dataCy="cy_questionOptionsPage-backButton"
        isBackButton
      />

      <div className="govuk-!-padding-top-7">
        <FlexibleQuestionPageLayout
          formAction={formAction}
          fieldErrors={fieldErrors}
          pageCaption={sectionTitle}
          csrfToken={csrfToken}
        >
          <p className="govuk-body"></p>
          <h1 className="govuk-heading-xl">
            Briefly describe the project you will be carrying out
          </h1>

          <div className="govuk-grid-column-two-thirds">
            <div className="govuk-grid-row">
              <TextInput
                fieldName="maxWords"
                questionTitle="Limit response length"
                titleSize="m"
                TitleTag="h2"
                textInputSubtype="numeric"
                fieldSuffix="words"
                questionHintText="This will set the maximum number of words an applicant can use to answer this question. You can choose a limit of up to 5000 words."
                width="4"
                fieldErrors={fieldErrors}
                defaultValue={previousValues?.maxWords || ''}
              />
            </div>
            <div className="govuk-grid-row govuk-button-group">
              <Button
                text="Save and continue"
                data-cy="cy_questionOptions-SaveAndContinueButton"
              />
            </div>
          </div>
        </FlexibleQuestionPageLayout>
      </div>
    </>
  );
}
