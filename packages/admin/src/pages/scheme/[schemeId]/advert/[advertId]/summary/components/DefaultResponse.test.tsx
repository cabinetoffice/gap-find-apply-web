import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  GrantAdvertQuestionResponseType,
  GrantAdvertSummaryPageSection,
  GrantAdvertSummaryPagePage,
  GrantAdvertSummaryPageQuestion,
} from '../../../../../../../types/GetSummaryPageContentResponse';
import { DefaultResponse } from './DefaultResponse';
import { getPageProps } from '../../../../../../../utils/UnitTestHelpers';
import AdvertStatusEnum from '../../../../../../../enums/AdvertStatus';

const schemeId = 'test-scheme-id';
const advertId = 'test-advert-id';

const question: GrantAdvertSummaryPageQuestion = {
  id: 'grantShortDescription',
  title: 'Short description',
  response: 'This is a short description',
  multiResponse: null,
  responseType: GrantAdvertQuestionResponseType.INTEGER,
};

const page: GrantAdvertSummaryPagePage = {
  id: '1',
  title: 'Short description',
  questions: [question],
};

const section: GrantAdvertSummaryPageSection = {
  id: 'grantDetails',
  title: '1. Grant Details',
  pages: [page],
};

const actionLink = `/apply/scheme/${schemeId}/advert/${advertId}/grantDetails/${page.id}`;

describe('DefaultResponse component', () => {
  const getDefaultProps = (): Parameters<typeof DefaultResponse>[0] => ({
    schemeId: schemeId,
    advertId: advertId,
    section: section,
    page: page,
    question: question,
    status: AdvertStatusEnum.DRAFT,
  });

  it('Display question response when present with Change action text', async () => {
    render(<DefaultResponse {...getPageProps(getDefaultProps)} />);

    const term = screen.getByRole('term');
    const definition = screen.getAllByRole('definition');
    const link = screen.getByRole('link');

    expect(term).toHaveTextContent(question.title);
    expect(definition[0]).toHaveTextContent(question.response as string);
    expect(link).toHaveTextContent('Change');
    expect(link).toHaveAccessibleName(
      'Change response for Short description question'
    );
    expect(link).toHaveAttribute('href', actionLink);
  });

  it('Display no text when question response is blank with Add action text', async () => {
    render(
      <DefaultResponse
        {...getPageProps(getDefaultProps, {
          question: { response: null },
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
      'Add response for Short description question'
    );
    expect(link).toHaveAttribute('href', actionLink);
  });

  it('Should render the page description text, status: DRAFT', () => {
    render(<DefaultResponse {...getPageProps(getDefaultProps)} />);
    screen.getByRole('link', {
      name: 'Add response for Short description question',
    });
  });

  it('Should render the page description text, status: UNPUBLISHED', () => {
    render(
      <DefaultResponse
        {...getPageProps(getDefaultProps, {
          status: AdvertStatusEnum.UNPUBLISHED,
        })}
      />
    );
    screen.getByRole('link', {
      name: 'Add response for Short description question',
    });
  });

  it('Should render the page description text, status: UNSCHEDULED', () => {
    render(
      <DefaultResponse
        {...getPageProps(getDefaultProps, {
          status: AdvertStatusEnum.UNSCHEDULED,
        })}
      />
    );
    screen.getByRole('link', {
      name: 'Add response for Short description question',
    });
  });

  it('Should render the page description text, status: PUBLISHED', () => {
    render(
      <DefaultResponse
        {...getPageProps(getDefaultProps, {
          status: AdvertStatusEnum.PUBLISHED,
        })}
      />
    );
    expect(
      screen.queryByRole('link', {
        name: 'Add response for Short description question',
      })
    ).toBeFalsy();
  });

  it('Should render the page description text, status: SCHEDULED', () => {
    render(
      <DefaultResponse
        {...getPageProps(getDefaultProps, {
          status: AdvertStatusEnum.SCHEDULED,
        })}
      />
    );
    expect(
      screen.queryByRole('link', {
        name: 'Add response for Short description question',
      })
    ).toBeFalsy();
  });
});
