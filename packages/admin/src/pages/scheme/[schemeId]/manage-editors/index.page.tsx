import InferProps from '../../../../types/InferProps';
import { SummaryList } from 'gap-web-ui';
import Meta from '../../../../components/layout/Meta';
import CustomLink from '../../../../components/custom-link/CustomLink';
import {
  Action,
  UnformattedEditorRow,
  getServerSideProps,
} from '../editors.getServerSideProps';
import { Row } from 'gap-web-ui/dist/cjs/components/summary-list/SummaryList';

export { getServerSideProps };

const LinkToAction = ({ action }: { action: Action }) => (
  <CustomLink
    href={action.href}
    dataCy={`cy_summaryListLink_${action.ariaLabel}`}
    ariaLabel={action.ariaLabel ?? action.label}
  >
    {action.label}
  </CustomLink>
);

const formatEditorRow = (acc: Row[], row: UnformattedEditorRow) => {
  const mapRequired = typeof row.action !== 'string' && row.action;
  const action = (
    mapRequired ? <LinkToAction action={row.action as Action} /> : row.action
  ) as Exclude<Row['action'], undefined>;

  return [...acc, { ...row, action }];
};

const ManageEditors = ({
  editorRows,
}: InferProps<typeof getServerSideProps>) => {
  const mappedTableRows = editorRows.reduce(formatEditorRow, []);

  return (
    <>
      <Meta title={`Grant overview - Manage Editors`} />
      <CustomLink href="/dashboard" isBackButton />

      <div className="govuk-grid-row govuk-!-padding-top-7">
        <div className="govuk-grid-column-full govuk-!-margin-bottom-6">
          <span className="govuk-caption-l"></span>
          <h1 className="govuk-heading-xl">Add or manage editors</h1>
          <SummaryList boldHeaderRow rows={mappedTableRows} />
        </div>
      </div>
    </>
  );
};

export default ManageEditors;
