import InferProps from '../../../../types/InferProps';
import Meta from '../../../../components/layout/Meta';
import CustomLink from '../../../../components/custom-link/CustomLink';
import { FlexibleQuestionPageLayout, SummaryList, Table } from 'gap-web-ui';
import { ResponseTypeLabels } from '../../../../enums/ResponseType';
import { useLayoutEffect, useRef, useState } from 'react';
import QuestionRowActionComponent from './index/QuestionRowActionComponent';
import getServerSideProps from './index/getServerSideProps';

export { getServerSideProps };

const EditSectionPage = ({
  section,
  grantApplicationName,
  applicationId,
  version,
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

  useLayoutEffect(() => {
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
        <input type="hidden" name="version" value={version} />
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
        href={`/build-application/${applicationId}/${section.sectionId}/delete-confirmation?version=${version}`}
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
          <QuestionRowActionComponent
            section={section}
            questions={questions}
            question={question}
            questionIndex={questionIndex}
            applicationId={applicationId}
            handleOnUpDownButtonClick={handleOnUpDownButtonClick}
          />
        ),
      },
    ],
  }));
}

export default EditSectionPage;
