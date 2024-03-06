import moment from 'moment';
import CustomLink from '../../components/custom-link/CustomLink';
import Table from '../../components/table/Table';
import Scheme from '../../types/Scheme';

export const generateSchemeTableRows = ({ schemes }: SchemesProps) => {
  return schemes.map((scheme) => {
    const schemeLink = (
      <CustomLink
        href={`/scheme/${scheme.schemeId}`}
        dataCy={`cy_linkToScheme_${scheme.name}`}
        ariaLabel={`View scheme ${scheme.name}`}
      >
        {scheme.name}
      </CustomLink>
    );

    return {
      cells: [
        {
          content: schemeLink,
        },
        { content: dateFormatter(scheme.createdDate) },
        { content: dateFormatter(scheme.lastUpdatedDate) },
        { content: scheme.lastUpdatedBy },
      ],
    };
  });
};

export function dateFormatter(date: string) {
  const utcDate = moment(date).utc();
  return moment(utcDate).local().format('D MMMM YYYY, h:mm a');
}

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

interface SchemesProps {
  schemes: Scheme[];
}

export default ManageGrantSchemes;
