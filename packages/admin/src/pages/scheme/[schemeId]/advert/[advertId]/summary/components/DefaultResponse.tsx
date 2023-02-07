import CustomLink from '../../../../../../../components/custom-link/CustomLink';
import { grantAdvertStatus } from '../../../../../../../services/AdvertPageService.d';
import {
  GrantAdvertSummaryPagePage,
  GrantAdvertSummaryPageQuestion,
  GrantAdvertSummaryPageSection,
} from '../../../../../../../types/GetSummaryPageContentResponse';
import { isGrantAdvertNotPublished } from './util';

type DefaultResponseProps = {
  schemeId: string;
  advertId: string;
  section: GrantAdvertSummaryPageSection;
  page: GrantAdvertSummaryPagePage;
  question: GrantAdvertSummaryPageQuestion;
  status: grantAdvertStatus;
};

export function DefaultResponse({
  schemeId,
  advertId,
  section,
  page,
  question,
  status,
}: DefaultResponseProps) {
  const actionText = question.response ? 'Change' : 'Add';

  return (
    <div className="govuk-summary-list__row">
      <dt
        className="govuk-summary-list__key"
        data-cy={`cy-summary-${section.title}-${question.title}`}
      >
        {question.title}
      </dt>

      <dd
        className="govuk-summary-list__value"
        data-cy={`cy-summary-${section.title}-${question.title}-response`}
      >
        {question.response}
      </dd>

      {isGrantAdvertNotPublished(status) && (
        <dd className="govuk-summary-list__actions">
          <CustomLink
            href={`/scheme/${schemeId}/advert/${advertId}/${section.id}/${page.id}`}
            dataCy={`cy-summary-${section.title}-${question.title}-change`}
            ariaLabel={`${actionText} response for ${question.title} question`}
          >
            {actionText}
          </CustomLink>
        </dd>
      )}
    </div>
  );
}
