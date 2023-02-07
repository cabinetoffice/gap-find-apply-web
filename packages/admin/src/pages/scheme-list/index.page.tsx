import { GetServerSideProps } from 'next';
import CustomLink from '../../components/custom-link/CustomLink';
import Meta from '../../components/layout/Meta';
import GrantSchemeSidebar from '../../components/sidebars/GrantSchemeSidebar';
import Table from '../../components/table/Table';
import { getUserSchemes } from '../../services/SchemeService';
import Scheme from '../../types/Scheme';
import { getSessionIdFromCookies } from '../../utils/session';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const schemes = await getUserSchemes(
    { paginate: false },
    getSessionIdFromCookies(req)
  );
  return {
    props: {
      schemes: schemes,
    },
  };
};

export const generateSchemeTableRows = ({ schemes }: SchemesProps) => {
  return schemes.map((scheme) => {
    const schemeLink = (
      <CustomLink
        href={`/scheme/${scheme.schemeId}`}
        dataCy={`cy_linkToScheme_${scheme.name}`}
        ariaLabel={`View scheme ${scheme.name}`}
      >
        View
      </CustomLink>
    );
    const formattedDate = new Date(scheme.createdDate).toLocaleDateString(
      'en-UK',
      { day: 'numeric', month: 'long', year: 'numeric' }
    );

    return {
      cells: [
        {
          content: scheme.name,
        },
        { content: formattedDate },
        { content: schemeLink },
      ],
    };
  });
};

const SchemeList = ({ schemes }: SchemesProps) => {
  const schemeTableRows = generateSchemeTableRows({ schemes });
  return (
    <>
      <CustomLink
        href="/dashboard"
        dataCy="cy_schemeListBackButton"
        isBackButton
      />

      <div className="govuk-grid-row govuk-!-padding-top-7">
        <Meta title="Grant scheme list - Manage a grant" />

        <div className="govuk-grid-column-two-thirds govuk-!-margin-bottom-6">
          <h1 className="govuk-heading-l" data-cy="cy_schemeListingPageTitle">
            All grants
          </h1>

          <p className="govuk-body" data-cy="cy_schemeListingPageDescription">
            The list below shows all of the grants for your account.
          </p>

          <Table
            rows={schemeTableRows}
            tableName="Schemes table"
            tableClassName="table-thead-bottom-border"
            tableCaptionClassName="govuk-visually-hidden"
            tableHeadColumns={[
              { name: 'Scheme name' },
              { name: 'Date created' },
              { name: 'Action', classNames: 'govuk-visually-hidden' },
            ]}
          />
        </div>

        <GrantSchemeSidebar />
      </div>
    </>
  );
};

interface SchemesProps {
  schemes: Scheme[];
}

export default SchemeList;
