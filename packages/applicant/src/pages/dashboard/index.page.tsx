import { GetServerSidePropsContext } from 'next';
import { DescriptionListProps } from '../../components/description-list/DescriptionList';
import Layout from '../../components/partials/Layout';
import Meta from '../../components/partials/Meta';
import { GrantApplicant } from '../../models/GrantApplicant';
import { getApplicationsListById } from '../../services/ApplicationService';
import { GrantApplicantService } from '../../services/GrantApplicantService';
import InferProps from '../../types/InferProps';
import { getJwtFromCookies } from '../../utils/jwt';
import { ApplicantDashboard } from './Dashboard';

const SUCCEEDED = 'SUCCEEDED';
const FAILED = 'FAILED';

export const getServerSideProps = async ({
  req,
  res,
  query,
}: GetServerSidePropsContext) => {
  const applyRedirectCookie = process.env.APPLYING_FOR_REDIRECT_COOKIE;

  if (req.cookies[applyRedirectCookie]) {
    const applicationId = req.cookies[applyRedirectCookie];
    res.setHeader(
      'Set-Cookie',
      `${applyRedirectCookie}=deleted; Path=/; Max-Age=0`
    );

    return {
      redirect: {
        destination: `/applications/${applicationId}`,
        statusCode: 307,
      },
    };
  }

  if (process.env.MANDATORY_QUESTIONS_ENABLED === 'true') {
    const findRedirectCookie = process.env.FIND_REDIRECT_COOKIE;
    const mandatoryQuestionRedirectCookie = process.env.MQ_REDIRECT_COOKIE;

    if (req.cookies[findRedirectCookie]) {
      const queryParams = req.cookies[findRedirectCookie];
      res.setHeader(
        'Set-Cookie',
        `${findRedirectCookie}=deleted; Path=/; Max-Age=0`
      );
      return {
        redirect: {
          destination: `/api/redirect-from-find${queryParams}`,
          statusCode: 307,
        },
      };
    }

    if (req.cookies[mandatoryQuestionRedirectCookie]) {
      const queryParams = req.cookies[mandatoryQuestionRedirectCookie];
      res.setHeader(
        'Set-Cookie',
        `${mandatoryQuestionRedirectCookie}=deleted; Path=/; Max-Age=0`
      );
      return {
        redirect: {
          destination: `/mandatory-questions/start${queryParams}`,
          statusCode: 307,
        },
      };
    }
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

  const { applyMigrationStatus, findMigrationStatus } = query || {};

  const bannerProps = getBannerProps({
    applyMigrationStatus,
    findMigrationStatus,
  });

  return {
    props: {
      descriptionList,
      hasApplications,
      bannerProps,
      oneLoginEnabled: process.env.ONE_LOGIN_ENABLED === 'true',
    },
  };
};

export default function ApplicantDashboardPage({
  descriptionList,
  hasApplications,
  bannerProps,
  oneLoginEnabled,
}: InferProps<typeof getServerSideProps>) {
  return (
    <>
      <Meta title="My account - Apply for a grant" />
      <Layout>
        <ApplicantDashboard
          descriptionList={descriptionList}
          hasApplications={hasApplications}
          bannerProps={bannerProps}
          oneLoginEnabled={oneLoginEnabled}
        />
      </Layout>
    </>
  );
}

const getBannerProps = ({ findMigrationStatus, applyMigrationStatus }) => {
  if (process.env.ONE_LOGIN_MIGRATION_JOURNEY_ENABLED !== 'true') return null;
  if (findMigrationStatus === FAILED || applyMigrationStatus === FAILED) {
    return FAILED;
  }

  if (findMigrationStatus === SUCCEEDED && applyMigrationStatus === SUCCEEDED) {
    return {
      bannerHeading:
        'You can now access your notifications and grant applications when you sign in with GOV.UK One Login.',
      isSuccess: true,
    };
  }

  if (findMigrationStatus === SUCCEEDED && applyMigrationStatus !== SUCCEEDED) {
    return {
      bannerHeading:
        'You can now access your notifications when you sign in with GOV.UK One Login.',
      isSuccess: true,
    };
  }
  if (findMigrationStatus !== SUCCEEDED && applyMigrationStatus === SUCCEEDED) {
    return {
      bannerHeading:
        'You can use your One Login to sign into this service and see your application forms.',
      isSuccess: true,
    };
  }
  return null;
};
