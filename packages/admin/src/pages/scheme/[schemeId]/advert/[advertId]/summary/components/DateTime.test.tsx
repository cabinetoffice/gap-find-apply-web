import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  GrantAdvertQuestionResponseType,
  GrantAdvertSummaryPageSection,
  GrantAdvertSummaryPagePage,
  GrantAdvertSummaryPageQuestion,
} from '../../../../../../../types/GetSummaryPageContentResponse';
import { DateTime } from './DateTime';
import { getPageProps } from '../../../../../../../utils/UnitTestHelpers';
import AdvertStatusEnum from '../../../../../../../enums/AdvertStatus';

const schemeId = 'test-scheme-id';
const advertId = 'test-advert-id';

const question: GrantAdvertSummaryPageQuestion = {
  id: 'grantApplicationOpenDate',
  title: 'Grant Application Open',
  response: null,
  multiResponse: ['5', '11', '2022', '10', '00'],
  responseType: GrantAdvertQuestionResponseType.DATE_TIME,
};

const page: GrantAdvertSummaryPagePage = {
  id: '1',
  title: 'Grant Application Open',
  questions: [question],
};
const section: GrantAdvertSummaryPageSection = {
  id: 'grantDetails',
  title: '1. Grant Details',
  pages: [page],
};

const actionLink = `/apply/scheme/${schemeId}/advert/${advertId}/grantDetails/${page.id}`;

describe('DateTime component', () => {
  const getDefaultProps = (): Parameters<typeof DateTime>[0] => ({
    schemeId: schemeId,
    advertId: advertId,
    section: section,
    page: page,
    question: question,
    status: AdvertStatusEnum.DRAFT,
  });

  it('Display question response when present with Change action text', async () => {
    render(<DateTime {...getPageProps(getDefaultProps)} />);

    const term = screen.getAllByRole('term');
    const definition = screen.getAllByRole('definition');
    const links = screen.getAllByRole('link');

    expect(term[0]).toHaveTextContent(`${question.title}`);
    expect(definition[0]).toHaveTextContent('5 November 2022');
    expect(links[0]).toHaveTextContent('Change');
    expect(links[0]).toHaveAccessibleName(
      'Change response for Grant Application Open date question'
    );
    expect(links[0]).toHaveAttribute('href', actionLink);

    expect(term[1]).toHaveTextContent(`${question.title}`);
    expect(definition[2]).toHaveTextContent('10:00am');
    expect(links[1]).toHaveTextContent('Change');
    expect(links[1]).toHaveAccessibleName(
      'Change response for Grant Application Open time question'
    );
    expect(links[1]).toHaveAttribute('href', actionLink);
  });

  it('Display no text when question response is blank with Add action text', async () => {
    render(
      <DateTime
        {...getPageProps(getDefaultProps, {
          question: { multiResponse: null },
        })}
      />
    );

    const term = screen.getAllByRole('term');
    const definition = screen.getAllByRole('definition');
    const links = screen.getAllByRole('link');

    expect(term[0]).toHaveTextContent(`${question.title}`);
    expect(definition[0]).toHaveTextContent('');
    expect(links[0]).toHaveTextContent('Add');
    expect(links[0]).toHaveAccessibleName(
      'Add response for Grant Application Open date question'
    );
    expect(links[0]).toHaveAttribute('href', actionLink);

    expect(term[1]).toHaveTextContent(`${question.title}`);
    expect(definition[2]).toHaveTextContent('');
    expect(links[1]).toHaveTextContent('Add');
    expect(links[1]).toHaveAccessibleName(
      'Add response for Grant Application Open time question'
    );
    expect(links[1]).toHaveAttribute('href', actionLink);
  });

  it('Should render the page description text, status: DRAFT', () => {
    render(<DateTime {...getPageProps(getDefaultProps)} />);
    screen.getByRole('link', {
      name: 'Add response for Grant Application Open date question',
    });
    screen.getByRole('link', {
      name: 'Add response for Grant Application Open time question',
    });
  });

  it('Should render the page description text, status: UNPUBLISHED', () => {
    render(
      <DateTime
        {...getPageProps(getDefaultProps, {
          status: AdvertStatusEnum.UNPUBLISHED,
        })}
      />
    );
    screen.getByRole('link', {
      name: 'Add response for Grant Application Open date question',
    });
    screen.getByRole('link', {
      name: 'Add response for Grant Application Open time question',
    });
  });

  it('Should render the page description text, status: UNSCHEDULED', () => {
    render(
      <DateTime
        {...getPageProps(getDefaultProps, {
          status: AdvertStatusEnum.UNSCHEDULED,
        })}
      />
    );
    screen.getByRole('link', {
      name: 'Add response for Grant Application Open date question',
    });
    screen.getByRole('link', {
      name: 'Add response for Grant Application Open time question',
    });
  });

  it('Should render the page description text, status: PUBLISHED', () => {
    render(
      <DateTime
        {...getPageProps(getDefaultProps, {
          status: AdvertStatusEnum.PUBLISHED,
        })}
      />
    );
    expect(
      screen.queryByRole('link', {
        name: 'Add response for Grant Application Open date question',
      })
    ).toBeFalsy();
    expect(
      screen.queryByRole('link', {
        name: 'Add response for Grant Application Open time question',
      })
    ).toBeFalsy();
  });

  it('Should render the page description text, status: SCHEDULED', () => {
    render(
      <DateTime
        {...getPageProps(getDefaultProps, {
          status: AdvertStatusEnum.SCHEDULED,
        })}
      />
    );
    expect(
      screen.queryByRole('link', {
        name: 'Add response for Grant Application Open date question',
      })
    ).toBeFalsy();
    expect(
      screen.queryByRole('link', {
        name: 'Add response for Grant Application Open time question',
      })
    ).toBeFalsy();
  });
});
