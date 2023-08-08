import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Scheme from '../../types/Scheme';
import SchemeList, {
  generateSchemeTableRows,
  getServerSideProps,
} from './index.page';
import { getUserSchemes } from '../../services/SchemeService';
import CustomLink from '../../components/custom-link/CustomLink';

jest.mock('next/config', () => () => {
  return {
    serverRuntimeConfig: {
      backendHost: 'http://localhost:8080',
    },
    publicRuntimeConfig: {
      SUB_PATH: '/apply',
      APPLICANT_DOMAIN: 'http://localhost:8080',
    },
  };
});
jest.mock('../../services/SchemeService');

const mockSchemeList: Scheme[] = [
  {
    name: 'Scheme name 1',
    schemeId: '123',
    ggisReference: 'ggisReference',
    funderId: '4567',
    createdDate: '2011-12-10T14:48:00',
  },
  {
    name: 'Scheme name 2',
    schemeId: '456',
    ggisReference: 'ggisReference',
    funderId: '4562467',
    createdDate: '2011-10-10T14:48:00',
  },
];

const schemesPageComponent = <SchemeList schemes={mockSchemeList} />;

describe('SchemeList', () => {
  describe('getServerSideProps', () => {
    const mockedGetUserSchemes = getUserSchemes as jest.MockedFn<
      typeof getUserSchemes
    >;

    it('Should return a list of schemes', async () => {
      mockedGetUserSchemes.mockResolvedValue(mockSchemeList);

      const result = await getServerSideProps({
        req: { cookies: { 'gap-test': 'testSessionId' } },
      } as any);

      expect(result).toStrictEqual({ props: { schemes: mockSchemeList } });
    });
  });

  it('Should render a page title', () => {
    render(schemesPageComponent);
    screen.getByRole('heading', { name: 'All grants' });
  });

  it('Should render a page description', () => {
    render(schemesPageComponent);
    screen.getByText(
      'The list below shows all of the grants for your account.'
    );
  });

  describe('generateSchemeTableRows', () => {
    it('Should create an array of table rows when schemes are passed in', () => {
      const result = generateSchemeTableRows({ schemes: mockSchemeList });
      expect(result).toStrictEqual([
        {
          cells: [
            {
              content: 'Scheme name 1',
            },
            { content: '10 December 2011' },
            {
              content: (
                <CustomLink
                  href="/scheme/123"
                  dataCy="cy_linkToScheme_Scheme name 1"
                  ariaLabel="View scheme Scheme name 1"
                >
                  View
                </CustomLink>
              ),
            },
          ],
        },
        {
          cells: [
            {
              content: 'Scheme name 2',
            },
            { content: '10 October 2011' },
            {
              content: (
                <CustomLink
                  href="/scheme/456"
                  dataCy="cy_linkToScheme_Scheme name 2"
                  ariaLabel="View scheme Scheme name 2"
                >
                  View
                </CustomLink>
              ),
            },
          ],
        },
      ]);
    });
  });
});
