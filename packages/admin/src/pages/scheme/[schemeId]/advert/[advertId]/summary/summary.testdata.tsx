import AdvertStatusEnum from '../../../../../../enums/AdvertStatus';
import { getAdvertStatusBySchemeIdResponse } from '../../../../../../services/AdvertPageService.d';
import {
  GrantAdvertSummaryPageResponse,
  GrantAdvertQuestionResponseType,
} from '../../../../../../types/GetSummaryPageContentResponse';

export const sessionCookie = 'MTJlZDE5YjktNTAwZS00MWE2LTlmNjMtMTk0MjY1ODJlZmIw';
export const advertName = 'Test Advert';
export const summaryPageResponse: GrantAdvertSummaryPageResponse = {
  id: '467500a8-2d65-492d-a5bd-d1e3acaa04d0',
  advertName: advertName,
  status: AdvertStatusEnum.DRAFT,
  sections: [
    {
      id: 'grantDetails',
      title: '1. Grant Details',
      pages: [
        {
          id: '1',
          title: 'Short description',
          questions: [
            {
              id: 'grantShortDescription',
              title: 'Short description',
              response: 'This is a short description',
              multiResponse: null,
              responseType: GrantAdvertQuestionResponseType.SHORT_TEXT,
            },
          ],
        },
        {
          id: '2',
          title: 'Location',
          questions: [
            {
              id: 'grantLocation',
              title: 'Location',
              response: null,
              multiResponse: ['National', 'England'],
              responseType: GrantAdvertQuestionResponseType.LIST,
            },
          ],
        },
        {
          id: '3',
          title: 'Funding organisation',
          questions: [
            {
              id: 'grantFunder',
              title: 'Funding organisation',
              response: 'This is a grant funder',
              multiResponse: null,
              responseType: GrantAdvertQuestionResponseType.SHORT_TEXT,
            },
          ],
        },
        {
          id: '4',
          title: 'Who can apply',
          questions: [
            {
              id: 'grantApplicantType',
              title: 'Who can apply',
              response: null,
              multiResponse: ['Personal / Individual', 'Public Sector'],
              responseType: GrantAdvertQuestionResponseType.LIST,
            },
          ],
        },
      ],
    },
    {
      id: 'awardAmounts',
      title: '2. Award amounts',
      pages: [
        {
          id: '1',
          title: 'How much funding is available?',
          questions: [
            {
              id: 'grantTotalAwardAmount',
              title: 'Total amount of the grant',
              response: '£1 million',
              multiResponse: null,
              responseType: GrantAdvertQuestionResponseType.CURRENCY,
            },
            {
              id: 'grantMaximumAward',
              title: 'Maximum amount someone can apply for',
              response: '£1,211',
              multiResponse: null,
              responseType: GrantAdvertQuestionResponseType.CURRENCY,
            },
            {
              id: 'grantMinimumAward',
              title: 'Minimum amount someone can apply for',
              response: '£100',
              multiResponse: null,
              responseType: GrantAdvertQuestionResponseType.CURRENCY,
            },
          ],
        },
      ],
    },
    {
      id: 'applicationDates',
      title: '3. Application dates',
      pages: [
        {
          id: '1',
          title: 'Opening and closing dates',
          questions: [
            {
              id: 'grantApplicationOpenDate',
              title: 'Opening',
              response: null,
              multiResponse: ['5', '11', '2022', '10', '00'],
              responseType: GrantAdvertQuestionResponseType.DATE_TIME,
            },
            {
              id: 'grantApplicationCloseDate',
              title: 'Closing',
              response: null,
              multiResponse: ['10', '12', '2022', '18', '00'],
              responseType: GrantAdvertQuestionResponseType.DATE_TIME,
            },
          ],
        },
      ],
    },
    {
      id: 'howToApply',
      title: '4. How to apply',
      pages: [
        {
          id: '1',
          title: 'Link to application form',
          questions: [
            {
              id: 'grantWebpageUrl',
              title: "'Start new application' button links to:",
              response: 'https://www.find-government-grants.service.gov.uk/',
              multiResponse: null,
              responseType: GrantAdvertQuestionResponseType.SHORT_TEXT,
            },
          ],
        },
      ],
    },
    {
      id: 'furtherInformation',
      title: '5. Further information',
      pages: [
        {
          id: '1',
          title: 'Eligibility information',
          questions: [
            {
              id: 'grantEligibilityTab',
              title: 'Eligibility information',
              response: null,
              multiResponse: [
                '<h1>Heading 1</h1><p>Heading 1 Body Text</p><h2>Heading 2</h2><p>Heading 2 Body Text</p><h3>Heading 3</h3><p>Heading 3 Body Text</p><h4>Heading 4</h4><p>Heading 4 Body Text</p><h5>Heading 5</h5><p>Heading 5 Body Text</p><h6>Heading 6</h6><p>Heading 6 Body Text</p>',
                '{"nodeType":"document","data":{},"content":[{"nodeType":"heading-1","content":[{"nodeType":"text","value":"Heading 1","marks":[],"data":{}}],"data":{}},{"nodeType":"paragraph","content":[{"nodeType":"text","value":"Heading 1 Body Text","marks":[],"data":{}}],"data":{}},{"nodeType":"heading-2","content":[{"nodeType":"text","value":"Heading 2","marks":[],"data":{}}],"data":{}},{"nodeType":"paragraph","content":[{"nodeType":"text","value":"Heading 2 Body Text","marks":[],"data":{}}],"data":{}},{"nodeType":"heading-3","content":[{"nodeType":"text","value":"Heading 3","marks":[],"data":{}}],"data":{}},{"nodeType":"paragraph","content":[{"nodeType":"text","value":"Heading 3 Body Text","marks":[],"data":{}}],"data":{}},{"nodeType":"heading-4","content":[{"nodeType":"text","value":"Heading 4","marks":[],"data":{}}],"data":{}},{"nodeType":"paragraph","content":[{"nodeType":"text","value":"Heading 4 Body Text","marks":[],"data":{}}],"data":{}},{"nodeType":"heading-5","content":[{"nodeType":"text","value":"Heading 5","marks":[],"data":{}}],"data":{}},{"nodeType":"paragraph","content":[{"nodeType":"text","value":"Heading 5 Body Text","marks":[],"data":{}}],"data":{}},{"nodeType":"heading-6","content":[{"nodeType":"text","value":"Heading 6","marks":[],"data":{}}],"data":{}},{"nodeType":"paragraph","content":[{"nodeType":"text","value":"Heading 6 Body Text","marks":[],"data":{}}],"data":{}}]}',
              ],
              responseType: GrantAdvertQuestionResponseType.RICH_TEXT,
            },
          ],
        },
        {
          id: '2',
          title: 'Long description',
          questions: [
            {
              id: 'grantSummaryTab',
              title: 'Long description',
              response: 'Summary Info RICH TEXT TBD',
              multiResponse: null,
              responseType: GrantAdvertQuestionResponseType.RICH_TEXT,
            },
          ],
        },
        {
          id: '3',
          title: 'Relevant dates',
          questions: [
            {
              id: 'grantDatesTab',
              title: 'Relevant dates',
              response: 'Dates Info RICH TEXT TBD',
              multiResponse: null,
              responseType: GrantAdvertQuestionResponseType.RICH_TEXT,
            },
          ],
        },
        {
          id: '4',
          title: 'Scheme objectives',
          questions: [
            {
              id: 'grantObjectivesTab',
              title: 'Objectives of the grant',
              response: 'Objective Info RICH TEXT TBD',
              multiResponse: null,
              responseType: GrantAdvertQuestionResponseType.RICH_TEXT,
            },
          ],
        },
        {
          id: '5',
          title: 'How to apply',
          questions: [
            {
              id: 'grantApplyTab',
              title: 'How to apply',
              response: 'Apply Info RICH TEXT TBD',
              multiResponse: null,
              responseType: GrantAdvertQuestionResponseType.RICH_TEXT,
            },
          ],
        },
        {
          id: '6',
          title: 'Supporting information',
          questions: [
            {
              id: 'grantSupportingInfoTab',
              title: 'Supporting information',
              response: 'Supporting Info RICH TEXT TBD',
              multiResponse: null,
              responseType: GrantAdvertQuestionResponseType.RICH_TEXT,
            },
          ],
        },
      ],
    },
  ],
};

export const axiosError = {
  response: {
    data: {
      code: 'GRANT_ADVERT_NOT_FOUND',
    },
  },
};

export const dummyPublishedGrantAdvertDataWithAdvert: getAdvertStatusBySchemeIdResponse =
  {
    status: 200,
    data: {
      grantAdvertId: '2476958a-c9ab-447b-8b48-8b34b87dee0c',
      grantAdvertStatus: AdvertStatusEnum.PUBLISHED,
      contentfulSlug: 'some-contentful-slug',
    },
  };

export const dummyDraftGrantAdvertDataWithAdvert: getAdvertStatusBySchemeIdResponse =
  {
    status: 200,
    data: {
      grantAdvertId: '2476958a-c9ab-447b-8b48-8b34b87dee0c',
      grantAdvertStatus: AdvertStatusEnum.DRAFT,
      contentfulSlug: 'some-contentful-slug',
    },
  };

export const dummyScheduledGrantAdvertDataWithAdvert: getAdvertStatusBySchemeIdResponse =
  {
    status: 200,
    data: {
      grantAdvertId: '2476958a-c9ab-447b-8b48-8b34b87dee0c',
      grantAdvertStatus: AdvertStatusEnum.SCHEDULED,
      contentfulSlug: 'some-contentful-slug',
    },
  };
