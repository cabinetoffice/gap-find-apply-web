import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  GrantAdvertQuestionResponseType,
  GrantAdvertSummaryPageSection,
  GrantAdvertSummaryPagePage,
  GrantAdvertSummaryPageQuestion,
} from '../../../../../../../types/GetSummaryPageContentResponse';
import { List } from './List';
import { getPageProps } from '../../../../../../../utils/UnitTestHelpers';
import AdvertStatusEnum from '../../../../../../../enums/AdvertStatus';

const schemeId = 'test-scheme-id';
const advertId = 'test-advert-id';

const question: GrantAdvertSummaryPageQuestion = {
  id: 'grantLocation',
  title: 'Grant Location',
  response: null,
  multiResponse: ['National', 'England'],
  responseType: GrantAdvertQuestionResponseType.LIST,
};

const page: GrantAdvertSummaryPagePage = {
  id: '1',
  title: 'Grant Location',
  questions: [question],
};

const section: GrantAdvertSummaryPageSection = {
  id: 'grantDetails',
  title: '1. Grant Details',
  pages: [page],
};

const actionLink = `/apply/scheme/${schemeId}/advert/${advertId}/grantDetails/${page.id}`;

describe('List component', () => {
  const getDefaultProps = (): Parameters<typeof List>[0] => ({
    schemeId: schemeId,
    advertId: advertId,
    section: section,
    page: page,
    question: question,
    status: AdvertStatusEnum.DRAFT,
  });

  it('Display question response when present with Change action text', async () => {
    render(<List {...getPageProps(getDefaultProps)} />);

    const term = screen.getByRole('term');
    const definition = screen.getAllByRole('definition');
    const link = screen.getByRole('link');

    expect(term).toHaveTextContent(question.title);
    expect(definition[0].childNodes[0]).toHaveTextContent(
      question.multiResponse?.at(0) as string
    );
    expect(definition[0].childNodes[1]).toHaveTextContent(
      question.multiResponse?.at(1) as string
    );
    expect(link).toHaveTextContent('Change');
    expect(link).toHaveAccessibleName(
      'Change response for Grant Location question'
    );
    expect(link).toHaveAttribute('href', actionLink);
  });

  it('Display no text when question response is blank with Add action text', async () => {
    render(
      <List
        {...getPageProps(getDefaultProps, {
          question: { multiResponse: null },
        })}
      />
    );

    const term = screen.getByRole('term');
    const definition = screen.getAllByRole('definition');
    const link = screen.getByRole('link');

    expect(term).toHaveTextContent(question.title);
    expect(definition[0]).toHaveTextContent('');
    expect(link).toHaveTextContent('Add');
    expect(link).toHaveAccessibleName(
      'Add response for Grant Location question'
    );
    expect(link).toHaveAttribute('href', actionLink);
  });

  it('Should render the page description text, status: DRAFT', () => {
    render(<List {...getPageProps(getDefaultProps)} />);
    screen.getByRole('link', {
      name: 'Add response for Grant Location question',
    });
  });

  it('Should render the page description text, status: UNPUBLISHED', () => {
    render(
      <List
        {...getPageProps(getDefaultProps, {
          status: AdvertStatusEnum.UNPUBLISHED,
        })}
      />
    );
    screen.getByRole('link', {
      name: 'Add response for Grant Location question',
    });
  });

  it('Should render the page description text, status: UNSCHEDULED', () => {
    render(
      <List
        {...getPageProps(getDefaultProps, {
          status: AdvertStatusEnum.UNSCHEDULED,
        })}
      />
    );
    screen.getByRole('link', {
      name: 'Add response for Grant Location question',
    });
  });

  it('Should render the page description text, status: PUBLISHED', () => {
    render(
      <List
        {...getPageProps(getDefaultProps, {
          status: AdvertStatusEnum.PUBLISHED,
        })}
      />
    );
    expect(
      screen.queryByRole('link', {
        name: 'Add response for Grant Location question',
      })
    ).toBeFalsy();
  });

  it('Should render the page description text, status: SCHEDULED', () => {
    render(
      <List
        {...getPageProps(getDefaultProps, {
          status: AdvertStatusEnum.SCHEDULED,
        })}
      />
    );
    expect(
      screen.queryByRole('link', {
        name: 'Add response for Grant Location question',
      })
    ).toBeFalsy();
  });
});
