import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  GrantAdvertQuestionResponseType,
  GrantAdvertSummaryPageSection,
  GrantAdvertSummaryPagePage,
  GrantAdvertSummaryPageQuestion,
} from '../../../../../../../types/GetSummaryPageContentResponse';
import { RichText } from './RichText';
import { getPageProps } from '../../../../../../../testUtils/unitTestHelpers';
import AdvertStatusEnum from '../../../../../../../enums/AdvertStatus';
const schemeId = 'test-scheme-id';
const advertId = 'test-advert-id';

const question: GrantAdvertSummaryPageQuestion = {
  id: 'grantEligibilityTab',
  title: 'Grant Eligibility Tab',
  response: null,
  multiResponse: [
    '<h1>Heading 1</h1><p>Heading 1 Body Text</p><h2>Heading 2</h2><p>Heading 2 Body Text</p><h3>Heading 3</h3><p>Heading 3 Body Text</p><h4>Heading 4</h4><p>Heading 4 Body Text</p><h5>Heading 5</h5><p>Heading 5 Body Text</p><h6>Heading 6</h6><p>Heading 6 Body Text</p>',
    '{"nodeType":"document","data":{},"content":[{"nodeType":"heading-1","content":[{"nodeType":"text","value":"Heading 1","marks":[],"data":{}}],"data":{}},{"nodeType":"paragraph","content":[{"nodeType":"text","value":"Heading 1 Body Text","marks":[],"data":{}}],"data":{}},{"nodeType":"heading-2","content":[{"nodeType":"text","value":"Heading 2","marks":[],"data":{}}],"data":{}},{"nodeType":"paragraph","content":[{"nodeType":"text","value":"Heading 2 Body Text","marks":[],"data":{}}],"data":{}},{"nodeType":"heading-3","content":[{"nodeType":"text","value":"Heading 3","marks":[],"data":{}}],"data":{}},{"nodeType":"paragraph","content":[{"nodeType":"text","value":"Heading 3 Body Text","marks":[],"data":{}}],"data":{}},{"nodeType":"heading-4","content":[{"nodeType":"text","value":"Heading 4","marks":[],"data":{}}],"data":{}},{"nodeType":"paragraph","content":[{"nodeType":"text","value":"Heading 4 Body Text","marks":[],"data":{}}],"data":{}},{"nodeType":"heading-5","content":[{"nodeType":"text","value":"Heading 5","marks":[],"data":{}}],"data":{}},{"nodeType":"paragraph","content":[{"nodeType":"text","value":"Heading 5 Body Text","marks":[],"data":{}}],"data":{}},{"nodeType":"heading-6","content":[{"nodeType":"text","value":"Heading 6","marks":[],"data":{}}],"data":{}},{"nodeType":"paragraph","content":[{"nodeType":"text","value":"Heading 6 Body Text","marks":[],"data":{}}],"data":{}}]}',
  ],
  responseType: GrantAdvertQuestionResponseType.RICH_TEXT,
};

const page: GrantAdvertSummaryPagePage = {
  id: '1',
  title: 'Grant Eligibility Tab',
  questions: [question],
};

const section: GrantAdvertSummaryPageSection = {
  id: 'furtherInformation',
  title: '5. Further information',
  pages: [page],
};

const actionLink = `/apply/admin/scheme/${schemeId}/advert/${advertId}/furtherInformation/${page.id}`;

describe('RichText component', () => {
  const getDefaultProps = (): Parameters<typeof RichText>[0] => ({
    schemeId: schemeId,
    advertId: advertId,
    section: section,
    page: page,
    question: question,
    status: AdvertStatusEnum.DRAFT,
  });

  it('Display question response when present with Change action text', async () => {
    render(<RichText {...getPageProps(getDefaultProps)} />);

    const term = screen.getByRole('term');
    const definition = screen.getAllByRole('definition');
    const link = screen.getByRole('link');

    expect(term).toHaveTextContent(question.title as string);
    expect(definition[0]).toHaveTextContent(
      'Heading 1Heading 1 Body TextHeading 2Heading 2 Body TextHeading 3Heading 3 Body TextHeading 4Heading 4 Body TextHeading 5Heading 5 Body TextHeading 6Heading 6 Body Text'
    );

    //Check Headings are replaced with boild paragraphs
    for (const heading of [
      'Heading 1',
      'Heading 2',
      'Heading 3',
      'Heading 4',
      'Heading 5',
      'Heading 6',
    ]) {
      const headingElement = screen.getByText(heading);
      expect(headingElement).toHaveTextContent(heading);
      expect(headingElement.tagName).toBe('P');
      expect(headingElement).toHaveClass('govuk-!-font-weight-bold');
    }

    expect(link).toHaveTextContent('Change');
    expect(link).toHaveAccessibleName(
      'Change response for Grant Eligibility Tab question'
    );
    expect(link).toHaveAttribute('href', actionLink);
  });

  it('Display no text when question response is blank with Add action text', async () => {
    render(
      <RichText
        {...getPageProps(getDefaultProps, {
          question: { multiResponse: null },
        })}
      />
    );

    const term = screen.getByRole('term');
    const definition = screen.getAllByRole('definition');
    const link = screen.getByRole('link');

    expect(term).toHaveTextContent(question.title as string);
    expect(definition[0]).toHaveTextContent('');
    expect(link).toHaveTextContent('Add');
    expect(link).toHaveAccessibleName(
      'Add response for Grant Eligibility Tab question'
    );
    expect(link).toHaveAttribute('href', actionLink);
  });

  it('Should display no text and "Add" action text when question response is empty string ', async () => {
    render(
      <RichText
        {...getPageProps(getDefaultProps, {
          question: {
            multiResponse: [
              '',
              '{"nodeType":"document","data":{},"content":[]}',
            ],
          },
        })}
      />
    );

    const term = screen.getByRole('term');
    const definition = screen.getAllByRole('definition');
    const link = screen.getByRole('link');

    expect(term).toHaveTextContent(question.title as string);
    expect(definition[0]).toHaveTextContent('');
    expect(link).toHaveTextContent('Add');
    expect(link).toHaveAccessibleName(
      'Add response for Grant Eligibility Tab question'
    );
    expect(link).toHaveAttribute('href', actionLink);
  });

  it('Should render the page description text, status: DRAFT', () => {
    render(<RichText {...getPageProps(getDefaultProps)} />);
    screen.getByRole('link', {
      name: 'Add response for Grant Eligibility Tab question',
    });
  });

  it('Should render the page description text, status: UNPUBLISHED', () => {
    render(
      <RichText
        {...getPageProps(getDefaultProps, {
          status: AdvertStatusEnum.UNPUBLISHED,
        })}
      />
    );
    screen.getByRole('link', {
      name: 'Add response for Grant Eligibility Tab question',
    });
  });

  it('Should render the page description text, status: UNSCHEDULED', () => {
    render(
      <RichText
        {...getPageProps(getDefaultProps, {
          status: AdvertStatusEnum.UNSCHEDULED,
        })}
      />
    );
    screen.getByRole('link', {
      name: 'Add response for Grant Eligibility Tab question',
    });
  });

  it('Should render the page description text, status: PUBLISHED', () => {
    render(
      <RichText
        {...getPageProps(getDefaultProps, {
          status: AdvertStatusEnum.PUBLISHED,
        })}
      />
    );
    expect(
      screen.queryByRole('link', {
        name: 'Add response for Grant Eligibility Tab question',
      })
    ).toBeFalsy();
  });

  it('Should render the page description text, status: SCHEDULED', () => {
    render(
      <RichText
        {...getPageProps(getDefaultProps, {
          status: AdvertStatusEnum.SCHEDULED,
        })}
      />
    );
    expect(
      screen.queryByRole('link', {
        name: 'Add response for Grant Eligibility Tab question',
      })
    ).toBeFalsy();
  });
});
