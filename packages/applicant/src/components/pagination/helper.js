import Link from 'next/link';
import { skipToMainContent } from '../../utils/skipToMainContent';

const NEIGHBOR_COUNT_EDGE_ELEMENT = 2;
const NEIGHBOR_COUNT_MIDDLE_ELEMENT = 1;
export const PAGINATION_ELLIPSIS_ELEMENT = '...';
export const PAGINATION_NEXT_ELEMENT = 'Next';
export const PAGINATION_PREVIOUS_ELEMENT = 'Previous';
export const PAGINATION_ACTIVE_ELEMENT = 'active';
export const PAGINATION_NUMERIC_ELEMENT = 'numeric';

const isCornerElement = (current, last) => current === 1 || current === last;

const isFarElementFromCorner = (current, left, right) =>
  current >= left && current <= right;

const isFarElementFromNeighbor = (current, previous) =>
  current - previous !== 1;

const isNearElementFromNeighbor = (current, previous) =>
  current - previous === 2;

export const showingItemsFromCount = (currentPage, itemsPerPage) =>
  currentPage === 1 ? 1 : (currentPage - 1) * itemsPerPage + 1;

const addNumbersToPagination = (left, right, last) => {
  let pagesWithoutEllipsis = [];

  for (let pageNumber = 1; pageNumber <= last; pageNumber++) {
    if (
      isCornerElement(pageNumber, last) ||
      isFarElementFromCorner(pageNumber, left, right)
    ) {
      pagesWithoutEllipsis.push(pageNumber);
    }
  }

  return pagesWithoutEllipsis;
};

const addEllipsisToPagination = (pagesWithoutEllipsis) => {
  let previousElement,
    pagesWithEllipsis = [];

  for (let currentElement of pagesWithoutEllipsis) {
    if (previousElement) {
      if (isNearElementFromNeighbor(currentElement, previousElement)) {
        pagesWithEllipsis.push(previousElement + 1);
      } else if (isFarElementFromNeighbor(currentElement, previousElement)) {
        pagesWithEllipsis.push(PAGINATION_ELLIPSIS_ELEMENT);
      }
    }
    pagesWithEllipsis.push(currentElement);
    previousElement = currentElement;
  }

  return pagesWithEllipsis;
};

export const buildPaginationArr = (current, last) => {
  const isEdgeElement = current === 1 || current === last;

  const neighborElementCount = isEdgeElement
    ? NEIGHBOR_COUNT_EDGE_ELEMENT
    : NEIGHBOR_COUNT_MIDDLE_ELEMENT;

  const left = current - neighborElementCount;
  const right = current + neighborElementCount;

  const pagesWithoutEllipsis = addNumbersToPagination(left, right, last);

  const pagesWithEllipsis = addEllipsisToPagination(pagesWithoutEllipsis);

  return pagesWithEllipsis;
};

export const buildPaginationListItems = (
  router,
  currentPage,
  itemsPerPage,
  paginationElementType,
  ellipsisEndAt,
  ellipsisStartAt
) => {
  const { route, query = {} } = router;

  const PAGINATION_ELEMENTS_OBJECT = {
    // adding previous button
    [PAGINATION_PREVIOUS_ELEMENT]: (
      <li
        key={PAGINATION_PREVIOUS_ELEMENT}
        className="moj-pagination__item  moj-pagination__item--prev"
      >
        <Link
          href={{
            pathname: route,
            query: {
              ...query,
              skip: (currentPage - 2) * itemsPerPage,
              limit: itemsPerPage,
              page: currentPage - 1,
            },
          }}
        >
          <a
            className="moj-pagination__link"
            data-cy="cyPaginationPreviousButton"
            onClick={skipToMainContent}
          >
            {PAGINATION_PREVIOUS_ELEMENT}
            <span className="govuk-visually-hidden"> set of pages</span>
          </a>
        </Link>
      </li>
    ),

    //adding next button
    [PAGINATION_NEXT_ELEMENT]: (
      <li
        key={PAGINATION_NEXT_ELEMENT}
        className="moj-pagination__item  moj-pagination__item--next"
      >
        <Link
          href={{
            pathname: route,
            query: {
              ...query,
              skip: currentPage * itemsPerPage,
              limit: itemsPerPage,
              page: currentPage + 1,
            },
          }}
        >
          <a
            className="moj-pagination__link"
            data-cy="cyPaginationNextButton"
            onClick={skipToMainContent}
          >
            {PAGINATION_NEXT_ELEMENT}
            <span className="govuk-visually-hidden"> set of pages</span>
          </a>
        </Link>
      </li>
    ),

    //adding ellipsis
    [PAGINATION_ELLIPSIS_ELEMENT]: (
      <li
        key={`${currentPage}_ellipsis`}
        className="moj-pagination__item moj-pagination__item--dots"
        aria-label={`Skipping pages ${ellipsisStartAt + 1} to ${
          ellipsisEndAt - 1
        }`}
      >
        {PAGINATION_ELLIPSIS_ELEMENT}
      </li>
    ),

    //adding current page number which is active
    [PAGINATION_ACTIVE_ELEMENT]: (
      <li
        key={PAGINATION_ACTIVE_ELEMENT}
        className="moj-pagination__item moj-pagination__item--active"
        aria-label={`Current Page, Page ${currentPage}`}
      >
        {currentPage}
      </li>
    ),
    [PAGINATION_NUMERIC_ELEMENT]: (
      <li key={currentPage} className="moj-pagination__item">
        <Link
          href={{
            pathname: route,
            query: {
              ...query,
              skip: (currentPage - 1) * itemsPerPage,
              limit: itemsPerPage,
              page: currentPage,
            },
          }}
        >
          <a
            className="moj-pagination__link"
            data-cy={`cyPaginationPageNumber${currentPage}`}
            aria-label={`Goto, Results page ${currentPage}`}
            onClick={skipToMainContent}
          >
            {currentPage}
          </a>
        </Link>
      </li>
    ),
  };

  return PAGINATION_ELEMENTS_OBJECT[paginationElementType];
};
