import type { NextApiRequest, NextApiResponse } from 'next';
import { getSectionById } from '../../../../../../services/SubmissionService';
import { getJwtFromCookies } from '../../../../../../utils/jwt';
import { routes } from '../../../../../../utils/routes';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const submissionId = req.query.submissionId.toString();
  const sectionId = req.query.sectionId.toString();
  const section = await getSectionById(
    submissionId,
    sectionId,
    getJwtFromCookies(req)
  );
  const questionId = section.questions[0].questionId;

  res.redirect(
    process.env.SUB_PATH +
      routes.submissions.question(submissionId, sectionId, questionId)
  );
}
