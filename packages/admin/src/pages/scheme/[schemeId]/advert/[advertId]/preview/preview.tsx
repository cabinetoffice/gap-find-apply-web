import { AxiosError } from 'axios';
import { GetServerSidePropsContext } from 'next';
import CustomLink from '../../../../../../components/custom-link/CustomLink';
import Meta from '../../../../../../components/layout/Meta';
import { getAdvertPreviewPageContent } from '../../../../../../services/AdvertPageService';
import CustomError from '../../../../../../types/CustomError';
import InferProps from '../../../../../../types/InferProps';
import { generateErrorPageRedirectV2 } from '../../../../../../utils/serviceErrorHelpers';
import { getSessionIdFromCookies } from '../../../../../../utils/session';
import { PreviewDetailsHeader } from './components/PreviewDetailsHeader';
import { PreviewDetailsTab } from './components/PreviewDetailsTab';

export const getServerSideProps = async ({
  req,
  params,
}: GetServerSidePropsContext) => {
  const { schemeId, advertId } = params as Record<string, string>;
  const sessionCookie = getSessionIdFromCookies(req);

  try {
    const grant = await getAdvertPreviewPageContent(sessionCookie, advertId);
    return {
      props: {
        grant,
        advertId,
        schemeId,
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

const AdvertPreview = ({
  grant,
  schemeId,
  advertId,
}: InferProps<typeof getServerSideProps>) => {
  const {
    grantName,
    grantShortDescription,
    grantApplicationCloseDate,
    grantApplicationOpenDate,
    tabs,
  } = grant;
  return (
    <>
      <Meta title={`${grantName} preview - Manage a grant`} />

      <CustomLink
        href={`/scheme/${schemeId}/advert/${advertId}/section-overview`}
        isBackButton
        dataCy="cy-back-button"
      />

      <div className="govuk-grid-row govuk-body">
        <PreviewDetailsHeader
          grantName={grantName}
          grantShortDescription={grantShortDescription}
          grantApplicationCloseDate={grantApplicationCloseDate}
          grantApplicationOpenDate={grantApplicationOpenDate}
        />
        <PreviewDetailsTab tabs={tabs} />
        <div className="govuk-grid-column-full govuk-button-group">
          <CustomLink
            href={`/scheme/${schemeId}/advert/${advertId}/section-overview`}
            isButton
            dataCy="cy-back-to-create-advert-button"
          >
            Back to create your advert
          </CustomLink>
        </div>
      </div>
    </>
  );
};

export default AdvertPreview;
