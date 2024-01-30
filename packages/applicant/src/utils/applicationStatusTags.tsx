export const APPLICATION_STATUS_TAGS: ApplicationTagInterface = {
  SUBMITTED: {
    displayName: 'Submitted',
    colourClass: '',
  },
  IN_PROGRESS: {
    displayName: 'In Progress',
    colourClass: 'govuk-tag--blue',
  },
  GRANT_CLOSED: {
    displayName: 'Grant Closed',
    colourClass: 'govuk-tag--grey',
  },
};

interface ApplicationTagInterface {
  [key: string]: TagDetails;
}

interface TagDetails {
  displayName: string;
  colourClass: string;
}
