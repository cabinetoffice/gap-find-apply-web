import { getGrantAdvertPublishInformationBySchemeId } from '../../../../../services/AdvertPageService';
import '@testing-library/jest-dom';
import ErrorMultipleEditorsPage, {
  getServerSideProps,
} from './error-multiple-editors.page';
import { getSessionIdFromCookies } from '../../../../../utils/session';
import { render, screen } from '@testing-library/react';

jest.mock('../../../../../services/AdvertPageService');
jest.mock('../../../../../utils/session');

const mockGetGrantAdvertPublishInformationBySchemeId = jest.mocked(
  getGrantAdvertPublishInformationBySchemeId
);

(getSessionIdFromCookies as jest.Mock).mockReturnValue('sessionId');

describe('getServerSideProps', () => {
  it('should return the correct props when advert is published', async () => {
    const mockData = {
      data: {
        contentfulSlug: 'advert',
        grantAdvertStatus: 'PUBLISHED',
        lastUpdated: '2024-03-13T12:00:00Z',
        lastUpdatedByEmail: 'test@test.gov',
      },
    };

    mockGetGrantAdvertPublishInformationBySchemeId.mockResolvedValue(mockData);
    const mockContext = {
      params: { schemeId: 'schemeId', advertId: 'advertId' },
    };

    const props = await getServerSideProps(mockContext);
    expect(mockGetGrantAdvertPublishInformationBySchemeId).toHaveBeenCalledWith(
      undefined,
      undefined,
      'schemeId'
    );
    expect(props).toEqual({
      props: {
        backToAccountLink: '/scheme/schemeId/advert/advertId/section-overview',
        linkToAdvertInFindAGrant: `${process.env.FIND_A_GRANT_URL}/grants/advert`,
        isPublished: true,
        lastEditedDate: '2024-03-13T12:00:00Z',
        editorEmail: 'test@test.gov',
      },
    });
  });
});

const defaultProps = {
  backToAccountLink: '/section-overview',
  linkToAdvertInFindAGrant: '/advert-link',
  isPublished: true,
  lastEditedDate: '2024-03-13T12:00:00Z',
  editorEmail: 'test@test.gov',
};

const renderComponent = (props = {}) => {
  const mergedProps = { ...defaultProps, ...props };
  return render(<ErrorMultipleEditorsPage {...mergedProps} />);
};

describe('Error page', () => {
  it('should render the correct header', () => {
    renderComponent();
    expect(
      screen.getByRole('heading', { name: 'Your changes could not be saved' })
    ).toBeInTheDocument();
  });

  it('should have the right content for a published advert', () => {
    renderComponent();
    expect(
      screen.getByText(
        'Another editor has published your advert, so your changes could not be saved.'
      )
    ).toBeInTheDocument();
  });

  it('should have the right content for a scheduled advert', () => {
    renderComponent({ isPublished: false });
    expect(
      screen.getByText(
        'Another editor has scheduled your advert to go live, so your changes could not be saved.'
      )
    ).toBeInTheDocument();
  });

  it('should include and email and time', () => {
    renderComponent();
    expect(
      screen.getByText(
        'The last edit was made by test@test.gov on 13 March 2024 at 12:00pm.'
      )
    ).toBeInTheDocument();
  });
});
