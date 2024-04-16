import CustomLink from '../../../../../../components/custom-link/CustomLink';
type SideBarProps = {
  schemeId: string;
  advertId: string;
};
export const PreviewSideBar = ({ schemeId, advertId }: SideBarProps) => {
  return (
    <>
      <hr
        data-testid="preview-side-bar-top"
        className="govuk-section-break govuk-section-break--m govuk-section-break--visible border-4 border-colour-blue govuk-!-margin-top-0"
      />
      <h2
        className="govuk-heading-m"
        data-cy={`cy-preview-advert-sidebar-title`}
      >
        Preview your advert
      </h2>
      <p className="govuk-body" data-cy={`cy-preview-advert-sidebar-content`}>
        See how your advert will appear to applicants on Find a grant.
      </p>

      <p className="govuk-body">
        <CustomLink
          href={`/scheme/${schemeId}/advert/${advertId}/preview/search-result`}
          dataCy="cy-preview-advert-sidebar-link"
          aria-label="Preview the advert"
        >
          Preview my advert
        </CustomLink>
      </p>

      <hr
        data-testid="preview-side-bar-bottom"
        className="govuk-section-break govuk-section-break--m govuk-section-break--visible"
      />
    </>
  );
};
