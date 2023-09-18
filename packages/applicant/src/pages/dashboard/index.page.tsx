import { GetServerSidePropsContext } from 'next';
import { DescriptionListProps } from '../../components/description-list/DescriptionList';
import Layout from '../../components/partials/Layout';
import Meta from '../../components/partials/Meta';
import { GrantApplicant } from '../../models/GrantApplicant';
import { getApplicationsListById } from '../../services/ApplicationService';
import { GrantApplicantService } from '../../services/GrantApplicantService';
import { getJwtFromCookies } from '../../utils/jwt';
import { ApplicantDashboard } from './Dashboard';
import InferProps from '../../types/InferProps';

export const getServerSideProps = async ({
  req,
  res,
  query,
}: GetServerSidePropsContext) => {
  const findRedirectCookie = process.env.APPLYING_FOR_REDIRECT_COOKIE;
  const migrationStatus = query?.migrationStatus ?? null;
  const oneLoginTransferErrorEnabled =
    process.env.ONE_LOGIN_MIGRATION_JOURNEY_ENABLED === 'true';
  const showMigrationSuccessBanner =
    oneLoginTransferErrorEnabled && migrationStatus === 'success';
  const showMigrationErrorBanner =
    oneLoginTransferErrorEnabled && migrationStatus === 'error';
  const oneLoginEnabled = process.env.ONE_LOGIN_ENABLED === 'true';

  if (req.cookies[findRedirectCookie]) {
    const applicationId = req.cookies[findRedirectCookie];
    res.setHeader(
      'Set-Cookie',
      `${findRedirectCookie}=deleted; Path=/; Max-Age=0`
    );
    return {
      redirect: {
        destination: migrationStatus
          ? `/applications/${applicationId}?migrationStatus=${migrationStatus}`
          : `/applications/${applicationId}`,
        statusCode: 307,
      },
    };
  }

  const grantApplicantService = GrantApplicantService.getInstance();
  const grantApplicant: GrantApplicant =
    await grantApplicantService.getGrantApplicant(getJwtFromCookies(req));
  const applicationsList = await getApplicationsListById(
    getJwtFromCookies(req)
  );
  const hasApplications = applicationsList.length > 0;

  const descriptionList: DescriptionListProps = {
    data: [
      { term: 'Email', detail: grantApplicant?.email },
      {
        term: 'Organisation',
        detail: grantApplicant?.organisation?.legalName || null,
      },
    ],
    needAddOrChangeButtons: false,
    needBorder: false,
  };

  return {
    props: {
      descriptionList,
      hasApplications,
      showMigrationErrorBanner,
      showMigrationSuccessBanner,
      oneLoginEnabled,
    },
  };
};

export default function ApplicantDashboardPage({
  descriptionList,
  hasApplications,
  showMigrationErrorBanner,
  showMigrationSuccessBanner,
  oneLoginEnabled,
}: InferProps<typeof getServerSideProps>) {
  return (
    <>
      <Meta title="My account - Apply for a grant" />
      <Layout>
        <ApplicantDashboard
          descriptionList={descriptionList}
          hasApplications={hasApplications}
          showMigrationErrorBanner={showMigrationErrorBanner}
          showMigrationSuccessBanner={showMigrationSuccessBanner}
          oneLoginEnabled={oneLoginEnabled}
        />
      </Layout>
    </>
  );
}
