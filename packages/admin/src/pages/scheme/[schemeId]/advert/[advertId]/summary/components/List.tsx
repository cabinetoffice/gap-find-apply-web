import CustomLink from '../../../../../../../components/custom-link/CustomLink';
import { grantAdvertStatus } from '../../../../../../../services/AdvertPageService.d';
import {
  GrantAdvertSummaryPagePage,
  GrantAdvertSummaryPageQuestion,
  GrantAdvertSummaryPageSection,
} from '../../../../../../../types/GetSummaryPageContentResponse';
import { isGrantAdvertNotPublished } from './util';

type ListProps = {
  schemeId: string;
  advertId: string;
  section: GrantAdvertSummaryPageSection;
  page: GrantAdvertSummaryPagePage;
  question: GrantAdvertSummaryPageQuestion;
  status: grantAdvertStatus;
};

export function List({
  schemeId,
  advertId,
  section,
  page,
  question,
  status,
}: ListProps) {
  let response, actionText;

  if (question.multiResponse !== null) {
    actionText = 'Change';
    response = question.multiResponse.map((multiResponseValue, index) => {
      return (
        <p className="govuk-body" key={`${question.id}-${index}`}>
          {multiResponseValue}
        </p>
      );
    });
  } else {
    actionText = 'Add';
  }

  return (
    <div className="govuk-summary-list__row">
      <dt
        className="govuk-summary-list__key"
        data-cy={`cy-summary-${section.title}-${question.title}`}
      >
        <div>{question.title}</div>
      </dt>

      <dd
        className="govuk-summary-list__value"
        data-cy={`cy-summary-${section.title}-${question.title}-response`}
      >
        {response}
      </dd>

      {isGrantAdvertNotPublished(status) && (
        <dd className="govuk-summary-list__actions">
          <div>
            <CustomLink
              href={`/scheme/${schemeId}/advert/${advertId}/${section.id}/${page.id}`}
              dataCy={`cy-summary-${section.title}-${question.title}-change`}
              ariaLabel={`${actionText} response for ${question.title} question`}
            >
              {actionText}
            </CustomLink>
          </div>
        </dd>
      )}
    </div>
  );
}
