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
          { name: 'Grant' },
          { name: 'Created' },
          { name: 'Last Updated' },
          { name: 'Updated By' },
        ]}
        rows={schemeTableRows}
      />
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
