import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  GrantAdvertQuestionResponseType,
  GrantAdvertSummaryPageSection,
  GrantAdvertSummaryPagePage,
  GrantAdvertSummaryPageQuestion,
} from '../../../../../../../types/GetSummaryPageContentResponse';
import { Date } from './Date';
import { getPageProps } from '../../../../../../../testUtils/unitTestHelpers';
import AdvertStatusEnum from '../../../../../../../enums/AdvertStatus';

const schemeId = 'test-scheme-id';
const advertId = 'test-advert-id';

const question: GrantAdvertSummaryPageQuestion = {
  id: 'grantApplicationOpenDate',
  title: 'Grant Application Open',
  response: null,
  multiResponse: ['5', '11', '2022', '10', '00'],
  summarySuffixText: 'Advert opening date',
  responseType: GrantAdvertQuestionResponseType.DATE,
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

describe('Date component', () => {
  const getDefaultProps = (): Parameters<typeof Date>[0] => ({
    schemeId: schemeId,
    advertId: advertId,
    section: section,
    page: page,
    question: question,
    status: AdvertStatusEnum.DRAFT,
  });

  it('Display question response when present with Change action text (hide time /w past date)', async () => {
    render(<Date {...getPageProps(getDefaultProps)} />);

    const term = screen.getAllByRole('term');
    const definition = screen.getAllByRole('definition');
    const links = screen.getAllByRole('link');

    expect(term[0]).toHaveTextContent(`${question.title}`);
    expect(term[0]).toHaveTextContent(`Advert opening date`);
    expect(definition[0]).toHaveTextContent('5 November 2022');
    expect(definition[0]).not.toHaveTextContent('10:00am');
    expect(links[0]).toHaveTextContent('Change');
    expect(links[0]).toHaveAccessibleName(
      'Change response for Grant Application Open date question'
    );
    expect(links[0]).toHaveAttribute('href', actionLink);
  });

  it('Display question response when present with Change action text (display time /w future date)', async () => {
    render(
      <Date
        {...getPageProps(getDefaultProps, {
          question: { multiResponse: ['5', '11', '2099', '10', '00'] },
        })}
      />
    );

    const term = screen.getAllByRole('term');
    const definition = screen.getAllByRole('definition');
    const links = screen.getAllByRole('link');

    expect(term[0]).toHaveTextContent(`${question.title}`);
    expect(term[0]).toHaveTextContent(`Advert opening date`);
    expect(definition[0]).toHaveTextContent('5 November 2099, 10:00 AM');
    expect(links[0]).toHaveTextContent('Change');
    expect(links[0]).toHaveAccessibleName(
      'Change response for Grant Application Open date question'
    );
    expect(links[0]).toHaveAttribute('href', actionLink);
  });

  it('Display no text when question response is blank with Add action text', async () => {
    render(
      <Date
        {...getPageProps(getDefaultProps, {
          question: { multiResponse: null },
        })}
      />
    );

    screen.getAllByRole('term');
    const definition = screen.getAllByRole('definition');
    const links = screen.getAllByRole('link');

    expect(definition[0]).toHaveTextContent('');
    expect(links[0]).toHaveTextContent('Add');
    expect(links[0]).toHaveAccessibleName(
      'Add response for Grant Application Open date question'
    );
    expect(links[0]).toHaveAttribute('href', actionLink);
  });

  it('Should render the page description text, status: DRAFT', () => {
    render(<Date {...getPageProps(getDefaultProps)} />);
    screen.getByRole('link', {
      name: 'Add response for Grant Application Open date question',
    });
  });

  it('Should render the page description text, status: UNPUBLISHED', () => {
    render(
      <Date
        {...getPageProps(getDefaultProps, {
          status: AdvertStatusEnum.UNPUBLISHED,
        })}
      />
    );
    screen.getByRole('link', {
      name: 'Add response for Grant Application Open date question',
    });
  });

  it('Should render the page description text, status: UNSCHEDULED', () => {
    render(
      <Date
        {...getPageProps(getDefaultProps, {
          status: AdvertStatusEnum.UNSCHEDULED,
        })}
      />
    );
    screen.getByRole('link', {
      name: 'Add response for Grant Application Open date question',
    });
  });

  it('Should render the page description text, status: PUBLISHED', () => {
    render(
      <Date
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
  });

  it('Should render the page description text, status: SCHEDULED', () => {
    render(
      <Date
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
  });
});
