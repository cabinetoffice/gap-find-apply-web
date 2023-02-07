import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { PreviewPageTab } from '../../../../../../../services/AdvertPageService.d';
import { PreviewDetailsTabContent } from './PreviewDetailsTabContent';
import { PreviewDetailsTabHeader } from './PreviewDetailsTabHeader';

export type PreviewDetailsProps = {
  tabs: PreviewPageTab[];
};

export const PreviewDetailsTab = ({ tabs }: PreviewDetailsProps) => {
  return (
    <div
      className="govuk-grid-column-full"
      data-testid="advert-preview-tabs-div"
    >
      <div className="govuk-tabs" data-module="govuk-tabs">
        <h2 className="govuk-tabs__title">Contents</h2>
        <ul className="govuk-tabs__list">
          {tabs.map((tab, index) => {
            const { name } = tab;
            return (
              <PreviewDetailsTabHeader
                tabTitle={name}
                index={index}
                key={name}
              />
            );
          })}
        </ul>
        {tabs.map((tab, index) => {
          const { name, content } = tab;
          const hasValue = !!content;
          return (
            <PreviewDetailsTabContent
              tabTitle={name}
              tabValue={
                hasValue ? documentToReactComponents(JSON.parse(content)) : ''
              }
              index={index}
              key={name}
            />
          );
        })}
      </div>
    </div>
  );
};
