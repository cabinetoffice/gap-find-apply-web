type PreviewDetailsTabItemProps = {
  tabTitle: string;
  index: number;
};

export const PreviewDetailsTabHeader = ({
  tabTitle,
  index,
}: PreviewDetailsTabItemProps) => {
  return (
    <li
      className={
        'govuk-tabs__list-item' +
        (index === 0 ? ' govuk-tabs__list-item--selected' : '')
      }
    >
      <a
        className="govuk-tabs__tab"
        href={`#${tabTitle.replaceAll(' ', '-')}`}
        data-cy={`cy-preview-tab-header-${tabTitle}`}
      >
        {tabTitle}
      </a>
    </li>
  );
};
