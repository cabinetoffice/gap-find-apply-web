import { NextApiRequest, NextApiResponse } from 'next';
import { getAdvertBySchemeId } from '../../../../services/GrantAdvertService';
import { GrantMandatoryQuestionService } from '../../../../services/GrantMandatoryQuestionService';
import { createSubmission } from '../../../../services/SubmissionService';
import { getJwtFromCookies } from '../../../../utils/jwt';
import { routes } from '../../../../utils/routes';
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const mandatoryQuestionId = req.query.mandatoryQuestionId.toString();
  const schemeId = req.query.schemeId.toString();

  try {
    const advertDto = await getAdvertBySchemeId(
      schemeId,
      getJwtFromCookies(req)
    );
    if (!advertDto.isInternal) {
      return res.redirect(
        `${process.env.HOST}${routes.mandatoryQuestions.externalApplicationPage(
          mandatoryQuestionId
        )}?url=${advertDto.externalSubmissionUrl}`
      );
    }

    const { submissionId } = await createSubmission(
      advertDto.grantApplicationId.toString(),
      getJwtFromCookies(req)
    );

    const grantMandatoryQuestionService =
      GrantMandatoryQuestionService.getInstance();

    await grantMandatoryQuestionService.updateMandatoryQuestion(
      getJwtFromCookies(req),
      mandatoryQuestionId,
      'creatingSubmissionFromMandatoryQuestion',
      { submissionId }
    );

    console.info(
      'Submission has been added to mandatory question: ',
      mandatoryQuestionId
    );

    return res.redirect(
      `${process.env.HOST}${routes.submissions.sections(submissionId)}`
    );
  } catch (e) {
    console.error('error: ', e);
    const serviceErrorProps = {
      errorInformation: 'There was an error in the service',
      linkAttributes: {
        href: routes.mandatoryQuestions.summaryPage(mandatoryQuestionId),
        linkText: 'Go back to the summary page adn try again',
        linkInformation: '',
      },
    };
    return res.redirect(routes.serviceError(serviceErrorProps));
  }
}
