import addAdvertToScheme from '../../utils/addAdvertToScheme';
import {
  deleteExistingGrantAdvert,
  deleteTestAdvert,
} from '../../utils/deleteTestAdverts';
import run_accessibility from '../../utils/run_accessibility';
const ADVERT_NAME = 'Test advert name';
let advertPreviewPageUrl;
let sectionOverviewPageUrl;
let advertId;
let schemeId;
// Authentication for the admin side
const loginAndVisitAdvertPreviewWhenNoQuestionHaveBeenAnswered = (name) => {
  cy.session(
    `${name}`,
    () => {
      cy.visit('/');
    },
    {
      validate() {
        deleteExistingGrantAdvert();
        cy.visit('/');
        addAdvertToScheme(ADVERT_NAME);
        cy.url()
          .should('include', '/section-overview')
          .then((url) => {
            sectionOverviewPageUrl = url;
          });
        cy.get('[data-cy="cy-preview-advert-sidebar-link"]').click();
        cy.url()
          .should('include', '/preview')
          .then((url) => {
            advertPreviewPageUrl = url;
            advertId = url //url = http://localhost:3000/apply/admin/scheme/3/advert/fa8f4b1d-d090-4ff6-97be-ccabd3b1d87d/section-overview
              .substring(url.indexOf('/advert/') + '/advert/'.length) // fa8f4b1d-d090-4ff6-97be-ccabd3b1d87d/section-overview
              .split('/')[0]; // fa8f4b1d-d090-4ff6-97be-ccabd3b1d87d
            schemeId = url
              .substring(url.indexOf('/scheme/') + '/scheme/'.length)
              .split('/')[0];
          });
      },
    }
  );
};

const loginAndVisitAdvertPreviewWhenQuestionsHaveBeenAnswered = (name) => {
  cy.session(
    `${name}`,
    () => {
      cy.visit('/');
    },
    {
      validate() {
        cy.visit('/');
        cy.visit(
          '/scheme/5/advert/fa8f4b1d-d090-4ff6-97be-ccabd3b1d87d/preview'
        );
        cy.url()
          .should('include', '/preview')
          .then((url) => {
            advertPreviewPageUrl = url;
            sectionOverviewPageUrl =
              'http://localhost:3000/apply/admin/scheme/5/advert/fa8f4b1d-d090-4ff6-97be-ccabd3b1d87d/section-overview';
          });
      },
    }
  );
};
context('Preview Advert', () => {
  describe('Preview Advert No questions answered', () => {
    beforeEach(() => {
      cy.visit(advertPreviewPageUrl);
    });

    before(() => {
      Cypress.session.clearAllSavedSessions();
      loginAndVisitAdvertPreviewWhenNoQuestionHaveBeenAnswered(
        'Preview Advert'
      );
    });
    after(() => {
      cy.visit(sectionOverviewPageUrl);
      deleteTestAdvert();
    });

    it('should have the static content when no questions have been answered in the advert', () => {
      run_accessibility();
      //header

      cy.get('[data-cy="cy-back-button"]')
        .should('be.visible')
        .should(
          'have.attr',
          'href',
          `/apply/admin/scheme/${schemeId}/advert/${advertId}/section-overview`
        );

      cy.get('[data-cy="cy-preview-page-caption"]').should(
        'have.text',
        'How your advert looks to applicants'
      );
      cy.get('[data-cy="cy-preview-page-header"]').should(
        'have.text',
        'Advert details page'
      );
      cy.get('[data-cy="cy-preview-page-inset-text"]').should(
        'have.text',
        'This is what applicants will see if they select your advert.The preview below shows all the information you have entered so far.'
      );
      cy.get(`[data-cy="cy-grant-detail-name"]`).should(
        'have.text',
        ADVERT_NAME
      );
      cy.get(`[data-cy="cy-grant-short-description"]`).should('have.text', '');
      cy.get(`[data-cy="cy-grant-open-date-key"]`).should(
        'have.text',
        'Opening date:'
      );
      cy.get(`[data-cy="cy-grant-open-date-value"]`).should('have.text', '');
      cy.get(`[data-cy="cy-grant-close-date-key"]`).should(
        'have.text',
        'Closing date:'
      );
      cy.get(`[data-cy="cy-grant-close-date-value"]`).should('have.text', '');

      // tabs
      cy.get(`[data-cy="cy-preview-tab-header-Summary"]`)
        .should('be.visible')
        .should('have.attr', 'href', `#Summary`)
        .should('have.text', 'Summary');
      cy.get(`[data-cy="cy-preview-tab-content-Summary"]`).should(
        'have.text',
        ''
      );

      cy.get(`[data-cy="cy-preview-tab-header-Eligibility"]`)
        .should('be.visible')
        .should('have.attr', 'href', `#Eligibility`)
        .should('have.text', 'Eligibility');
      cy.get(`[data-cy="cy-preview-tab-content-Eligibility"]`).should(
        'have.text',
        ''
      );

      cy.get(`[data-cy="cy-preview-tab-header-Objectives"]`)
        .should('be.visible')
        .should('have.attr', 'href', `#Objectives`)
        .should('have.text', 'Objectives');
      cy.get(`[data-cy="cy-preview-tab-content-Objectives"]`).should(
        'have.text',
        ''
      );

      cy.get(`[data-cy="cy-preview-tab-header-Dates"]`)
        .should('be.visible')
        .should('have.attr', 'href', `#Dates`)
        .should('have.text', 'Dates');
      cy.get(`[data-cy="cy-preview-tab-content-Dates"]`).should(
        'have.text',
        ''
      );

      cy.get(`[data-cy="cy-preview-tab-header-How to apply"]`)
        .should('be.visible')
        .should('have.attr', 'href', `#How-to-apply`)
        .should('have.text', 'How to apply');
      cy.get(`[data-cy="cy-preview-tab-content-How to apply"]`).should(
        'have.text',
        ''
      );

      cy.get(`[data-cy="cy-preview-tab-header-Supporting information"]`)
        .should('be.visible')
        .should('have.attr', 'href', `#Supporting-information`)
        .should('have.text', 'Supporting information');
      cy.get(
        `[data-cy="cy-preview-tab-content-Supporting information"]`
      ).should('have.text', '');

      //Back to create-advert-button
      cy.get('[data-cy="cy-back-to-create-advert-button"]')
        .should('be.visible')
        .should(
          'have.attr',
          'href',
          `/apply/admin/scheme/${schemeId}/advert/${advertId}/section-overview`
        );
    });
  });

  describe('Preview Advert Questions answered', () => {
    beforeEach(() => {
      cy.visit(advertPreviewPageUrl);
    });

    before(() => {
      Cypress.session.clearAllSavedSessions();
      loginAndVisitAdvertPreviewWhenQuestionsHaveBeenAnswered(
        'Preview Advert 2'
      );
    });

    it('should show content when the answers have been answered', () => {
      const ADVERT_NAME = 'UK Tradeshow Programme (UKTP) - Advert';
      const ADVERT_SHORT_DESCRIPTION =
        'Businesses exporting or thinking of exporting from the UK can attend UK Tradeshow Programmes selection of supported overseas tradeshows and conferences, and potentially receive grants to offset some costs.';
      const ADVERT_OPENING_DATE = '31 March 2022, 12:01am';
      const ADVERT_CLOSING_DATE = '1 June 2022, 11:59pm';
      const ADVERT_SUMMARY_CONTENT = `SummaryUK businesses that are currently exporting can apply for support to:exhibit at or attend approved overseas trade shows and conferencespotentially receive grants to cover some costsUK businesses can also apply for support if they’re thinking about exporting but are not currently doing so.Attending or exhibiting at overseas trade shows can help you gain essential market knowledge and increase your:company’s brand awareness amongst overseas buyersbusiness sales by securing new customersAccessing support to exhibit at overseas trade showsThe support available through the programme varies.All successful applicants will receive training on successfully exhibiting at:trade shows in generalthe specific approved event(s) that they have applied forSome businesses may also receive a grant of either £2,000 or £4,000 as financial support to cover:exhibition space costsstand costs (including design, construction and stand dressing)conference fees, costs of preparing conference promotional material (where appropriate)Accessing support to attend overseas trade showsThe support available through the programme varies.All eligible applicants will receive training on how to successfully exhibit at overseas trade shows.Some businesses will also receive:a bespoke pre-event briefinga curated tour of an overseas trade showcontributions towards costs of show entry, travel or accommodation of £200 for European shows, or £500 for shows outside EuropeAvailability of these additional services is limited and will be allocated in order of successful applications received.How to applyApplications must be made at least 6 weeks before the start of the event.To apply:Go to the calendar of supported events.Select the event of interest.Complete an application form online.`;
      const ADVERT_ELIGIBILITY_CONTENT =
        'EligibilityProgramme eligibility criteria for exhibitorsYou must not have previously received support to exhibit from the UK Tradeshow Programme.You must:be exhibiting for the first time or wishing to venture into new marketsbe turning over annually between £250,000 to £5 millionnot have committed to attending the event before applying for supportbe actively investigating export opportunities for your own business:having not previously exported, orhaving previously exported and wishing to grow exports in new marketsProgramme eligibility criteria for attendeesYou must not have previously received any support from the UK Tradeshow Programme.You must:be attending a show for the first time or wishing to venture into new marketsbe turning over annually between £85,000 to £250,000not have committed to attending the event before applying for supportbe actively investigating export opportunities for your own business:having not previously exported, orhaving previously exported and wishing to grow exports in new marketsCommon eligibility criteriaAccess to support from the programme is limited.Organisations can apply for support from each part of the programme once only, subject to programme eligibility criteria.You must be UK VAT-registered to apply.General eligibility criteriaEligible businesses must be small to medium-sized enterprises (SMEs) (fewer than 250 employees), based in the UK (excluding Isle of Man or the Channel Islands), and either:sell products or services which substantially originate from the UK, oradd significant value to a product or service of non-UK originYou may be required to evidence that you meet the criteria.Financial support eligibility criteriaIn addition to the above conditions, for financial support you must:not receive any contributions, from another programme or body, towards the eligible costs covered by the UK Tradeshow Programmenot have received government aid in excess of the limits below:if you are a business in Great Britain and state aid rules under the Northern Ireland Protocol do not apply: 325,000 SDR (approximately £332,000)if you are a business within the scope of Northern Ireland Protocol State aid rules: €200,000, except for businesses in the sectors belowSome sectors have a lower limit for government aid. This is due to the Northern Ireland Protocol’s state aid rules.These limits and sectors are:€20,000 if you are active in the fishery and aquaculture sector€30,000 if you are active in the primary production of agriculture productsUK Tradeshow Programme financial support is likely to constitute state aid or a subsidy to recipients.For more information, please refer to guidance on the UK’s international subsidy control commitments.Ineligibility for supportDIT will regard an SME as ineligible if:it has previously received exhibitor support from the UK Tradeshow Programmethere is evidence it is planning to close all operations or transfer its assets overseas or offshore jobsthe company or individual has a business record or business practices or products which is/are likely to cause offence in the overseas market and/or embarrass the UK government (for example, on corporate social responsibility grounds)it is offering a product which is illegal to produce or sell in the UK or in the target marketthe company’s product would breach export controls if sold abroad';

      const ADVERT_OBJECTIVES_CONTENT = 'Grant objectives...';
      const ADVERT_DATES_CONTENT = 'Grant dates...';
      const ADVERT_HOW_TO_APPLY_CONTENT = 'How to apply...';
      const ADVERT_SUPPORTING_INFORMATION_CONTENT = 'Supporting info...';

      run_accessibility();
      cy.get(`[data-cy="cy-grant-detail-name"]`).should(
        'have.text',
        ADVERT_NAME
      );
      cy.get(`[data-cy="cy-grant-short-description"]`).should(
        'have.text',
        ADVERT_SHORT_DESCRIPTION
      );
      cy.get(`[data-cy="cy-grant-open-date-value"]`).should(
        'have.text',
        ADVERT_OPENING_DATE
      );
      cy.get(`[data-cy="cy-grant-close-date-value"]`).should(
        'have.text',
        ADVERT_CLOSING_DATE
      );

      // tabs
      cy.get(`[data-cy="cy-preview-tab-header-Summary"]`)
        .should('be.visible')
        .should('have.attr', 'href', `#Summary`)
        .should('have.text', 'Summary');
      cy.get(`[data-cy="cy-preview-tab-content-Summary"]`).should(
        'have.text',
        `Summary${ADVERT_SUMMARY_CONTENT}`
      );

      cy.get(`[data-cy="cy-preview-tab-header-Eligibility"]`)
        .should('be.visible')
        .should('have.attr', 'href', `#Eligibility`)
        .should('have.text', 'Eligibility');
      cy.get(`[data-cy="cy-preview-tab-content-Eligibility"]`).should(
        'have.text',
        `Eligibility${ADVERT_ELIGIBILITY_CONTENT}`
      );

      cy.get(`[data-cy="cy-preview-tab-header-Objectives"]`)
        .should('be.visible')
        .should('have.attr', 'href', `#Objectives`)
        .should('have.text', 'Objectives');
      cy.get(`[data-cy="cy-preview-tab-content-Objectives"]`).should(
        'have.text',
        `Objectives${ADVERT_OBJECTIVES_CONTENT}`
      );

      cy.get(`[data-cy="cy-preview-tab-header-Dates"]`)
        .should('be.visible')
        .should('have.attr', 'href', `#Dates`)
        .should('have.text', 'Dates');
      cy.get(`[data-cy="cy-preview-tab-content-Dates"]`).should(
        'have.text',
        `Dates${ADVERT_DATES_CONTENT}`
      );

      cy.get(`[data-cy="cy-preview-tab-header-How to apply"]`)
        .should('be.visible')
        .should('have.attr', 'href', `#How-to-apply`)
        .should('have.text', 'How to apply');
      cy.get(`[data-cy="cy-preview-tab-content-How to apply"]`).should(
        'have.text',
        `How to apply${ADVERT_HOW_TO_APPLY_CONTENT}`
      );

      cy.get(`[data-cy="cy-preview-tab-header-Supporting information"]`)
        .should('be.visible')
        .should('have.attr', 'href', `#Supporting-information`)
        .should('have.text', 'Supporting information');
      cy.get(
        `[data-cy="cy-preview-tab-content-Supporting information"]`
      ).should(
        'have.text',
        `Supporting information${ADVERT_SUPPORTING_INFORMATION_CONTENT}`
      );
    });
  });
});
