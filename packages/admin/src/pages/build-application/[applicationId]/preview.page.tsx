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

type SectionInformationProps = {
  sectionId: string;
  sectionTitle: string;
  applicationId: string;
  questionId: string;
  currentIndex: number;
};

export const getServerSideProps = async ({
  req,
  params,
}: GetServerSidePropsContext) => {
  try {
    const applicationId = params!.applicationId as string;

    const { sections, grantSchemeId, applicationName } =
      await getApplicationFormSummary(
        applicationId,
        getSessionIdFromCookies(req)
      );

    const { contactEmail } = await getGrantScheme(
      grantSchemeId,
      getSessionIdFromCookies(req)
    );

    return {
      props: {
        sections,
        contactEmail,
        applicationId,
        applicationName,
      },
    };
  } catch (error: unknown) {
    console.log('Error rendering application preview -> ', error);
    const axiosError = error as AxiosError<CustomError>;

    return generateErrorPageRedirectV2(
      axiosError.response?.data.code as string,
      `/build-application/${params!.applicationId as string}/dashboard`
    );
  }
};

const getPreviewSectionUrl = (
  applicationId: string,
  sectionId: string,
  questionId: string
) =>
  `/build-application/${applicationId}/${sectionId}/${questionId}/unpublished-preview`;

const SectionInformation = ({
  sectionId,
  sectionTitle,
  applicationId,
  questionId,
  currentIndex,
}: SectionInformationProps) => (
  <div className="govuk-summary-list__row" key={currentIndex}>
    <dt className="govuk-summary-list__key">
      <CustomLink
        href={getPreviewSectionUrl(applicationId, sectionId, questionId)}
        customStyle="govuk-link govuk-link--no-visited-state govuk-!-font-weight-regular"
      >
        {sectionTitle}
      </CustomLink>
    </dt>
    <dt className="govuk-!-text-align-right">
      <strong className={`govuk-tag govuk-tag--grey`}>Not Started</strong>
    </dt>
  </div>
);

export default function ApplicationPreview({
  sections,
  applicationName,
  applicationId,
  contactEmail,
}: InferProps<typeof getServerSideProps>) {
  const backButtonHref = `/build-application/${applicationId}/dashboard`;

  return (
    <>
      <Meta title="My application - Apply for a grant" />
      <CustomLink href={backButtonHref} isBackButton />

      <div className="govuk-grid-row govuk-!-padding-top-7">
        <div className="govuk-grid-column-two-thirds govuk-!-margin-bottom-6">
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
            href="#" //To be updated with GAP-2479
            customStyle="govuk-body govuk-link govuk-link--no-visited-state "
            data-cy="cy-section-summary-link"
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
                questionId={section.questions![0].questionId}
                applicationId={applicationId}
              />
            ))}
          </dl>
          <div className="govuk-button-group">
            <CustomLink isButton ariaLabel="Exit preview" href={backButtonHref}>
              Exit preview
            </CustomLink>
          </div>
        </div>
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
      </div>
    </>
  );
}
