import {
  clickSaveAndContinue,
  selectRadioButtonYes,
} from '../../utils/grantAdvertUtils/section5Utils';
import run_accessibility from '../../utils/run_accessibility';
import { unpublishExistingAdvert } from '../../utils/grantAdvertUtils/unpublishTestAdvert';

let summaryPageURL;
const loginAndVisitAdvertSummary = (name) => {
  cy.session(
    `${name}`,
    () => {
      cy.visit('/');
    },
    {
      validate() {
        cy.visit('/');
        cy.visit(
          '/scheme/5/advert/fa8f4b1d-d090-4ff6-97be-ccabd3b1d87d/summary'
        );
        cy.url()
          .should('include', '/summary')
          .then((url) => {
            summaryPageURL = url;
          });
      },
    }
  );
};

const backToSummaryPage = () => {
  cy.get('[data-cy="cy-advert-page-back-button"]').click();
  cy.get('[data-testid="question-page-caption"]')
    .should('be.visible')
    .should('have.text', 'UK Tradeshow Programme (UKTP) - Advert');
  cy.get('[data-cy="cy-summary-overview-header"]')
    .should('be.visible')
    .should('have.text', 'Create an advert');
  cy.get('[data-cy="cy-publish-advert-button"]').click();
};

describe('Grant advert summary page', () => {
  before(() => {
    Cypress.session.clearAllSavedSessions();
    loginAndVisitAdvertSummary('advert-summary');
  });
  beforeEach(() => {
    cy.visit(summaryPageURL);
    unpublishExistingAdvert();
    cy.visit(summaryPageURL);
  });

  it('Should access the summary page', () => {
    // Headings & accessibility
    cy.get('[data-cy="cy-summary-caption"]').should(
      'have.text',
      'UK Tradeshow Programme (UKTP) - Advert'
    );
    cy.get('[data-cy="cy-summary-heading"]').should(
      'have.text',
      'Review your advert'
    );
    run_accessibility();

    // Section 1
    cy.get('[data-cy="cy-task-list-heading-1. Grant details"]').should(
      'have.text',
      '1. Grant details'
    );

    // Page 1
    cy.get('[data-cy="cy-summary-1. Grant details-Short description"]').should(
      'have.text',
      'Short description'
    );
    cy.get(
      '[data-cy="cy-summary-1. Grant details-Short description-response"]'
    ).should(
      'have.text',
      'Businesses exporting or thinking of exporting from the UK can attend UK Tradeshow Programmes selection of supported overseas tradeshows and conferences, and potentially receive grants to offset some costs.'
    );
    cy.get(
      '[data-cy="cy-summary-1. Grant details-Short description-change"]'
    ).click();
    cy.url().should(
      'include',
      `/scheme/5/advert/fa8f4b1d-d090-4ff6-97be-ccabd3b1d87d/grantDetails/1`
    );
    cy.get('[data-cy="cy-question-page-caption-Grant details"]').should(
      'have.text',
      'Grant details'
    );
    cy.get('[data-cy="cy-grantShortDescription-question-title"]').should(
      'have.text',
      'Add a short description of the grant'
    );
    backToSummaryPage();

    // Page 2
    cy.get('[data-cy="cy-summary-1. Grant details-Location"]').should(
      'have.text',
      'Location'
    );
    cy.get('[data-cy="cy-summary-1. Grant details-Location-response"]').should(
      'have.text',
      'National'
    );
    cy.get('[data-cy="cy-summary-1. Grant details-Location-change"]').click();
    cy.url().should(
      'include',
      `/scheme/5/advert/fa8f4b1d-d090-4ff6-97be-ccabd3b1d87d/grantDetails/2`
    );
    cy.get('[data-cy="cy-question-page-caption-Grant details"]').should(
      'have.text',
      'Grant details'
    );
    cy.get('[data-cy="cy-grantLocation-question-title"]').should(
      'have.text',
      'Where is the grant available?'
    );
    backToSummaryPage();

    // Page 3
    cy.get(
      '[data-cy="cy-summary-1. Grant details-Funding organisation"]'
    ).should('have.text', 'Funding organisation');
    cy.get(
      '[data-cy="cy-summary-1. Grant details-Funding organisation-response"]'
    ).should('have.text', 'The UK Tradeshow Programme');
    cy.get(
      '[data-cy="cy-summary-1. Grant details-Funding organisation-change"]'
    ).click();
    cy.url().should(
      'include',
      `/scheme/5/advert/fa8f4b1d-d090-4ff6-97be-ccabd3b1d87d/grantDetails/3`
    );
    cy.get('[data-cy="cy-question-page-caption-Grant details"]').should(
      'have.text',
      'Grant details'
    );
    cy.get('[data-cy="cy-grantFunder-question-title"]').should(
      'have.text',
      'Which organisation is funding this grant?'
    );
    backToSummaryPage();

    // Page 4
    cy.get('[data-cy="cy-summary-1. Grant details-Who can apply"]').should(
      'have.text',
      'Who can apply'
    );
    cy.get(
      '[data-cy="cy-summary-1. Grant details-Who can apply-response"]'
    ).should('have.text', 'Public SectorNon-profitPrivate Sector');
    cy.get(
      '[data-cy="cy-summary-1. Grant details-Who can apply-change"]'
    ).click();
    cy.url().should(
      'include',
      `/scheme/5/advert/fa8f4b1d-d090-4ff6-97be-ccabd3b1d87d/grantDetails/4`
    );
    cy.get('[data-cy="cy-question-page-caption-Grant details"]').should(
      'have.text',
      'Grant details'
    );
    cy.get('[data-cy="cy-grantApplicantType-question-title"]').should(
      'have.text',
      'Who can apply for this grant?'
    );
    backToSummaryPage();

    // Section 2
    cy.get('[data-cy="cy-task-list-heading-2. Award amounts"]').should(
      'have.text',
      '2. Award amounts'
    );

    // Page 1
    // Question 1
    cy.get(
      '[data-cy="cy-summary-2. Award amounts-Total amount of the grant"]'
    ).should('have.text', 'Total amount of the grant');
    cy.get(
      '[data-cy="cy-summary-2. Award amounts-Total amount of the grant-response"]'
    ).should('have.text', '£5 million');
    cy.get(
      '[data-cy="cy-summary-2. Award amounts-Total amount of the grant-change"]'
    ).click();
    cy.url().should(
      'include',
      `/scheme/5/advert/fa8f4b1d-d090-4ff6-97be-ccabd3b1d87d/awardAmounts/1`
    );
    cy.get('[data-cy="cy-question-page-caption-Award amounts"]').should(
      'have.text',
      'Award amounts'
    );
    cy.get(
      '[data-cy="cy-advert-page-title-How much funding is available?"]'
    ).should('have.text', 'How much funding is available?');
    backToSummaryPage();

    // Question 2
    cy.get(
      '[data-cy="cy-summary-2. Award amounts-Maximum amount someone can apply for"]'
    ).should('have.text', 'Maximum amount someone can apply for');
    cy.get(
      '[data-cy="cy-summary-2. Award amounts-Maximum amount someone can apply for-response"]'
    ).should('have.text', '£1 million');
    cy.get(
      '[data-cy="cy-summary-2. Award amounts-Maximum amount someone can apply for-change"]'
    ).click();
    cy.url().should(
      'include',
      `/scheme/5/advert/fa8f4b1d-d090-4ff6-97be-ccabd3b1d87d/awardAmounts/1`
    );
    cy.get('[data-cy="cy-question-page-caption-Award amounts"]').should(
      'have.text',
      'Award amounts'
    );
    cy.get(
      '[data-cy="cy-advert-page-title-How much funding is available?"]'
    ).should('have.text', 'How much funding is available?');
    backToSummaryPage();

    // Question 3
    cy.get(
      '[data-cy="cy-summary-2. Award amounts-Minimum amount someone can apply for"]'
    ).should('have.text', 'Minimum amount someone can apply for');
    cy.get(
      '[data-cy="cy-summary-2. Award amounts-Minimum amount someone can apply for-response"]'
    ).should('have.text', '£100,000');
    cy.get(
      '[data-cy="cy-summary-2. Award amounts-Minimum amount someone can apply for-change"]'
    ).click();
    cy.url().should(
      'include',
      `/scheme/5/advert/fa8f4b1d-d090-4ff6-97be-ccabd3b1d87d/awardAmounts/1`
    );
    cy.get('[data-cy="cy-question-page-caption-Award amounts"]').should(
      'have.text',
      'Award amounts'
    );
    cy.get(
      '[data-cy="cy-advert-page-title-How much funding is available?"]'
    ).should('have.text', 'How much funding is available?');
    backToSummaryPage();

    // Section 3
    cy.get('[data-cy="cy-task-list-heading-3. Application dates"]').should(
      'have.text',
      '3. Application dates'
    );

    // Page 1
    // Question 1
    cy.get('[data-cy="cy-summary-3. Application dates-Opening-main"]').should(
      'have.text',
      'Opening date'
    );
    cy.get('[data-cy="cy-summary-3. Application dates-Opening-suffix"]').should(
      'have.text',
      'When your advert is published'
    );
    cy.get(
      '[data-cy="cy-summary-3. Application dates-Opening-response"]'
    ).should('have.text', '31 March 2022');
    cy.get(
      '[data-cy="cy-summary-3. Application dates-Opening-change"]'
    ).click();
    cy.url().should(
      'include',
      `/scheme/5/advert/fa8f4b1d-d090-4ff6-97be-ccabd3b1d87d/applicationDates/1`
    );
    cy.get('[data-cy="cy-question-page-caption-Application dates"]').should(
      'have.text',
      'Application dates'
    );
    cy.get('[data-cy="cy-advert-page-title-Opening and closing dates"]').should(
      'have.text',
      'Opening and closing dates'
    );

    // checking that a different date produces the time.
    cy.get('[data-cy="cyDateFilter-grantApplicationOpenDateYear"]')
      .clear()
      .type('2023');
    cy.get('[data-cy="cyDateFilter-grantApplicationCloseDateYear"]')
      .clear()
      .type('2023');

    cy.get(
      '[data-cy="cy-radioInput-option-YesIveCompletedThisQuestion"]'
    ).click();
    cy.get('[data-cy="cy-advert-page-save-and-continue-button"]').click();
    cy.get('[data-cy="cy-publish-advert-button"]').click();
    cy.get(
      '[data-cy="cy-summary-3. Application dates-Opening-response"]'
    ).should('have.text', '31 March 2023, 00:01am');

    // Resetting the data
    cy.get(
      '[data-cy="cy-summary-3. Application dates-Opening-change"]'
    ).click();
    cy.get('[data-cy="cyDateFilter-grantApplicationOpenDateYear"]')
      .clear()
      .type('2022');
    cy.get('[data-cy="cyDateFilter-grantApplicationCloseDateYear"]')
      .clear()
      .type('2022');

    cy.get(
      '[data-cy="cy-radioInput-option-YesIveCompletedThisQuestion"]'
    ).click();
    cy.get('[data-cy="cy-advert-page-save-and-continue-button"]').click();
    cy.get('[data-cy="cy-publish-advert-button"]').click();
    cy.get(
      '[data-cy="cy-summary-3. Application dates-Opening-response"]'
    ).should('have.text', '31 March 2022');

    // Question 2
    cy.get('[data-cy="cy-summary-3. Application dates-Closing-main"]').should(
      'have.text',
      'Closing date'
    );
    cy.get('[data-cy="cy-summary-3. Application dates-Closing-suffix"]').should(
      'have.text',
      'When your advert is unpublished'
    );
    cy.get(
      '[data-cy="cy-summary-3. Application dates-Closing-response"]'
    ).should('have.text', '1 June 2022, 23:59pm');
    cy.get(
      '[data-cy="cy-summary-3. Application dates-Closing-change"]'
    ).click();
    cy.url().should(
      'include',
      `/scheme/5/advert/fa8f4b1d-d090-4ff6-97be-ccabd3b1d87d/applicationDates/1`
    );
    cy.get('[data-cy="cy-question-page-caption-Application dates"]').should(
      'have.text',
      'Application dates'
    );
    cy.get('[data-cy="cy-advert-page-title-Opening and closing dates"]').should(
      'have.text',
      'Opening and closing dates'
    );
    backToSummaryPage();

    // Section 4
    cy.get('[data-cy="cy-task-list-heading-4. How to apply"]').should(
      'have.text',
      '4. How to apply'
    );

    cy.get(
      `[data-cy="cy-summary-4. How to apply-'Start new application' button links to:"]`
    ).should('have.text', `'Start new application' button links to:`);
    cy.get(
      `[data-cy="cy-summary-4. How to apply-'Start new application' button links to:-response"]`
    ).should('have.text', 'https://www.gov.uk/guidance/uk-tradeshow-programme');
    cy.get(
      `[data-cy="cy-summary-4. How to apply-'Start new application' button links to:-change"]`
    ).click();
    cy.url().should(
      'include',
      `/scheme/5/advert/fa8f4b1d-d090-4ff6-97be-ccabd3b1d87d/howToApply/1`
    );
    cy.get('[data-cy="cy-question-page-caption-How to apply"]').should(
      'have.text',
      'How to apply'
    );
    cy.get('[data-cy="cy-grantWebpageUrl-question-title"]').should(
      'have.text',
      'Add a link so applicants know where to apply'
    );

    cy.wait(1000);
    selectRadioButtonYes();
    clickSaveAndContinue();
    cy.get('[data-cy="cy-publish-advert-button"]').click();

    // Section 5
    cy.get('[data-cy="cy-task-list-heading-5. Further information"]').should(
      'have.text',
      '5. Further information'
    );

    // Page 1
    cy.get(
      `[data-cy="cy-summary-5. Further information-Eligibility information"]`
    ).should('have.text', `Eligibility information`);
    cy.get(
      `[data-cy="cy-summary-5. Further information-Eligibility information-response"]`
    ).should(
      'have.text',
      `EligibilityProgramme eligibility criteria for exhibitorsYou must not have previously received support to exhibit from the UK Tradeshow Programme.You must:be exhibiting for the first time or wishing to venture into new marketsbe turning over annually between £250,000 to £5 millionnot have committed to attending the event before applying for supportbe actively investigating export opportunities for your own business:having not previously exported, orhaving previously exported and wishing to grow exports in new marketsProgramme eligibility criteria for attendeesYou must not have previously received any support from the UK Tradeshow Programme.You must:be attending a show for the first time or wishing to venture into new marketsbe turning over annually between £85,000 to £250,000not have committed to attending the event before applying for supportbe actively investigating export opportunities for your own business:having not previously exported, orhaving previously exported and wishing to grow exports in new marketsCommon eligibility criteriaAccess to support from the programme is limited.Organisations can apply for support from each part of the programme once only, subject to programme eligibility criteria.You must be UK VAT-registered to apply.General eligibility criteriaEligible businesses must be small to medium-sized enterprises (SMEs) (fewer than 250 employees), based in the UK (excluding Isle of Man or the Channel Islands), and either:sell products or services which substantially originate from the UK, oradd significant value to a product or service of non-UK originYou may be required to evidence that you meet the criteria.Financial support eligibility criteriaIn addition to the above conditions, for financial support you must:not receive any contributions, from another programme or body, towards the eligible costs covered by the UK Tradeshow Programmenot have received government aid in excess of the limits below:if you are a business in Great Britain and state aid rules under the Northern Ireland Protocol do not apply: 325,000 SDR (approximately £332,000)if you are a business within the scope of Northern Ireland Protocol State aid rules: €200,000, except for businesses in the sectors belowSome sectors have a lower limit for government aid. This is due to the Northern Ireland Protocol’s state aid rules.These limits and sectors are:€20,000 if you are active in the fishery and aquaculture sector€30,000 if you are active in the primary production of agriculture productsUK Tradeshow Programme financial support is likely to constitute state aid or a subsidy to recipients.For more information, please refer to guidance on the UK’s international subsidy control commitments.Ineligibility for supportDIT will regard an SME as ineligible if:it has previously received exhibitor support from the UK Tradeshow Programmethere is evidence it is planning to close all operations or transfer its assets overseas or offshore jobsthe company or individual has a business record or business practices or products which is/are likely to cause offence in the overseas market and/or embarrass the UK government (for example, on corporate social responsibility grounds)it is offering a product which is illegal to produce or sell in the UK or in the target marketthe company’s product would breach export controls if sold abroad`
    );
    cy.get(
      `[data-cy="cy-summary-5. Further information-Eligibility information-change"]`
    ).click();
    cy.url().should(
      'include',
      `/scheme/5/advert/fa8f4b1d-d090-4ff6-97be-ccabd3b1d87d/furtherInformation/1`
    );
    cy.get('[data-cy="cy-question-page-caption-Further information"]').should(
      'have.text',
      'Further information'
    );
    cy.get('[data-cy="cy-grantEligibilityTab-question-title"]').should(
      'have.text',
      'Add eligibility information for your grant'
    );
    backToSummaryPage();

    // Page 2
    cy.get(
      `[data-cy="cy-summary-5. Further information-Long description"]`
    ).should('have.text', `Long description`);
    cy.get(
      `[data-cy="cy-summary-5. Further information-Long description-response"]`
    ).should(
      'have.text',
      `SummaryUK businesses that are currently exporting can apply for support to:exhibit at or attend approved overseas trade shows and conferencespotentially receive grants to cover some costsUK businesses can also apply for support if they’re thinking about exporting but are not currently doing so.Attending or exhibiting at overseas trade shows can help you gain essential market knowledge and increase your:company’s brand awareness amongst overseas buyersbusiness sales by securing new customersAccessing support to exhibit at overseas trade showsThe support available through the programme varies.All successful applicants will receive training on successfully exhibiting at:trade shows in generalthe specific approved event(s) that they have applied forSome businesses may also receive a grant of either £2,000 or £4,000 as financial support to cover:exhibition space costsstand costs (including design, construction and stand dressing)conference fees, costs of preparing conference promotional material (where appropriate)Accessing support to attend overseas trade showsThe support available through the programme varies.All eligible applicants will receive training on how to successfully exhibit at overseas trade shows.Some businesses will also receive:a bespoke pre-event briefinga curated tour of an overseas trade showcontributions towards costs of show entry, travel or accommodation of £200 for European shows, or £500 for shows outside EuropeAvailability of these additional services is limited and will be allocated in order of successful applications received.How to applyApplications must be made at least 6 weeks before the start of the event.To apply:Go to the calendar of supported events.Select the event of interest.Complete an application form online.`
    );
    cy.get(
      `[data-cy="cy-summary-5. Further information-Long description-change"]`
    ).click();
    cy.url().should(
      'include',
      `/scheme/5/advert/fa8f4b1d-d090-4ff6-97be-ccabd3b1d87d/furtherInformation/2`
    );
    cy.get('[data-cy="cy-question-page-caption-Further information"]').should(
      'have.text',
      'Further information'
    );
    cy.get('[data-cy="cy-grantSummaryTab-question-title"]').should(
      'have.text',
      'Add a long description of your grant'
    );
    backToSummaryPage();

    // Page 3
    cy.get(
      `[data-cy="cy-summary-5. Further information-Relevant dates"]`
    ).should('have.text', `Relevant dates`);
    cy.get(
      `[data-cy="cy-summary-5. Further information-Relevant dates-response"]`
    ).should('have.text', 'Grant dates...');
    cy.get(
      `[data-cy="cy-summary-5. Further information-Relevant dates-change"]`
    )
      .should('have.text', 'Change')
      .click();
    cy.url().should(
      'include',
      `/scheme/5/advert/fa8f4b1d-d090-4ff6-97be-ccabd3b1d87d/furtherInformation/3`
    );
    cy.get('[data-cy="cy-question-page-caption-Further information"]').should(
      'have.text',
      'Further information'
    );
    cy.get('[data-cy="cy-grantDatesTab-question-title"]').should(
      'have.text',
      'Add details about any relevant dates (optional)'
    );

    // Clear details about relevant dates
    cy.setTinyMceContent('', 'grantDatesTab');
    selectRadioButtonYes();
    clickSaveAndContinue();
    cy.visit('/scheme/5/advert/fa8f4b1d-d090-4ff6-97be-ccabd3b1d87d/summary');

    cy.get(
      `[data-cy="cy-summary-5. Further information-Relevant dates-response"]`
    ).should('have.text', '');
    cy.get(
      `[data-cy="cy-summary-5. Further information-Relevant dates-change"]`
    )
      .should('have.text', 'Add')
      .click();

    // Resetting the data
    cy.setTinyMceContent('Grant dates...', 'grantDatesTab');
    selectRadioButtonYes();
    clickSaveAndContinue();
    cy.visit('/scheme/5/advert/fa8f4b1d-d090-4ff6-97be-ccabd3b1d87d/summary');

    // Page 4
    cy.get(
      `[data-cy="cy-summary-5. Further information-Objectives of the grant"]`
    ).should('have.text', `Objectives of the grant`);
    cy.get(
      `[data-cy="cy-summary-5. Further information-Objectives of the grant-response"]`
    ).should('have.text', 'Grant objectives...');
    cy.get(
      `[data-cy="cy-summary-5. Further information-Objectives of the grant-change"]`
    ).click();
    cy.url().should(
      'include',
      `/scheme/5/advert/fa8f4b1d-d090-4ff6-97be-ccabd3b1d87d/furtherInformation/4`
    );
    cy.get('[data-cy="cy-question-page-caption-Further information"]').should(
      'have.text',
      'Further information'
    );
    cy.get('[data-cy="cy-grantObjectivesTab-question-title"]').should(
      'have.text',
      'Add details about the objectives of your grant'
    );
    backToSummaryPage();

    // Page 5
    cy.get(`[data-cy="cy-summary-5. Further information-How to apply"]`).should(
      'have.text',
      `How to apply`
    );
    cy.get(
      `[data-cy="cy-summary-5. Further information-How to apply-response"]`
    ).should('have.text', 'How to apply...');
    cy.get(
      `[data-cy="cy-summary-5. Further information-How to apply-change"]`
    ).click();
    cy.url().should(
      'include',
      `/scheme/5/advert/fa8f4b1d-d090-4ff6-97be-ccabd3b1d87d/furtherInformation/5`
    );
    cy.get('[data-cy="cy-question-page-caption-Further information"]').should(
      'have.text',
      'Further information'
    );
    cy.get('[data-cy="cy-grantApplyTab-question-title"]').should(
      'have.text',
      'Add information about how to apply for your grant'
    );
    backToSummaryPage();

    // Page 6
    cy.get(
      `[data-cy="cy-summary-5. Further information-Supporting information"]`
    ).should('have.text', `Supporting information`);
    cy.get(
      `[data-cy="cy-summary-5. Further information-Supporting information-response"]`
    ).should('have.text', 'Supporting info...');
    cy.get(
      `[data-cy="cy-summary-5. Further information-Supporting information-change"]`
    ).click();
    cy.url().should(
      'include',
      `/scheme/5/advert/fa8f4b1d-d090-4ff6-97be-ccabd3b1d87d/furtherInformation/6`
    );
    cy.get('[data-cy="cy-question-page-caption-Further information"]').should(
      'have.text',
      'Further information'
    );
    cy.get('[data-cy="cy-grantSupportingInfoTab-question-title"]').should(
      'have.text',
      'Add links to any supporting information (optional)'
    );
    backToSummaryPage();
  });
});
