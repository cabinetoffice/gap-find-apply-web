import Meta from '../../../components/layout/Meta';
import styles from './preview.module.scss';
import CustomLink from '../../../components/custom-link/CustomLink';
import { getApplicationFormSummary } from '../../../services/ApplicationService';
import { getSessionIdFromCookies } from '../../../utils/session';
import { getGrantScheme } from '../../../services/SchemeService';
import InferProps from '../../../types/InferProps';
import { GetServerSidePropsContext } from 'next';
import { generateErrorPageRedirectV2 } from '../../../utils/serviceErrorHelpers';
import CustomError from '../../../types/CustomError';
import { AxiosError } from 'axios';
import { ImportantBanner } from 'gap-web-ui';
import { mapV2Sections } from '../../../utils/applicationSummaryHelper';
import { logger } from '../../../utils/logger';

export const getServerSideProps = async ({
  req,
  params,
}: GetServerSidePropsContext) => {
  const applicationId = params!.applicationId as string;
  try {
    const { sections, grantSchemeId, applicationName } =
      await getApplicationFormSummary(
        applicationId,
        getSessionIdFromCookies(req)
      );

    const { contactEmail, version } = await getGrantScheme(
      grantSchemeId,
      getSessionIdFromCookies(req)
    );

    let v2SchemeMappedSections: ReturnType<typeof mapV2Sections>;

    if (version !== '1') {
      v2SchemeMappedSections = mapV2Sections(sections);
    }

    return {
      props: {
        sections: v2SchemeMappedSections ?? sections,
        contactEmail: contactEmail ?? null,
        applicationId,
        applicationName,
        v2Scheme: version !== '1',
      },
    };
  } catch (err: unknown) {
    logger.error(
      'Error rendering application preview',
      logger.utils.addErrorInfo(err, req)
    );
    const error = err as AxiosError;
    const errorMessageObject = error.response?.data as CustomError;

    return generateErrorPageRedirectV2(
      errorMessageObject.code,
      `/build-application/${applicationId}/dashboard`
    );
  }
};

export default function ApplicationPreview({
  sections,
  applicationName,
  applicationId,
  contactEmail,
  v2Scheme,
}: InferProps<typeof getServerSideProps>) {
  const backButtonHref = `/build-application/${applicationId}/dashboard`;

  return (
    <>
      <Meta title="Build Application - Preview Application Sections" />
      <CustomLink href={backButtonHref} isBackButton />

      <div className="govuk-grid-row govuk-!-padding-top-7">
        <div className="govuk-grid-column-two-thirds govuk-!-margin-bottom-6">
          <ImportantBanner bannerHeading="This is a preview of your application form. You cannot enter any answers." />
          <span className="govuk-caption-l">Previewing {applicationName}</span>
          <h1 className="govuk-heading-l" data-cy="cy-application-header">
            Your Application
          </h1>
          <p className="govuk-body" data-cy="cy-application-help-text">
            How the application form works
          </p>
          <ul className="govuk-list govuk-list--bullet">
            <li data-cy="cy-application-help-text-bullet-1">
              you must complete each section of the application form
            </li>
            <li data-cy="cy-application-help-text-bullet-2">
              once all sections are complete you can submit your application
            </li>
            <li data-cy="cy-application-help-text-bullet-3">
              you can save your application and come back to it later
            </li>
          </ul>
          <CustomLink
            href={`/build-application/${applicationId}/section-overview`}
            customStyle="govuk-body govuk-link govuk-link--no-visited-state "
            data-testid="section-summary-link"
          >
            See an overview of the questions you will be asked
          </CustomLink>
          <div className="govuk-!-padding-bottom-5" />
          <dl className="govuk-summary-list">
            {sections.map((section, index) => (
              <SectionInformation
                key={index}
                {...section}
                currentIndex={index}
                questionId={section.questions.find(() => true)?.questionId}
                applicationId={applicationId}
                v2Scheme={v2Scheme}
              />
            ))}
          </dl>
          <div className="govuk-button-group">
            <CustomLink isButton ariaLabel="Exit preview" href={backButtonHref}>
              Exit preview
            </CustomLink>
          </div>
        </div>
        {contactEmail && (
          <div className="govuk-grid-column-one-third ">
            <hr
              className={`govuk-section-break govuk-section-break--m govuk-section-break--visible ${styles.breakLine}`}
            />
            <h2 className="govuk-heading-m">Help and support</h2>
            <p className="govuk-body">
              If you have a question about this grant, contact:
            </p>
            <p className="govuk-body">
              <a href={`mailto:${contactEmail}`} className={styles.wrapper}>
                {contactEmail}
              </a>
            </p>
          </div>
        )}
      </div>
    </>
  );
}

type SectionInformationProps = {
  sectionId: string;
  sectionTitle: string;
  applicationId: string;
  questionId?: string;
  currentIndex: number;
  v2Scheme: boolean;
};

const getPreviewSectionUrl = (
  applicationId: string,
  sectionId: string,
  questionId: string,
  v2Scheme: boolean
) =>
  `/build-application/${applicationId}/${sectionId}/${questionId}/unpublished-preview${
    v2Scheme ? '?v2=true' : ''
  }`;

const SectionInformation = ({
  sectionId,
  sectionTitle,
  applicationId,
  questionId,
  currentIndex,
  v2Scheme,
}: SectionInformationProps) => (
  <div
    data-testid="section-information"
    className="govuk-summary-list__row"
    key={currentIndex}
  >
    <dt className="govuk-summary-list__key">
      {questionId ? (
        <CustomLink
          dataTestId="section-link"
          href={getPreviewSectionUrl(
            applicationId,
            sectionId,
            questionId,
            v2Scheme
          )}
          customStyle="govuk-link govuk-link--no-visited-state govuk-!-font-weight-regular"
        >
          {sectionTitle}
        </CustomLink>
      ) : (
        <span className="govuk-body govuk-!-font-weight-regular">
          {sectionTitle}
        </span>
      )}
    </dt>
    <dt className="govuk-!-text-align-right">
      <strong className={`govuk-tag govuk-tag--grey`}>Not Started</strong>
    </dt>
  </div>
);
