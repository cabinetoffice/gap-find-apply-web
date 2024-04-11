import { AxiosError } from 'axios';
import { GetServerSidePropsContext } from 'next';
import CustomLink from '../../../../../../components/custom-link/CustomLink';
import Meta from '../../../../../../components/layout/Meta';
import { getSummaryPageContent } from '../../../../../../services/AdvertPageService';
import CustomError from '../../../../../../types/CustomError';
import InferProps from '../../../../../../types/InferProps';
import { generateErrorPageRedirectV2 } from '../../../../../../utils/serviceErrorHelpers';
import { getSessionIdFromCookies } from '../../../../../../utils/session';
import PreviewSearchResultCard from './components/PreviewSearchResultCard';
import Link from 'next/link';

export const getServerSideProps = async ({
  req,
  params,
}: GetServerSidePropsContext) => {
  const { schemeId, advertId } = params as Record<string, string>;
  const sessionCookie = getSessionIdFromCookies(req);
  const findSearchUrl = process.env.FIND_A_GRANT_URL + '/grants';

  try {
    const grantSummary = await getSummaryPageContent(
      sessionCookie,
      schemeId,
      advertId
    );

    const grantPreview = {
      grantName: grantSummary.advertName || '',
      grantShortDescription:
        grantSummary.sections[0].pages[0].questions[0]?.response || '',
      grantLocation:
        grantSummary.sections[0].pages[1].questions[0]?.multiResponse || [],
      grantFundingOrganisation:
        grantSummary.sections[0].pages[2].questions[0]?.response || '',
      grantApplicantType:
        grantSummary.sections[0].pages[3].questions[0]?.multiResponse || [],
      grantTotalAwardAmount:
        grantSummary.sections[1].pages[0].questions[0]?.response || '',
      grantMaximumAward:
        grantSummary.sections[1].pages[0].questions[1]?.response || '',
      grantMinimumAward:
        grantSummary.sections[1].pages[0].questions[2]?.response || '',
      grantApplicationOpenDate:
        grantSummary.sections[2].pages[0].questions[0]?.multiResponse || [],
      grantApplicationCloseDate:
        grantSummary.sections[2].pages[0].questions[1]?.multiResponse || [],
    };

    return {
      props: {
        grant: grantPreview,
        advertId,
        schemeId,
        findSearchUrl,
      },
    };
  } catch (err) {
    const error = err as AxiosError;
    const errorMessageObject = error.response?.data as CustomError;
    return generateErrorPageRedirectV2(
      errorMessageObject.code,
      `/scheme/${schemeId}/advert/${advertId}/section-overview`
    );
  }
};

const SearchResultPreview = ({
  grant,
  schemeId,
  advertId,
  findSearchUrl,
}: InferProps<typeof getServerSideProps>) => {
  return (
    <>
      <Meta title={`${grant.grantName} preview - Manage a grant`} />

      <CustomLink
        href={`/scheme/${schemeId}/advert/${advertId}/section-overview`}
        isBackButton
        dataCy="cy-back-button"
      />

      <div className="govuk-grid-row govuk-body">
        <div className="govuk-grid-column-full">
          <span className="govuk-caption-l" data-cy="cy-preview-page-caption">
            How your advert looks to applicants
          </span>

          <h1 className="govuk-heading-l" data-cy="cy-preview-page-header">
            Search results page
          </h1>

          <div
            data-cy="cy-preview-page-inset-text"
            className="govuk-inset-text"
            data-testid="previewDetails"
          >
            <p>
              This is how your advert will look on the{' '}
              <Link
                className="govuk-link"
                href={findSearchUrl}
                data-testid="searchPageLink"
              >
                search results page
              </Link>
              . It will be in a list alongside other grant adverts.
            </p>
            <p>
              The preview below shows all the information you have entered so
              far.
            </p>
          </div>
        </div>

        <PreviewSearchResultCard grant={grant} />

        <div className="govuk-grid-column-full govuk-button-group">
          <CustomLink
            href={`/scheme/${schemeId}/advert/${advertId}/preview/advert-details`}
            isButton
            dataCy="cy-back-to-create-advert-button"
          >
            Continue
          </CustomLink>
        </div>
      </div>
    </>
  );
};

export default SearchResultPreview;
