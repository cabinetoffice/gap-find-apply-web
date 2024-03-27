import Scheme from '../../types/Scheme';
import ManageGrantSchemes from './ManageGrantSchemes';

const GrantSchemeTables = ({
  schemesUserOwns,
  schemesUserCanEdit,
}: GrantSchemeTablesProps) => {
  return (
    <>
      <ManageGrantSchemes
        schemes={schemesUserOwns}
        tableHeading="Grants you own"
      />
      <ManageGrantSchemes
        schemes={schemesUserCanEdit}
        tableHeading="Grants you can edit"
      />
    </>
  );
};

interface GrantSchemeTablesProps {
  schemesUserOwns: Scheme[];
  schemesUserCanEdit: Scheme[];
}

export default GrantSchemeTables;
