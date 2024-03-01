import Table from '../../components/table/Table';
import { generateSchemeTableRows } from '../../pages/scheme-list/index.page';
import Link from 'next/link';
import Scheme from '../../types/Scheme';

export default function PaginatedSchemeList({
  schemes,
}: {
  schemes: Scheme[];
}) {
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

      <Link href="/scheme-list" className="govuk-link govuk-!-font-size-19">
        View all grants
      </Link>
    </div>
  ) : (
    <div data-testid="create-new-grant-scheme-section">
      <h2 className="govuk-heading-m">Add grant details</h2>
      <p className="govuk-body">Start by adding the details of your grant.</p>
    </div>
  );
}
