import { GetServerSidePropsContext } from 'next';
import CustomLink from '../../../../../components/custom-link/CustomLink';
import Meta from '../../../../../components/layout/Meta';
import InferProps from '../../../../../types/InferProps';

export const getServerSideProps = async ({
  params,
}: GetServerSidePropsContext) => {
  const { schemeId, advertId } = params as Record<string, string>;

  return {
    props: {
      backToAccountLink: `/scheme/${schemeId}/advert/${advertId}/survey`,
    },
  };
};

const ScheduleSuccessPage = ({
  backToAccountLink,
}: InferProps<typeof getServerSideProps>) => {
  return (
    <>
      <Meta title="Schedule grant advert - Manage a grant" />

      <div className="govuk-!-padding-top-7">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <div className="govuk-panel govuk-panel--confirmation">
              <h1 className="govuk-panel__title" data-cy="cy-advert-scheduled">
                Grant advert successfully scheduled
              </h1>
            </div>

            <p className="govuk-body govuk-!-padding-top-4">
              Your advert will be published on the opening date.
            </p>
            <p className="govuk-body">
              A link to your advert will be added to your account on the opening
              date.
            </p>
            <p className="govuk-body govuk-!-padding-bottom-4">
              You can make changes to your advert at any time.
            </p>

            <CustomLink
              href={backToAccountLink}
              isButton
              dataCy="back-to-my-account-button"
            >
              Back to my account
            </CustomLink>
          </div>
        </div>
      </div>
    </>
  );
};

export default ScheduleSuccessPage;
