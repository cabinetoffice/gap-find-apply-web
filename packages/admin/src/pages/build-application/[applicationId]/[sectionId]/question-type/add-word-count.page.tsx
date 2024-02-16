import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { getSessionIdFromCookies } from '../../../../../utils/session';
import { getApplicationFormSummary } from '../../../../../services/ApplicationService';
import QuestionPageGetServerSideProps from '../../../../../utils/QuestionPageGetServerSideProps';
import Meta from '../../../../../components/layout/Meta';
import CustomLink from '../../../../../components/custom-link/CustomLink';
import { Button, FlexibleQuestionPageLayout, TextInput } from 'gap-web-ui';
import { ApplicationFormSection } from '../../../../../types/ApplicationForm';
import {
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
  const { questionId } = context.query;
  const sessionCookie = getSessionIdFromCookies(context.req);

  async function fetchPageData() {
    const applicationFormSummary = await getApplicationFormSummary(
      applicationId,
      sessionCookie
    );

    const { sectionTitle } = applicationFormSummary.sections.find(
      (section) => section.sectionId === sectionId
    ) as ApplicationFormSection;

    return {
      backButtonHref: `/build-application/${applicationId}/${sectionId}/question-type`,
      sectionTitle,
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
      const response = await patchQuestion(
        sessionCookie,
        applicationId,
        sectionId,
        questionId.toString(),
        bodyToPatch
      );
      // const editQueryString = query.backTo
      //   ? `?${new URLSearchParams({ backTo: query.backTo.toString() })}`
      //   : '';
      // return {
      //   data: `/build-application/${applicationId}/${sectionId}/${body.questionId}/edit/question-content${editQueryString}`,
      // };
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

  return QuestionPageGetServerSideProps({
    context,
    fetchPageData,
    onSuccessRedirectHref: `/build-application/${applicationId}/${sectionId}`,
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
  pageData: { sectionTitle, backButtonHref },
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
                defaultValue={(previousValues?.maxWords as string) || ''}
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
