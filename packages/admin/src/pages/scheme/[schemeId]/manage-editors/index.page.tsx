import InferProps from '../../../../types/InferProps';
import { SummaryList, Row, ImportantBanner } from 'gap-web-ui';
import Meta from '../../../../components/layout/Meta';
import CustomLink from '../../../../components/custom-link/CustomLink';
import {
  Action,
  UnformattedEditorRow,
  getServerSideProps,
} from '../editors.getServerSideProps';

export { getServerSideProps };

const OWNER = 'Owner';

const LinkToAction = ({ action }: { action: Action }) => (
  <CustomLink
    href={action.href}
    dataCy={`cy_summaryListLink_${action.ariaLabel}`}
    ariaLabel={action.ariaLabel ?? action.label}
  >
    {action.label}
  </CustomLink>
);

const formatEditorRow = (row: UnformattedEditorRow): Row => {
  if (row.value === OWNER) return { ...row, action: '-' };
  if (row.action && typeof row.action !== 'string' && 'href' in row.action)
    return {
      ...row,
      action: <LinkToAction action={row.action} />,
    };
  return row as Row;
};

const ManageEditors = ({
  editorRows,
  schemeName,
  schemeId,
  newEditor,
}: InferProps<typeof getServerSideProps>) => {
  const mappedTableRows = editorRows.map(formatEditorRow);
  return (
    <>
      <Meta title={`Grant overview - Manage Editors`} />
      <CustomLink href={`/scheme/${schemeId}`} isBackButton />
      <div className="govuk-grid-row govuk-!-padding-top-7">
        {newEditor ? (
          <ImportantBanner
            bannerHeading={`${newEditor} has been added as an editor.`}
            isSuccess
          />
        ) : null}
        <div className="govuk-grid-column-full govuk-!-margin-bottom-6">
          <span className="govuk-caption-l">{schemeName}</span>
          <h1 className="govuk-heading-l">Add or manage editors</h1>
          <p className="govuk-body">
            Only the grant owner can add or remove editors.
          </p>
          <br />
          <p className="govuk-body">Editors can:</p>
          <ul className="govuk-list govuk-list--bullet">
            <li>view, edit or delete any information entered for this grant</li>
            <li>publish a grant advert or application form</li>
            <li>download any submitted application forms</li>
          </ul>
          <br />
          <p className="govuk-body">
            If you need to change the owner of this grant, contact{' '}
            <a className="govuk-link" href="findagrant@cabinetoffice.gov.uk">
              findagrant@cabinetoffice.gov.uk
            </a>
            .
          </p>
          <SummaryList
            actionTextLeft
            equalColumns
            boldHeaderRow
            rows={mappedTableRows}
          />
          <div className="govuk-button-group">
            <CustomLink
              isButton
              href={`/scheme/${schemeId}/manage-editors/add-editor?schemeName=${schemeName}`}
              ariaLabel="Add an editor"
            >
              Add an editor
            </CustomLink>

            <CustomLink
              isSecondaryButton
              href={`/scheme/${schemeId}/`}
              ariaLabel="Return to grant overview"
            >
              Return to grant overview
            </CustomLink>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManageEditors;
