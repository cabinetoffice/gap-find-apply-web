import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import CustomLink from '../../components/custom-link/CustomLink';
import Scheme from '../../types/Scheme';
import ManageGrantSchemes, {
  generateSchemeTableRows,
} from './ManageGrantSchemes';

jest.mock('../../services/SchemeService');

const mockSchemeList: Scheme[] = [
  {
    name: 'Scheme name 1',
    schemeId: '123',
    ggisReference: 'ggisReference',
    funderId: '4567',
    createdDate: '2011-12-10T14:48:00',
    lastUpdatedBy: 'test@admin.com',
    lastUpdatedDate: '2011-12-10T15:00:00',
  },
  {
    name: 'Scheme name 2',
    schemeId: '456',
    ggisReference: 'ggisReference',
    funderId: '4562467',
    createdDate: '2011-10-10T14:48:00',
    lastUpdatedBy: 'test2@admin.com',
    lastUpdatedDate: '2011-10-10T15:00:00',
  },
];

const tableHeading = 'Grants you own';

describe('ManageGrantSchemes', () => {
  describe('generateSchemeTableRows', () => {
    it('Should create an array of table rows when schemes are passed in', () => {
      const result = generateSchemeTableRows({ schemes: mockSchemeList });
      expect(result).toStrictEqual([
        {
          cells: [
            {
              content: (
                <CustomLink
                  href="/scheme/123"
                  dataCy="cy_linkToScheme_Scheme name 1"
                  ariaLabel="View scheme Scheme name 1"
                >
                  Scheme name 1
                </CustomLink>
              ),
            },
            { content: '10 December 2011, 2:48pm' },
            { content: '10 December 2011, 3:00pm' },
            { content: 'test@admin.com' },
          ],
        },
        {
          cells: [
            {
              content: (
                <CustomLink
                  href="/scheme/456"
                  dataCy="cy_linkToScheme_Scheme name 2"
                  ariaLabel="View scheme Scheme name 2"
                >
                  Scheme name 2
                </CustomLink>
              ),
            },
            { content: '10 October 2011, 2:48pm' },
            { content: '10 October 2011, 3:00pm' },
            { content: 'test2@admin.com' },
          ],
        },
      ]);
    });
  });

  describe('ManageGrantSchemes', () => {
    it('should render the table with the correct heading', () => {
      render(
        <ManageGrantSchemes
          schemes={mockSchemeList}
          tableHeading={tableHeading}
        />
      );

      screen.getByRole('table', { name: tableHeading });
    });

    it('should render the table headings', () => {
      render(
        <ManageGrantSchemes
          schemes={mockSchemeList}
          tableHeading={tableHeading}
        />
      );

      screen.getByRole('columnheader', { name: 'Grant' });
      screen.getByRole('columnheader', { name: 'Created' });
      screen.getByRole('columnheader', { name: 'Last Updated' });
      screen.getByRole('columnheader', { name: 'Updated By' });
    });

    it('should render the table contents', () => {
      render(
        <ManageGrantSchemes
          schemes={mockSchemeList}
          tableHeading={tableHeading}
        />
      );

      screen.getByRole('link', { name: 'View scheme Scheme name 1' });
      screen.getByRole('cell', { name: '10 October 2011, 2:48pm' });
      screen.getByRole('cell', { name: '10 October 2011, 3:00pm' });
      screen.getByRole('cell', { name: 'test@admin.com' });

      screen.getByRole('link', { name: 'View scheme Scheme name 2' });
      screen.getByRole('cell', { name: '10 December 2011, 2:48pm' });
      screen.getByRole('cell', { name: '10 December 2011, 3:00pm' });
      screen.getByRole('cell', { name: 'test2@admin.com' });
    });
  });
});
