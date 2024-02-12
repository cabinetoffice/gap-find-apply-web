import { deleteAttachmentByQuestionId } from '../../../../../../../../../../../services/SubmissionService';
import { getJwtFromCookies } from '../../../../../../../../../../../utils/jwt';
import { routes } from '../../../../../../../../../../../utils/routes';

const handler = async (req, res) => {
  const submissionId = req.query.submissionId.toString();
  const sectionId = req.query.sectionId.toString();
  const questionId = req.query.questionId.toString();
  const attachmentId = req.query.attachmentId.toString();
  const jwt = getJwtFromCookies(req);

  const referer: string = req?.headers?.referer;
  const isFromCYAPage =
    referer.includes('fromCYAPage=true') || req.query?.fromCYAPage;

  const isFromSummaryPage = referer.includes('fromSubmissionSummaryPage=true');

  await deleteAttachmentByQuestionId(
    submissionId,
    sectionId,
    questionId,
    attachmentId,
    jwt
  );

  return res.redirect(
    302,
    `${process.env.HOST}${routes.submissions.question(
      submissionId,
      sectionId,
      questionId
    )}${getQueryString(isFromCYAPage, isFromSummaryPage)}`
  );
};

function getQueryString(isFromCYAPage: boolean, isFromSummaryPage: boolean) {
  if (isFromCYAPage) return '?fromCYAPage=true';
  if (isFromSummaryPage) return '?fromSubmissionSummaryPage=true';
  return '';
}

export default handler;
