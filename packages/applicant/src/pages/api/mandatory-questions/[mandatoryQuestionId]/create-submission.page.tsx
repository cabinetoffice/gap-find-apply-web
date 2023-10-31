import { NextApiRequest, NextApiResponse } from 'next';
import { getAdvertBySchemeId } from '../../../../services/GrantAdvertService';
import { GrantMandatoryQuestionService } from '../../../../services/GrantMandatoryQuestionService';
import { createSubmission } from '../../../../services/SubmissionService';
import { getJwtFromCookies } from '../../../../utils/jwt';
import { routes } from '../../../../utils/routes';
import { GrantApplicant } from '../../../../models/GrantApplicant';
import { GrantApplicantService } from '../../../../services/GrantApplicantService';
import {
  GrantApplicantOrganisationProfileService,
  UpdateOrganisationDetailsDto,
} from '../../../../services/GrantApplicantOrganisationProfileService';
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

    const grantMandatoryQuestionService =
      GrantMandatoryQuestionService.getInstance();
    const grantApplicantService = GrantApplicantService.getInstance();
    const grantApplicantOrganisationProfileService =
      GrantApplicantOrganisationProfileService.getInstance();

    const grantApplicant: GrantApplicant =
      await grantApplicantService.getGrantApplicant(getJwtFromCookies(req));
    const organisationData = grantApplicant.organisation;

    const { submissionId } = await createSubmission(
      advertDto.grantApplicationId.toString(),
      getJwtFromCookies(req)
    );

    const mandatoryQuestionData =
      await grantMandatoryQuestionService.getMandatoryQuestionById(
        mandatoryQuestionId,
        getJwtFromCookies(req)
      );

    const updateOrganisationDetailsDto: UpdateOrganisationDetailsDto = {};
    updateOrganisationDetailsDto.id = organisationData.id;
    updateOrganisationDetailsDto.legalName = mandatoryQuestionData.name;
    updateOrganisationDetailsDto.type = mandatoryQuestionData.orgType;
    updateOrganisationDetailsDto.addressLine1 =
      mandatoryQuestionData.addressLine1;
    updateOrganisationDetailsDto.addressLine2 =
      mandatoryQuestionData.addressLine2;
    updateOrganisationDetailsDto.town = mandatoryQuestionData.city;
    updateOrganisationDetailsDto.county = mandatoryQuestionData.county;
    updateOrganisationDetailsDto.postcode = mandatoryQuestionData.postcode;
    updateOrganisationDetailsDto.charityCommissionNumber =
      mandatoryQuestionData.charityCommissionNumber;
    updateOrganisationDetailsDto.companiesHouseNumber =
      mandatoryQuestionData.companiesHouseNumber;

    await grantApplicantOrganisationProfileService.updateOrganisation(
      updateOrganisationDetailsDto,
      getJwtFromCookies(req)
    );

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
        linkText: 'Go back to the summary page and try again',
        linkInformation: '',
      },
    };
    return res.redirect(routes.serviceError(serviceErrorProps));
  }
}
