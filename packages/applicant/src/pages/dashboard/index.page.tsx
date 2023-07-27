import { GetServerSideProps } from 'next';
import { DescriptionListProps } from '../../components/description-list/DescriptionList';
import Layout from '../../components/partials/Layout';
import Meta from '../../components/partials/Meta';
import { GrantApplicant } from '../../models/GrantApplicant';
import { getApplicationsListById } from '../../services/ApplicationService';
import { GrantApplicantService } from '../../services/GrantApplicantService';
import { getJwtFromCookies } from '../../utils/jwt';
import { ApplicantDashboard } from './Dashboard';

export interface ApplicantDashBoardPageProps {
  descriptionList: DescriptionListProps;
  hasApplications: boolean;
}

export const getServerSideProps: GetServerSideProps<
  ApplicantDashBoardPageProps
> = async ({ req, res }) => {
  const findRedirectCookie = process.env.APPLYING_FOR_REDIRECT_COOKIE;

  if (req.cookies[findRedirectCookie]) {
    const applicationId = req.cookies[findRedirectCookie];
    res.setHeader(
      'Set-Cookie',
      `${findRedirectCookie}=deleted; Path=/; Max-Age=0`
    );
    return {
      redirect: {
        destination: `/applications/${applicationId}`,
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
  return { props: { descriptionList, hasApplications } };
};

export default function ApplicantDashboardPage({
  descriptionList,
  hasApplications,
}: ApplicantDashBoardPageProps) {
  return (
    <>
      <Meta title="My account - Apply for a grant" />
      <Layout>
        <ApplicantDashboard
          descriptionList={descriptionList}
          hasApplications={hasApplications}
        />
      </Layout>
    </>
  );
}
