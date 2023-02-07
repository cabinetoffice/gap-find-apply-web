import CustomLink from '../../components/custom-link/CustomLink';
import Table from '../../components/table/Table';
import Scheme from '../../types/Scheme';
import { generateSchemeTableRows } from '../scheme-list/index.page';

const ManageGrantSchemes = ({ schemes }: ManageGrantSchemesProps) => {
  const schemeTableRows = generateSchemeTableRows({ schemes });
  return schemeTableRows.length > 0 ? (
    <div className="govuk-!-margin-bottom-7">
      <Table
        tableName="Your grants"
        tableClassName="table-thead-bottom-border"
        tableCaptionClassName="govuk-table__caption--m"
        tableHeadColumns={[
          { name: 'Name' },
          { name: 'Date created' },
          { name: 'Action', classNames: 'govuk-visually-hidden' },
        ]}
        rows={schemeTableRows}
      />

      <CustomLink
        href="/scheme-list"
        customStyle="govuk-!-font-size-19"
        dataCy="cy_SchemeListButton"
      >
        View all grants
      </CustomLink>
    </div>
  ) : (
    <div data-testid="create-new-grant-scheme-section">
      <h2 className="govuk-heading-m">Add grant details</h2>
      <p className="govuk-body">Start by adding the details of your grant.</p>
    </div>
  );
};

interface ManageGrantSchemesProps {
  schemes: Scheme[];
}

export default ManageGrantSchemes;
