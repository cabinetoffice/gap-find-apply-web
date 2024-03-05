import Table from '../../components/table/Table';
import Scheme from '../../types/Scheme';
import { generateSchemeTableRows } from '../scheme-list/index.page';

const ManageGrantSchemes = ({
  schemes,
  tableHeading,
}: ManageGrantSchemesProps) => {
  const schemeTableRows = generateSchemeTableRows({ schemes });
  return (
    <div className="govuk-!-margin-bottom-7">
      <Table
        tableName={tableHeading}
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
  );
};

interface ManageGrantSchemesProps {
  schemes: Scheme[];
  tableHeading: string;
}

export default ManageGrantSchemes;
