import { GetServerSidePropsContext } from 'next';
import { getSessionIdFromCookies } from '../../../../../utils/session';
import { getApplicationFormSummary } from '../../../../../services/ApplicationService';
import QuestionPageGetServerSideProps from '../../../../../utils/QuestionPageGetServerSideProps';
import Meta from '../../../../../components/layout/Meta';
import CustomLink from '../../../../../components/custom-link/CustomLink';
import { Button, FlexibleQuestionPageLayout, TextInput } from 'gap-web-ui';
import { ApplicationFormSection } from '../../../../../types/ApplicationForm';
import {
  getQuestion,
  patchQuestion,
  postQuestion,
} from '../../../../../services/QuestionService';
import { getSummaryFromSession } from '../../../../../services/SessionService';
import { QuestionWithOptionsSummary } from '../../../../../types/QuestionSummary';
import ResponseTypeEnum from '../../../../../enums/ResponseType';
import InferProps from '../../../../../types/InferProps';

type RequestBody = {
  maxWords: string;
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { applicationId, sectionId } = context.params as Record<string, string>;
  const { questionId, backTo } = context.query;
  const sessionCookie = getSessionIdFromCookies(context.req);

  async function fetchPageData() {
    const applicationFormSummary = await getApplicationFormSummary(
      applicationId,
      sessionCookie
    );

    const { sectionTitle } = applicationFormSummary.sections.find(
      (section) => section.sectionId === sectionId
    ) as ApplicationFormSection;

    const queryString =
      Object.keys(context.query).length > 0
        ? '?' + new URLSearchParams(context.query as Record<string, string>)
        : '';

    let maxWords = '';
    if (questionId) {
      const questionData = await getQuestion(
        sessionCookie,
        applicationId,
        sectionId,
        questionId.toString()
      );
      if (questionData.validation.maxWords) {
        maxWords = questionData.validation.maxWords;
      }
    }

    return {
      backButtonHref: `/build-application/${applicationId}/${sectionId}/question-type${queryString}`,
      sectionTitle,
      maxWords,
    };
  }

  async function handleRequest(body: RequestBody, jwt: string) {
    if (questionId) {
      const questionSummary = (await getSummaryFromSession(
        'updatedQuestion',
        sessionCookie
      )) as unknown as QuestionWithOptionsSummary;
      const { optional, ...restOfQuestionSummary } = questionSummary;
      const { maxWords: _, ...restOfBody } = body;
      const bodyToPatch = {
        ...restOfQuestionSummary,
        ...restOfBody,
        validation: {
          maxWords: body.maxWords,
          mandatory: optional !== 'true',
        },
      };
      await patchQuestion(
        sessionCookie,
        applicationId,
        sectionId,
        questionId.toString(),
        bodyToPatch
      );
    } else {
      const questionSummary = (await getSummaryFromSession(
        'newQuestion',
        sessionCookie
      )) as unknown as QuestionWithOptionsSummary;

      const { optional, ...restOfQuestionSummary } = questionSummary;
      const { maxWords: _, ...restOfBody } = body;

      await postQuestion(jwt, applicationId, sectionId, {
        ...restOfQuestionSummary,
        ...restOfBody,
        responseType: ResponseTypeEnum.LongAnswer,
        validation: {
          maxWords: body.maxWords,
          mandatory: optional !== 'true',
        },
      });
    }
  }

  let onSuccessRedirectHref = `/build-application/${applicationId}/${sectionId}`;
  if (questionId) {
    const queryString = backTo
      ? `?${new URLSearchParams({ backTo: backTo.toString() })}`
      : '';
    onSuccessRedirectHref = `/build-application/${applicationId}/${sectionId}/${questionId}/edit/question-content${queryString}`;
  }

  return await QuestionPageGetServerSideProps({
    context,
    fetchPageData,
    onSuccessRedirectHref,
    jwt: sessionCookie,
    onErrorMessage: 'Something went wrong while trying to load this page.',
    handleRequest,
    isEdit: !!questionId,
  });
};

export default function AddWordCount({
  fieldErrors,
  formAction,
  previousValues,
  pageData: { sectionTitle, backButtonHref, maxWords },
  csrfToken,
}: InferProps<typeof getServerSideProps>) {
  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Add a question - Manage a grant`}
      />

      <CustomLink href={backButtonHref} isBackButton />

      <div className="govuk-!-padding-top-7">
        <FlexibleQuestionPageLayout
          formAction={formAction}
          fieldErrors={fieldErrors}
          pageCaption={sectionTitle}
          csrfToken={csrfToken}
        >
          <div className="govuk-grid-column-full">
            <div className="govuk-grid-row">
              <TextInput
                fieldName="maxWords"
                questionTitle="Limit response length"
                titleSize="xl"
                TitleTag="h1"
                textInputSubtype="numeric"
                fieldSuffix="words"
                questionHintText="This will set the maximum number of words an applicant can use to answer this question. You can choose a limit of up to 5000 words."
                width="4"
                fieldErrors={fieldErrors}
                defaultValue={
                  (previousValues?.maxWords as string) || maxWords || ''
                }
              />
            </div>
            <div className="govuk-grid-row govuk-button-group">
              <Button text="Save and continue" />
            </div>
          </div>
        </FlexibleQuestionPageLayout>
      </div>
    </>
  );
}
