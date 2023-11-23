import { Table } from 'gap-web-ui';
import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import Meta from '../../../components/layout/Meta';
import { getIntegrations } from '../../../services/SuperAdminService';
import InferProps from '../../../types/InferProps';
import { fetchDataOrGetRedirect } from '../../../utils/fetchDataOrGetRedirect';
import { getUserTokenFromCookies } from '../../../utils/session';
import Navigation from '../Navigation';
import styles from '../superadmin-dashboard.module.scss';
import moment from 'moment';

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { req } = context;

  const jwt = getUserTokenFromCookies(req);

  const fetchPageData = async () => ({
    integrations: await getIntegrations(jwt),
  });

  return await fetchDataOrGetRedirect(fetchPageData);
};

const Integrations = ({
  integrations,
}: InferProps<typeof getServerSideProps>) => (
  <>
    <Meta title="Integrations" />
    <Navigation />
    <div className="govuk-grid-row govuk-!-padding-top-7">
      <div className="govuk-grid-column-full">
        <div className={`${styles.sidebar} govuk-grid-column-one-third`}>
          <h2 className={`govuk-heading-l ${styles['mb-md-15px']}`}>
            Integrations
          </h2>
          <p className="govuk-body">
            <span className={styles['fw-bold']}>{integrations.length} </span>
            service integrations
          </p>
        </div>

        <div className="govuk-grid-column-two-thirds">
          <Table
            tHeadColumns={[
              { name: 'Integration' },
              { name: 'Status' },
              { name: 'Last Updated', wrapText: true },
              { name: 'Connection' },
            ]}
            rows={convertIntegrationsToTableRows(integrations)}
          />
        </div>
      </div>
    </div>
  </>
);

const convertIntegrationsToTableRows = (integrations: Integration[]) =>
  integrations.map(({ lastUpdated, name, status, connectionEndpoint }) => ({
    cells: [
      { content: name },
      { content: status },
      {
        content: <LastUpdatedCell lastUpdated={lastUpdated} />,
      },
      {
        content: connectionEndpoint ? (
          <Link href={`${connectionEndpoint}`}>
            <a className="govuk-link">Reconnect</a>
          </Link>
        ) : (
          '-'
        ),
      },
    ],
  }));

const LastUpdatedCell = ({ lastUpdated }: { lastUpdated: string }) => {
  const mobileLastUpdated = moment(lastUpdated).format('DD MMMM YYYY');
  const lastUpdatedDayAndMonth = moment(lastUpdated).format('DD MMMM');
  const lastUpdatedYear = moment(lastUpdated).format('YYYY');

  return (
    <>
      <span className={styles['d-none-desktop']}>{mobileLastUpdated}</span>
      <div className={styles['d-none-mobile']}>
        <span>{lastUpdatedDayAndMonth} </span> <br />
        <span> {lastUpdatedYear}</span>
      </div>
    </>
  );
};

export type Integration = {
  name: string;
  status: 'Connected' | 'Disconnected';
  lastUpdated: string;
  connectionEndpoint?: string;
};

export default Integrations;
