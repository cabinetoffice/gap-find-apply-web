import { Table } from 'gap-web-ui';
import React from 'react';
import CustomLink from '../../../../components/custom-link/CustomLink';
import { ResponseTypeLabels } from '../../../../enums/ResponseType';
import {
  ApplicationFormSection,
  ApplicationFormSummary,
} from '../../../../types/ApplicationForm';
import styles from './Sections.module.scss';

const Sections = ({
  sections,
  applicationId,
  applicationStatus,
}: SectionsProps) => {
  return (
    <>
      {sections.map((section, sectionIndex) => {
        const isSectionEligibilityOrEssential =
          section.sectionId === 'ELIGIBILITY' ||
          section.sectionId === 'ESSENTIAL';

        let tableRows = section.questions
          ? section.questions.map((question) => {
              let link = `/build-application/${applicationId}/${section.sectionId}/${question.questionId}/preview`;
              // Eligibility is handled differently, so we explicitly
              // direct to the eligibility-statement page here
              if (section.sectionId === 'ELIGIBILITY') {
                link = `/build-application/${applicationId}/${section.sectionId}/${question.questionId}/eligibility-statement`;
              }
              return {
                cells: [
                  { content: question.fieldTitle },
                  {
                    content: isSectionEligibilityOrEssential ? (
                      <strong className="govuk-tag">
                        {section.sectionStatus}
                      </strong>
                    ) : (
                      ResponseTypeLabels[question.responseType]
                    ),
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
                          {applicationStatus !== 'PUBLISHED'
                            ? 'View or change'
                            : 'View'}
                        </CustomLink>

                        <hr className="govuk-section-break" />

                        {!isSectionEligibilityOrEssential &&
                          applicationStatus !== 'PUBLISHED' && (
                            <CustomLink
                              href={`/build-application/${applicationId}/${section.sectionId}/${question.questionId}/delete-confirmation`}
                              ariaLabel={`Delete question: ${question.fieldTitle}`}
                              dataCy={`cy_deleteQuestion-Section-${section.sectionTitle}-${question.fieldTitle}`}
                            >
                              Delete
                            </CustomLink>
                          )}
                      </div>
                    ),
                  },
                ],
              };
            })
          : [];

        if (section.sectionId === 'ESSENTIAL') {
          tableRows = [
            {
              cells: [
                { content: 'Due-diligence checks' },
                {
                  content: (
                    <strong className="govuk-tag">
                      {section.sectionStatus}
                    </strong>
                  ),
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
                },
              ],
            },
          ];
        }

        return (
          <React.Fragment key={section.sectionId}>
            {sectionIndex >= 1 && (
              <hr className="govuk-section-break govuk-!-margin-top-9" />
            )}

            <Table
              caption={`${sectionIndex + 1}. ${section.sectionTitle}`}
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
              rows={tableRows}
            />

            {!isSectionEligibilityOrEssential &&
              applicationStatus !== 'PUBLISHED' && (
                <>
                  <div className={styles['sections-cta-margin-bottom']}>
                    <CustomLink
                      href={`/build-application/${applicationId}/${section.sectionId}/question-content`}
                      isSecondaryButton
                      dataCy={`cy_addAQuestion-${section.sectionTitle}`}
                      ariaLabel={`Add a new question to ${section.sectionTitle}`}
                    >
                      Add a question
                    </CustomLink>
                    <CustomLink
                      href={`/build-application/${applicationId}/${section.sectionId}/delete-confirmation`}
                      dataCy={`cy_sections_deleteSectionBtn-${section.sectionTitle}`}
                      ariaLabel={`Delete this section: ${section.sectionTitle}`}
                      customStyle={
                        styles['sections-delete-section-btn-mrg-left']
                      }
                      dataTestId={`sections_deleteSectionBtn`}
                    >
                      Delete this section
                    </CustomLink>
                  </div>

                  <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />
                </>
              )}
          </React.Fragment>
        );
      })}

      {applicationStatus !== 'PUBLISHED' && (
        <CustomLink
          href={`/build-application/${applicationId}/section-name`}
          isSecondaryButton
          dataCy={'cy-button-addNewSection'}
        >
          Add new section
        </CustomLink>
      )}
    </>
  );
};

interface SectionsProps {
  sections: ApplicationFormSection[];
  applicationId: string;
  applicationStatus: ApplicationFormSummary['applicationStatus'];
}

export default Sections;
