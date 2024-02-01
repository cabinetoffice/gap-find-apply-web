import { FlexibleQuestionPageLayout, Table } from 'gap-web-ui';
import React from 'react';
import CustomLink from '../../../../components/custom-link/CustomLink';
import { ResponseTypeLabels } from '../../../../enums/ResponseType';
import {
  ApplicationFormSection,
  ApplicationFormSummary,
} from '../../../../types/ApplicationForm';
import styles from './Sections.module.scss';

interface SectionsProps {
  sections: ApplicationFormSection[];
  applicationId: string;
  applicationStatus: ApplicationFormSummary['applicationStatus'];
  resolvedUrl: string;
  csrfToken: string;
}

const Sections = ({
  sections,
  applicationId,
  applicationStatus,
  resolvedUrl,
  csrfToken,
}: SectionsProps) => {
  return (
    <FlexibleQuestionPageLayout
      formAction={resolvedUrl}
      fieldErrors={[]}
      csrfToken={csrfToken}
      fullPageWidth={true}
    >
      {sections.map((section, sectionIndex) => {
        const isSectionEligibilityOrEssential =
          section.sectionId === 'ELIGIBILITY' ||
          section.sectionId === 'ESSENTIAL';

        return (
          <React.Fragment key={section.sectionId}>
            {sectionIndex >= 1 && (
              <hr className="govuk-section-break govuk-!-margin-top-2" />
            )}

            <div className={`${styles['table']}`}>
              <Table
                caption={
                  sectionIndex >= 2 && applicationStatus != 'PUBLISHED' ? (
                    <div className="govuk-grid-row govuk-!-padding-top-5 govuk-!-padding-bottom-3 govuk-!-padding-left-3 govuk-!-padding-right-3">
                      <div className="govuk-grid-column-one-third">
                        {sectionIndex + 1}. {section.sectionTitle}
                      </div>

                      <div className="govuk-grid-column-two-thirds govuk-!-text-align-right">
                        <button
                          className={`govuk-button govuk-!-margin-right-2 govuk-!-margin-bottom-0 ${styles['b']}`}
                          data-module="govuk-button"
                          data-cy="cyUpButton"
                          name={`Up/${section.sectionId}`}
                          disabled={sectionIndex === 2}
                        >
                          Up
                        </button>
                        <button
                          className={`govuk-button govuk-!-margin-right-2 govuk-!-margin-bottom-0 ${styles['b']}`}
                          data-module="govuk-button"
                          data-cy="cyDownButton"
                          name={`Down/${section.sectionId}`}
                          disabled={sectionIndex === sections.length - 1}
                        >
                          Down
                        </button>

                        <i className={styles['separator']} />

                        <CustomLink
                          href={`/build-application/${applicationId}/${section.sectionId}`}
                        >
                          Edit section
                        </CustomLink>
                      </div>
                    </div>
                  ) : (
                    <div className="govuk-grid-row govuk-!-padding-top-5 govuk-!-padding-bottom-3 govuk-!-padding-left-3 govuk-!-padding-right-3">
                      <div className="govuk-grid-column-two-thirds">
                        {sectionIndex + 1}. {section.sectionTitle}
                      </div>
                    </div>
                  )
                }
                captionClassName={styles['caption']}
                disableBottomRowBorder
                tHeadColumns={[
                  {
                    name: 'Question title',
                    isVisuallyHidden: true,
                    width: 'one-half',
                  },
                  {
                    name: isSectionEligibilityOrEssential
                      ? 'Section status'
                      : 'Response type',
                    isVisuallyHidden: true,
                    width: 'one-quarter',
                  },
                  {
                    name: 'Action',
                    isVisuallyHidden: true,
                    width: 'one-quarter',
                  },
                ]}
                rows={tableRows(
                  section,
                  applicationId,
                  applicationStatus,
                  isSectionEligibilityOrEssential
                )}
              />
            </div>
          </React.Fragment>
        );
      })}

      {applicationStatus !== 'PUBLISHED' && (
        <CustomLink
          href={`/build-application/${applicationId}/section-name`}
          isSecondaryButton
          dataCy={'cy-button-addNewSection'}
        >
          Add a new section
        </CustomLink>
      )}
    </FlexibleQuestionPageLayout>
  );
};

function tableRows(
  section: ApplicationFormSection,
  applicationId: string,
  applicationStatus: ApplicationFormSummary['applicationStatus'],
  isSectionEligibilityOrEssential: boolean
) {
  let tableRows = section.questions
    ? section.questions.map((question) => {
        let link = `/build-application/${applicationId}/${section.sectionId}/${question.questionId}/preview`;
        // Eligibility is handled differently, so we explicitly direct to the eligibility-statement page here
        if (section.sectionId === 'ELIGIBILITY') {
          link = `/build-application/${applicationId}/${section.sectionId}/${question.questionId}/eligibility-statement`;
        }
        return {
          cells: [
            {
              content: (
                <div className="govuk-!-font-weight-bold">
                  {question.fieldTitle}
                </div>
              ),
              className: 'govuk-!-padding-3',
            },
            {
              content: isSectionEligibilityOrEssential ? (
                <strong className="govuk-tag">{section.sectionStatus}</strong>
              ) : (
                ResponseTypeLabels[question.responseType]
              ),
              className: 'govuk-!-padding-3',
            },
            {
              content: (
                <div className="govuk-!-text-align-right">
                  <CustomLink
                    href={link}
                    ariaLabel={
                      applicationStatus !== 'PUBLISHED'
                        ? `View or change question "${question.fieldTitle}"`
                        : `View question "${question.fieldTitle}"`
                    }
                    dataCy={`cy_Section-${question.fieldTitle}`}
                  >
                    {applicationStatus !== 'PUBLISHED' &&
                    !isSectionEligibilityOrEssential
                      ? 'Edit'
                      : 'View'}
                  </CustomLink>
                </div>
              ),
              className: 'govuk-!-padding-3',
            },
          ],
        };
      })
    : [];

  if (section.sectionId === 'ESSENTIAL') {
    tableRows = [
      {
        cells: [
          {
            content: (
              <div className="govuk-!-font-weight-bold">
                Due-diligence checks
              </div>
            ),
            className: 'govuk-!-padding-3',
          },
          {
            content: (
              <strong className="govuk-tag">{section.sectionStatus}</strong>
            ),
            className: 'govuk-!-padding-3',
          },
          {
            content: (
              <div className="govuk-!-text-align-right">
                <CustomLink
                  href={`/build-application/${applicationId}/${section.sectionId}/due-diligence`}
                  ariaLabel='View question "Due-diligence checks"'
                  dataCy="cy_Section-due-diligence-checks"
                >
                  View
                </CustomLink>
              </div>
            ),
            className: 'govuk-!-padding-3',
          },
        ],
      },
    ];
  }

  return tableRows;
}

export default Sections;
