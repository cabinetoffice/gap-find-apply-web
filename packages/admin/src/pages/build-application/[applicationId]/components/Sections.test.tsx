import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import {
  ApplicationFormSection,
  ApplicationFormSummary,
} from '../../../../types/ApplicationForm';
import Sections from './Sections';

const mockSectionParams = {
  sections: [
    {
      sectionId: 'ELIGIBILITY',
      sectionTitle: 'Eligibility',
      sectionStatus: 'INCOMPLETE',
      questions: [
        {
          questionId: 'testEligibilityQuestionId',
          fieldTitle: 'Eligibility statement',
        },
      ],
    },
    {
      sectionId: 'ESSENTIAL',
      sectionTitle: 'Required checks',
      sectionStatus: 'IN PROGRESS',
      questions: [
        {
          questionId: '1',
          fieldTitle: 'Sample question 1',
        },
        {
          questionId: '2',
          fieldTitle: 'Sample question 2',
        },
        {
          questionId: '3',
          fieldTitle: 'Sample question 3',
        },
      ],
    },
    {
      sectionId: 'testCustomSectionId',
      sectionTitle: 'Custom section',
      questions: [
        {
          questionId: 'testCustomQuestionId',
          fieldTitle: 'Custom question',
          responseType: 'MultipleSelection',
        },
      ],
    },
  ] as ApplicationFormSection[],
  applicationId: '87654321',
  applicationStatus: 'DRAFT' as ApplicationFormSummary['applicationStatus'],
  resolvedUrl: '/build-application/87654321',
  csrfToken: 'mockCsrfToken',
};

describe('Sections component', () => {
  describe('When the application status is NOT "PUBLISHED"', () => {
    beforeEach(() => {
      render(<Sections {...mockSectionParams} />);
    });

    it('Should render section titles', () => {
      screen.getByRole('table', { name: '1. Eligibility' });
      screen.getByRole('table', { name: '2. Required checks' });
      screen.getByRole('table', {
        name: '3. Custom section Up Down Edit section',
      });
    });

    it('Should render question titles & truncates them 50 chars (Except for when the section ID is "ESSENTIAL"', () => {
      screen.getByText('Eligibility statement');
      screen.getByText('Custom question');
    });

    it('Should render "Due-diligence checks" question title when the section ID is "ESSENTIAL"', () => {
      screen.getByText('Due-diligence checks');
    });

    it('Should NOT render all of the questions when the section ID is "ESSENTIAL"', () => {
      expect(screen.queryByText('Sample question 1')).toBeFalsy();
      expect(screen.queryByText('Sample question 2')).toBeFalsy();
      expect(screen.queryByText('Sample question 3')).toBeFalsy();
    });

    it('Should render the section status for Eligibility & Required Checks', () => {
      screen.getByText('INCOMPLETE');
      screen.getByText('IN PROGRESS');
    });

    it('Should render the response type for custom questions', () => {
      screen.getByText('Multiple select');
    });

    it('Should render "View" link for Due-diligence question', () => {
      screen.getByRole('link', {
        name: 'View question "Due-diligence checks"',
      });
    });

    it('Should render "View or change" link for custom question', () => {
      screen.getByRole('link', {
        name: 'View or change question "Custom question"',
      });
    });

    it('Should return the correct "View or change" link for the eligibility sections', () => {
      const link = screen.getByRole('link', {
        name: 'View or change question "Eligibility statement"',
      });
      expect(link).toHaveProperty(
        'href',
        'http://localhost/apply/build-application/87654321/ELIGIBILITY/testEligibilityQuestionId/eligibility-statement'
      );
    });

    it('Should render an "Add a new section" button', () => {
      screen.getByRole('button', { name: 'Add a new section' });
    });

    it('Should render an "Edit section" button', () => {
      expect(
        screen.getByRole('link', { name: 'Edit section' })
      ).toHaveAttribute(
        'href',
        '/apply/build-application/87654321/testCustomSectionId'
      );
    });

    it('Should render an "Up" button', () => {
      screen.getByRole('button', { name: 'Up' });
    });

    it('Should render a "Down" button', () => {
      screen.getByRole('button', { name: 'Down' });
    });
  });

  describe('When the application status is "PUBLISHED"', () => {
    beforeEach(() => {
      render(<Sections {...mockSectionParams} applicationStatus="PUBLISHED" />);
    });

    it('Should return the correct "View" link for the eligibility sections', () => {
      const link = screen.getByRole('link', {
        name: 'View question "Eligibility statement"',
      });
      expect(link).toHaveProperty(
        'href',
        'http://localhost/apply/build-application/87654321/ELIGIBILITY/testEligibilityQuestionId/eligibility-statement'
      );
    });

    it('Should render "View" link for custom question', () => {
      screen.getByRole('link', {
        name: 'View question "Custom question"',
      });
    });

    it('Should NOT render a "Delete this section" link ', () => {
      expect(
        screen.queryByRole('link', {
          name: 'Delete this section: Custom section',
        })
      ).toBeFalsy();
    });

    it('Should NOT render an "Add new section" button', () => {
      expect(
        screen.queryByRole('button', { name: 'Add new section' })
      ).toBeFalsy();
    });

    it('Should NOT render an "Add new question" button', () => {
      expect(
        screen.queryByRole('button', {
          name: 'Add a question to Eligibility',
        })
      ).toBeFalsy();
    });

    it('Should NOT render a "Delete question" link', () => {
      expect(
        screen.queryByRole('link', { name: 'Delete question: Custom question' })
      ).toBeFalsy();
    });

    it('Should NOT render an "Edit section" button', () => {
      expect(screen.queryByRole('link', { name: 'Edit section' })).toBeFalsy();
    });
  });
});
