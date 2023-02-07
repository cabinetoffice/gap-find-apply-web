import { ReactNode } from 'react';

type PreviewDetailsTabContentProps = {
  tabTitle: string;
  index: number;
  tabValue: ReactNode;
};

export const PreviewDetailsTabContent = ({
  tabTitle,
  tabValue,
  index,
}: PreviewDetailsTabContentProps) => {
  const tabValueAsRecord = tabValue as unknown as Record<string, string>[];
  const hasValue = !!tabValueAsRecord.length;

  return (
    <div
      data-cy={`cy-preview-tab-content-${tabTitle}`}
      data-testid={`${tabTitle}-content-div`}
      className={
        'govuk-tabs__panel' + (index > 0 ? ' govuk-tabs__panel--hidden' : '')
      }
      id={tabTitle.replaceAll(' ', '-')}
      key={tabTitle}
    >
      {hasValue && (
        <>
          <h2 className="govuk-heading govuk-!-margin-top-0">{tabTitle}</h2>
          {tabValue}
        </>
      )}
    </div>
  );
};
