import CustomLink from '../../../components/custom-link/CustomLink';
import { getAdvertPublishInformationBySchemeIdResponse } from '../../../services/AdvertPageService.d';
import Scheme from '../../../types/Scheme';
import getConfig from 'next/config';
import AdvertStatusEnum from '../../../enums/AdvertStatus';
import {
  ValidAdvertData,
  getAdvertLink,
  LastUpdatedBy,
  GrantStatus,
  AdvertData,
} from './BuildAdvertContentHelper';

type PublishedGrantInfoProps = {
  linkToAdvertInFindAGrant: string;
  grantAdvertData: ValidAdvertData;
};

type BuildAdvertProps = {
  schemeId: Scheme['schemeId'];
  grantAdvert: getAdvertPublishInformationBySchemeIdResponse;
};

type ViewAdvertContentProps = {
  schemeId: string;
  linkToAdvertInFindAGrant: string;
  grantAdvertData: ValidAdvertData;
};

const PublishedGrantInfo = ({
  linkToAdvertInFindAGrant,
  grantAdvertData,
}: PublishedGrantInfoProps) => (
  <div
    className="govuk-!-margin-bottom-6"
    data-cy="cy-published-advert-extra-information"
  >
    <p className="govuk-body">
      An advert for this grant is live on Find a grant.
    </p>

    <LastUpdatedBy grantAdvertData={grantAdvertData} />
    <p className="govuk-body">The link for your advert is below:</p>
    <CustomLink
      href={linkToAdvertInFindAGrant}
      customStyle="govuk-!-font-size-19 break-all-words"
      excludeSubPath
      dataCy="cy-link-to-advert-on-find"
    >
      {linkToAdvertInFindAGrant}
    </CustomLink>
  </div>
);

const PublishedAdvertHeader = ({
  linkToAdvertInFindAGrant,
  grantAdvertData,
}: PublishedGrantInfoProps) => (
  <>
    <PublishedGrantInfo
      linkToAdvertInFindAGrant={linkToAdvertInFindAGrant}
      grantAdvertData={grantAdvertData}
    />
    <GrantStatus grantAdvertData={grantAdvertData} />
  </>
);

const GenericAdvertHeader = ({ grantAdvertData }: AdvertData) => (
  <>
    <GrantStatus grantAdvertData={grantAdvertData} />
    <LastUpdatedBy grantAdvertData={grantAdvertData} />
  </>
);

const AdvertContent = ({
  schemeId,
  linkToAdvertInFindAGrant,
  grantAdvertData,
}: ViewAdvertContentProps) => {
  const viewAdvertHref = `/scheme/${schemeId}/advert/${
    grantAdvertData.grantAdvertId
  }/${getAdvertLink(grantAdvertData)}`;

  return (
    <div className="govuk-!-margin-bottom-6">
      {grantAdvertData.grantAdvertStatus === AdvertStatusEnum.PUBLISHED ? (
        <PublishedAdvertHeader
          linkToAdvertInFindAGrant={linkToAdvertInFindAGrant}
          grantAdvertData={grantAdvertData}
        />
      ) : (
        <GenericAdvertHeader grantAdvertData={grantAdvertData} />
      )}

      <CustomLink
        href={viewAdvertHref}
        customStyle="govuk-!-font-size-19"
        dataCy="cyViewOrChangeYourAdvert-link"
      >
        View or change your advert
      </CustomLink>
    </div>
  );
};

const CreateAdvert = ({ schemeId }: { schemeId: string }) => (
  <div>
    <p className="govuk-body" data-cy="cy-create-an-advert-text">
      Create and publish an advert for your grant.
    </p>
    <CustomLink
      href={`/scheme/${schemeId}/advert/name`}
      dataCy="cyBuildAdvert"
      isButton
    >
      Create advert
    </CustomLink>
  </div>
);

const BuildAdvert = ({
  schemeId,
  grantAdvert: { status, data },
}: BuildAdvertProps) => {
  const { publicRuntimeConfig } = getConfig();
  const linkToAdvertInFindAGrant = `${publicRuntimeConfig.FIND_A_GRANT_URL}/grants/${data?.contentfulSlug}`;

  return (
    <>
      <h2
        className="govuk-heading-m govuk-!-padding-top-4"
        data-testid="build-advert-component"
        data-cy="build-advert-component"
      >
        Grant advert
      </h2>

      {status === 200 && data ? (
        <AdvertContent
          grantAdvertData={data}
          schemeId={schemeId}
          linkToAdvertInFindAGrant={linkToAdvertInFindAGrant}
        />
      ) : (
        <CreateAdvert schemeId={schemeId} />
      )}
    </>
  );
};

export default BuildAdvert;
