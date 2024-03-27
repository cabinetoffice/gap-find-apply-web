import InferProps from '../../../../types/InferProps';
import { SummaryList } from 'gap-web-ui';
import Meta from '../../../../components/layout/Meta';
import CustomLink from '../../../../components/custom-link/CustomLink';
import {
  UnformattedEditorRow,
  getServerSideProps,
} from '../editors.getServerSideProps';

export { getServerSideProps };

const rmAction = (row: UnformattedEditorRow) => ({
  ...row,
  action: undefined,
});

const ViewEditors = ({
  editorRows,
  schemeName,
  schemeId,
}: InferProps<typeof getServerSideProps>) => {
  const mappedTableRows = editorRows.map(rmAction);

  return (
    <>
      <Meta title={`Grant overview - View Editors`} />
      <CustomLink href={`/scheme/${schemeId}`} isBackButton />
      <div className="govuk-grid-row govuk-!-padding-top-7">
        <div className="govuk-grid-column-full govuk-!-margin-bottom-6">
          <span className="govuk-caption-l">{schemeName}</span>
          <h1 role="heading" className="govuk-heading-l">
            View editors
          </h1>
          <p className="govuk-body">
            All editors can view, edit, and publish an application form or
            advert for this grant. They can also download any grant submissions
            and information for due diligence checks. Only the grant&apos;s
            owners can add or remove editors.
          </p>
          <SummaryList equalColumns boldHeaderRow rows={mappedTableRows} />
          <div className="govuk-button-group">
            <CustomLink
              isSecondaryButton
              href={`/scheme/${schemeId}/`}
              ariaLabel="Back to grant overview"
            >
              Back to grant overview
            </CustomLink>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewEditors;
