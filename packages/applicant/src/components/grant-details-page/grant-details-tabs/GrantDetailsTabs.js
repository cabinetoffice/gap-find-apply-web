import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import gloss from '../../../utils/glossary.json';
import SupportingDocuments from '../../partials/SupportingDocuments';
import TwoColumnContent from '../../partials/twoColumnContent';
import { GrantDetailsTabContent } from './grant-details-tab-content/GrantDetailsTabContent';
import { GrantDetailsTabItem } from './grant-details-tab-item/GrantDetailsTabItem';
import styles from './grant.module.css';

export function GrantDetailsTabs({ grant, filteredOutTabs }) {
  const fetchGrantTabFromTabName = (tabName) => {
    switch (tabName) {
      case 'summary':
        return 'grantSummaryTab';
      case 'eligibility':
        return 'grantEligibilityTab';
      case 'objectives':
        return 'grantObjectivesTab';
      case 'dates':
        return 'grantDatesTab';
      case 'apply':
        return 'grantApplyTab';
      case 'info':
        return 'grantSupportingDocuments';
      case 'faqs':
        return 'grantFaqTab';
      case 'awarded':
        return 'grantAwardedGrants';
    }
  };
  return (
    <div className="govuk-grid-row govuk-body">
      <div className="govuk-grid-column-full">
        <div className="govuk-tabs" data-module="govuk-tabs">
          <h2 className="govuk-tabs__title">Contents</h2>
          {/* tabs */}
          <ul className="govuk-tabs__list">
            {Object.keys(gloss.grantDetails.tabs)
              .filter((tab) => !filteredOutTabs.includes(tab))
              .map((tab, index) => {
                return <GrantDetailsTabItem tab={tab} key={index} />;
              })}
          </ul>
          {/* tab content */}
          {Object.keys(gloss.grantDetails.tabs)
            .filter((tab) => !filteredOutTabs.includes(tab))
            .map((tab, index) => {
              const grantTab = fetchGrantTabFromTabName(tab);

              if (grantTab === 'grantSupportingDocuments') {
                const supportingDocumentsSet = grant.grantSupportingDocuments
                  ? grant.grantSupportingDocuments
                  : [];
                return (
                  <GrantDetailsTabContent tab={tab} index={index}>
                    <div className={styles.grant__breakword}>
                      {!grant.grantSupportingInfoTab &&
                        !supportingDocumentsSet.length &&
                        gloss.grantDetails.tabs.emptyTab}
                      {documentToReactComponents(grant.grantSupportingInfoTab)}
                    </div>
                    <SupportingDocuments
                      supportingDocumentsSet={supportingDocumentsSet}
                    />
                  </GrantDetailsTabContent>
                );
              }

              return (
                <GrantDetailsTabContent tab={tab} index={index} key={index}>
                  <div className={styles.grant__breakword}>
                    {!grant[grantTab]
                      ? gloss.grantDetails.tabs.emptyTab
                      : documentToReactComponents(grant[grantTab])}
                  </div>
                  <TwoColumnContent
                    summaryTwoColumn={
                      Object.prototype.hasOwnProperty.call(grant, grantTab)
                        ? grant[grantTab].content.filter(
                            ({ nodeType }) =>
                              nodeType === 'embedded-entry-block'
                          )
                        : []
                    }
                  />
                </GrantDetailsTabContent>
              );
            })}
        </div>
      </div>
    </div>
  );
}
