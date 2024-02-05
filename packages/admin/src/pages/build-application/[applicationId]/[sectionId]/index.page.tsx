import { GetServerSidePropsContext } from 'next';
import {
  getApplicationFormSummary,
  handleQuestionOrdering,
} from '../../../../services/ApplicationService';
import { getSessionIdFromCookies } from '../../../../utils/session';
import InferProps from '../../../../types/InferProps';
import Meta from '../../../../components/layout/Meta';
import CustomLink from '../../../../components/custom-link/CustomLink';
import { FlexibleQuestionPageLayout, SummaryList, Table } from 'gap-web-ui';
import { ResponseTypeLabels } from '../../../../enums/ResponseType';
import ServiceError from '../../../../types/ServiceError';
import styles from './index.module.scss';
import { useEffect, useRef, useState } from 'react';
import callServiceMethod from '../../../../utils/callServiceMethod';
import { generateErrorPageParams } from '../../../../utils/serviceErrorHelpers';

export const getServerSideProps = async ({
  params,
  req,
  res,
  query,
  resolvedUrl,
}: GetServerSidePropsContext) => {
  const { applicationId, sectionId } = params as Record<string, string>;
  const { scrollPosition } = query as Record<string, string>;

  const result = await callServiceMethod(
    req,
    res,
    async (body) => {
      const sessionId = getSessionIdFromCookies(req);
      const params = Object.keys(body)[0].split('/');
      const increment = params[0] === 'Up' ? -1 : 1;
      const questionId = params[1];
      await handleQuestionOrdering(
        sessionId,
        applicationId,
        sectionId,
        questionId,
        increment
      );
    },
    `/build-application/${applicationId}/${sectionId}?scrollPosition=${scrollPosition}`,
    generateErrorPageParams(
      'Something went wrong while trying to update section orders.',
      `/build-application/${applicationId}/dashboard`
    )
  );

  if ('redirect' in result) {
    return result;
  }

  let applicationFormSummary;
  try {
    applicationFormSummary = await getApplicationFormSummary(
      applicationId,
      getSessionIdFromCookies(req)
    );
  } catch (err) {
    return redirectError;
  }

  const section = applicationFormSummary.sections.find(
    (section) => section.sectionId === sectionId
  );

  if (!section) {
    return redirectError;
  }

  return {
    props: {
      section,
      grantApplicationName: applicationFormSummary.applicationName,
      applicationId: applicationFormSummary.grantApplicationId,
      scrollPosition: Number(scrollPosition ?? 0),
      resolvedUrl: process.env.SUB_PATH + resolvedUrl,
      csrfToken: res.getHeader('x-csrf-token') as string,
    },
  };
};

const EditSectionPage = ({
  section,
  grantApplicationName,
  applicationId,
  scrollPosition,
  resolvedUrl,
  csrfToken,
}: InferProps<typeof getServerSideProps>) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [newScrollPosition, setNewScrollPosition] = useState(
    scrollPosition ?? 0
  );
  const formAction =
    resolvedUrl.split('?')[0] + `?scrollPosition=${newScrollPosition}`;

  function handleOnUpDownButtonClick() {
    setNewScrollPosition(window.scrollY);
    formRef?.current?.submit();
  }

  useEffect(() => {
    window.scrollTo({
      top: scrollPosition,
      behavior: 'instant' as ScrollBehavior,
    });
  }, []);

  return (
    <>
      <Meta title="Build an application form - Manage a grant" />

      <CustomLink
        href={`/build-application/${applicationId}/dashboard`}
        isBackButton
      />

      <span
        className="govuk-caption-l govuk-!-margin-top-7"
        data-cy="cyApplicationTitle"
      >
        {grantApplicationName}
      </span>

      <h1 className="govuk-heading-l">Edit this section</h1>

      <SummaryList
        rows={[
          {
            key: 'Section title',
            value: (
              <div className="govuk-!-padding-left-2">
                {section.sectionTitle}
              </div>
            ),
            action: (
              <CustomLink
                href={`/build-application/${applicationId}/${section.sectionId}/edit-title`}
              >
                Edit
              </CustomLink>
            ),
          },
        ]}
      />

      <FlexibleQuestionPageLayout
        formAction={formAction}
        fieldErrors={[]}
        csrfToken={csrfToken}
        fullPageWidth
      >
        <Table
          caption="Questions"
          tHeadColumns={[
            {
              name: 'Question title',
              isVisuallyHidden: true,
            },
            {
              name: 'Question type',
              isVisuallyHidden: true,
            },
            { name: 'Actions', isVisuallyHidden: true },
          ]}
          rows={questionTableRows(
            section,
            applicationId,
            handleOnUpDownButtonClick
          )}
        />
      </FlexibleQuestionPageLayout>

      <CustomLink
        href={`/build-application/${applicationId}/${section.sectionId}/question-content`}
        isSecondaryButton
      >
        Add a new question
      </CustomLink>

      <hr className="govuk-section-break govuk-section-break--xl govuk-section-break--visible" />

      <h2 className="govuk-heading-m">Delete this section</h2>

      <p className="govuk-caption-m">
        Any questions or information in this section will be deleted
        permanently.
      </p>

      <CustomLink
        href={`/build-application/${applicationId}/${section.sectionId}/delete-confirmation`}
        isButton
        customStyle="govuk-button--warning"
      >
        Delete section
      </CustomLink>

      <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />

      <CustomLink
        href={`/build-application/${applicationId}/dashboard`}
        isButton
      >
        Save and go back
      </CustomLink>
    </>
  );
};

function questionTableRows(
  section: InferProps<typeof getServerSideProps>['section'],
  applicationId: InferProps<typeof getServerSideProps>['applicationId'],
  handleOnUpDownButtonClick: () => void
) {
  const questions = section.questions;
  if (!questions) {
    return [];
  }

  return questions.map((question, questionIndex) => ({
    cells: [
      {
        content: (
          <p className="govuk-!-font-weight-bold">{question.fieldTitle}</p>
        ),
        className: 'govuk-!-padding-1',
      },
      {
        content: <p>{ResponseTypeLabels[question.responseType]}</p>,
        className: 'govuk-!-padding-1',
      },
      {
        content: (
          <div className="govuk-!-text-align-right govuk-width-container govuk-!-padding-top-4 govuk-!-padding-right-2">
            <div className="govuk-grid-row">
              <button
                className={`govuk-button govuk-button--secondary govuk-!-margin-right-2 govuk-!-margin-bottom-0 ${styles['button']}`}
                data-module="govuk-button"
                data-cy="cyUpButton"
                name={`Up/${question.questionId}`}
                disabled={questionIndex === 0}
                onClick={handleOnUpDownButtonClick}
                data-testid={`upButton-${questionIndex}`}
                aria-label="Move section up"
              >
                Up
              </button>
              <button
                className={`govuk-button govuk-button--secondary govuk-!-margin-right-2 govuk-!-margin-bottom-0 ${styles['button']}`}
                data-module="govuk-button"
                data-cy="cyDownButton"
                name={`Down/${question.questionId}`}
                disabled={questionIndex === questions.length - 1}
                onClick={handleOnUpDownButtonClick}
                data-testid={`downButton-${questionIndex}`}
                aria-label="Move section down"
              >
                Down
              </button>

              <CustomLink
                href={`/build-application/${applicationId}/${section.sectionId}/${question.questionId}/edit/question-content`}
              >
                Edit
              </CustomLink>
            </div>
          </div>
        ),
      },
    ],
  }));
}

const errorProps: ServiceError = {
  errorInformation: 'Something went wrong while trying to edit a section',
  linkAttributes: {
    href: `/scheme-list`,
    linkText: 'Please find your scheme application form and continue.',
    linkInformation: 'Your previous progress has been saved.',
  },
};

const redirectError = {
  redirect: {
    destination: `/service-error?serviceErrorProps=${JSON.stringify(
      errorProps
    )}`,
    permanent: false,
  },
};

export default EditSectionPage;
