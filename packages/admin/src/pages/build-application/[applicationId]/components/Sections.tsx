import { Table } from 'gap-web-ui';
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
}

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

        return (
          <React.Fragment key={section.sectionId}>
            {sectionIndex >= 1 && (
              <hr className="govuk-section-break govuk-!-margin-top-2" />
            )}

            <div className={`${styles['table']}`}>
              <Table
                caption={
                  sectionIndex >= 2 && applicationStatus != 'PUBLISHED' ? (
                    <div className="govuk-width-container">
                      <div className="govuk-grid-row">
                        <div className="govuk-grid-column-one-half">
                          {sectionIndex + 1}. {section.sectionTitle}
                        </div>
                        <div className="govuk-grid-column-one-half">
                          <p className="govuk-!-text-align-right govuk-!-font-size-19 govuk-!-margin-0">
                            <CustomLink
                              href={`/build-application/${applicationId}/${section.sectionId}`}
                            >
                              Edit section
                            </CustomLink>
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    `${sectionIndex + 1}. ${section.sectionTitle}`
                  )
                }
                captionClassName={`${styles['caption']} govuk-!-padding-4`}
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
          customStyle="govuk-!-margin-top-4"
        >
          Add a new section
        </CustomLink>
      )}
    </>
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
            { content: question.fieldTitle },
            {
              content: isSectionEligibilityOrEssential ? (
                <strong className="govuk-tag">{section.sectionStatus}</strong>
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
                    {applicationStatus !== 'PUBLISHED' &&
                    !isSectionEligibilityOrEssential
                      ? 'Edit'
                      : 'View'}
                  </CustomLink>
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
              <strong className="govuk-tag">{section.sectionStatus}</strong>
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

  return tableRows;
}

export default Sections;
