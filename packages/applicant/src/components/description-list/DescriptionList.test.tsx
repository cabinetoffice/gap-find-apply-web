import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime';
import { createMockRouter } from '../../testUtils/createMockRouter';
import { DescriptionList } from './DescriptionList';

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({ pathname: '/test' })),
}));

const data = [
  { term: 'Name', detail: 'Sarah Philips' },
  { term: 'Organisation', detail: 'ABC Charity' },
];

describe('DescriptionList', () => {
  describe('should display data ', () => {
    test('should render table element', () => {
      render(
        <DescriptionList
          data={data}
          needAddOrChangeButtons={false}
          needBorder={false}
        />
      );
      const nameKey = screen.getByRole('term', {
        name: /name/i,
      });
      const nameValue = screen.getByText(/Sarah philips/i);

      const organisationKey = screen.getByRole('term', {
        name: /organisation/i,
      });

      const organisationValue = screen.getByText(/ABC Charity/i);

      expect(nameKey).toBeInTheDocument();
      expect(nameValue).toBeInTheDocument();
      expect(organisationKey).toBeInTheDocument();
      expect(organisationValue).toBeInTheDocument();
    });
  });

  describe('should display buttons if needAddOrChangeButtons is true', () => {
    test('should render action button as Change when details are not empty', () => {
      render(
        //https://www.youtube.com/watch?v=uF2lqBluQV8 explains why we need to wrap it
        <RouterContext.Provider value={createMockRouter({ pathname: '/test' })}>
          <DescriptionList
            data={data}
            needAddOrChangeButtons={true}
            needBorder={false}
          />
        </RouterContext.Provider>
      );
      const links = screen.getAllByRole('link', { name: /Change/i });
      expect(links.length).toBe(2);
    });

    test('should render action button contain the righ link and Add displays when details are empty', () => {
      data[0].detail = '';
      render(
        //https://www.youtube.com/watch?v=uF2lqBluQV8 explains why we need to wrap it
        <RouterContext.Provider value={createMockRouter({ pathname: '/test' })}>
          <DescriptionList
            data={data}
            needAddOrChangeButtons={true}
            needBorder={false}
          />
        </RouterContext.Provider>
      );
      const emptyDetail = screen.getByRole('definition', {
        name: /-/i,
      });
      const linksWithChange = screen.getAllByRole('link', {
        name: /Change/i,
      });
      const linksWithAdd = screen.getAllByRole('link', { name: /Add/i });
      const linksWithChangeHref = linksWithChange[0].getAttribute('href');
      const linksWithAddHref = linksWithAdd[0].getAttribute('href');

      expect(emptyDetail).toBeInTheDocument();
      expect(linksWithChange.length).toBe(1);
      expect(linksWithAdd.length).toBe(1);
      expect(linksWithChangeHref).toBe('/test/organisation');
      expect(linksWithAddHref).toBe('/test/name');
    });
  });

  describe('<dl> should change class based on needBorder', () => {
    test('should not have class govuk-summary-list--no-border if needBorder is true', () => {
      render(
        <DescriptionList
          data={data}
          needAddOrChangeButtons={false}
          needBorder={true}
        />
      );

      const dl = screen.getByLabelText('description-list');
      expect(dl).toHaveClass('govuk-summary-list');
      expect(dl).not.toHaveClass('govuk-summary-list--no-border');
    });

    test('should have class govuk-summary-list--no-border if needBorder is false', () => {
      render(
        <DescriptionList
          data={data}
          needAddOrChangeButtons={false}
          needBorder={false}
        />
      );

      const dl = screen.getByLabelText('description-list');
      expect(dl).toHaveClass('govuk-summary-list');
      expect(dl).toHaveClass('govuk-summary-list--no-border');
    });
  });
});
