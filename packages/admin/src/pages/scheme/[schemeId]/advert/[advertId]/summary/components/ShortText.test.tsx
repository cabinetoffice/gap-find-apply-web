import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  GrantAdvertQuestionResponseType,
  GrantAdvertSummaryPageSection,
  GrantAdvertSummaryPagePage,
  GrantAdvertSummaryPageQuestion,
} from '../../../../../../../types/GetSummaryPageContentResponse';
import { ShortText } from './ShortText';
import { getPageProps } from '../../../../../../../testUtils/unitTestHelpers';
import AdvertStatusEnum from '../../../../../../../enums/AdvertStatus';
const schemeId = 'test-scheme-id';
const advertId = 'test-advert-id';

const question: GrantAdvertSummaryPageQuestion = {
  id: 'grantShortDescription',
  title: 'Short description',
  response: 'This is a short description',
  multiResponse: null,
  responseType: GrantAdvertQuestionResponseType.SHORT_TEXT,
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

const actionLink = `/apply/admin/scheme/${schemeId}/advert/${advertId}/grantDetails/${page.id}`;

describe('ShortText component', () => {
  const getDefaultProps = (): Parameters<typeof ShortText>[0] => ({
    schemeId: schemeId,
    advertId: advertId,
    section: section,
    page: page,
    question: question,
    status: AdvertStatusEnum.DRAFT,
  });

  it('Display question response when present with Change action text', async () => {
    render(<ShortText {...getPageProps(getDefaultProps)} />);

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
      <ShortText
        {...getPageProps(getDefaultProps, { question: { response: null } })}
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

  it('Display grantWebpageUrl question response as URL when present with Change action text', async () => {
    render(
      <ShortText
        {...getPageProps(getDefaultProps, {
          question: {
            id: 'grantWebpageUrl',
            title: 'Grant Advert URL',
            response: 'https://www.find-government-grants.service.gov.uk/',
          },
        })}
      />
    );

    const term = screen.getByRole('term');
    const definition = screen.getAllByRole('definition');
    const links = screen.getAllByRole('link');

    expect(term).toHaveTextContent(question.title);
    expect(definition[0]).toHaveTextContent(question.response as string);
    expect(links[0]).toHaveTextContent(question.response as string);
    expect(links[0]).toHaveAttribute('href', question.response);
    expect(links[1]).toHaveTextContent('Change');
    expect(links[1]).toHaveAccessibleName(
      'Change response for Grant Advert URL question'
    );
    expect(links[1]).toHaveAttribute('href', actionLink);
  });

  it('Display grantWebpageUrl question response as empty when not present with Add action text', async () => {
    render(
      <ShortText
        {...getPageProps(getDefaultProps, {
          question: {
            response: null,
          },
        })}
      />
    );

    const term = screen.getByRole('term');
    const definition = screen.getAllByRole('definition');
    const link = screen.getByRole('link');

    expect(term).toHaveTextContent(question.title);
    expect(definition[0]).toHaveTextContent(
      '!WarningYou have not added a link. You should add a link so applicants know where to go after they have read your advert.'
    );
    expect(link).toHaveTextContent('Add');
    expect(link).toHaveAccessibleName(
      'Add response for Grant Advert URL question'
    );
    expect(link).toHaveAttribute('href', actionLink);
  });

  it('Should render the page description text, status: DRAFT', () => {
    render(<ShortText {...getPageProps(getDefaultProps)} />);
    screen.getByRole('link', {
      name: 'Add response for Grant Advert URL question',
    });
  });

  it('Should render the page description text, status: UNPUBLISHED', () => {
    render(
      <ShortText
        {...getPageProps(getDefaultProps, {
          status: AdvertStatusEnum.UNPUBLISHED,
        })}
      />
    );
    screen.getByRole('link', {
      name: 'Add response for Grant Advert URL question',
    });
  });

  it('Should render the page description text, status: UNSCHEDULED', () => {
    render(
      <ShortText
        {...getPageProps(getDefaultProps, {
          status: AdvertStatusEnum.UNSCHEDULED,
        })}
      />
    );
    screen.getByRole('link', {
      name: 'Add response for Grant Advert URL question',
    });
  });

  it('Should render the page description text, status: PUBLISHED', () => {
    render(
      <ShortText
        {...getPageProps(getDefaultProps, {
          status: AdvertStatusEnum.PUBLISHED,
        })}
      />
    );
    expect(
      screen.queryByRole('link', {
        name: 'Add response for Grant Advert URL question',
      })
    ).toBeFalsy();
  });

  it('Should render the page description text, status: SCHEDULED', () => {
    render(
      <ShortText
        {...getPageProps(getDefaultProps, {
          status: AdvertStatusEnum.SCHEDULED,
        })}
      />
    );
    expect(
      screen.queryByRole('link', {
        name: 'Add response for Grant Advert URL question',
      })
    ).toBeFalsy();
  });
});
