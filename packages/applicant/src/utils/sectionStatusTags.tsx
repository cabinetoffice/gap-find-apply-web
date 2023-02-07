export const SUBMISSION_STATUS_TAGS: SubmissionTagInterface = {
  COMPLETED: {
    displayName: 'Completed',
    colourClass: '',
  },
  IN_PROGRESS: {
    displayName: 'In Progress',
    colourClass: 'govuk-tag--blue',
  },
  NOT_STARTED: {
    displayName: 'Not Started',
    colourClass: 'govuk-tag--grey',
  },
  CANNOT_START_YET: {
    displayName: 'Cannot Start Yet',
    colourClass: 'govuk-tag--grey',
  },
};

interface SubmissionTagInterface {
  [key: string]: TagDetails;
}

interface TagDetails {
  displayName: string;
  colourClass: string;
}
