type Section = {
  name: string;
  status: string;
};

export type UpdateSectionTitleProps = {
  sessionId: string;
  applicationId: string;
  sectionId: string;
  body: { sectionTitle: string; revision: string };
};

export default Section;
