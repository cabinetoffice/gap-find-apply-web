import Link from 'next/link';

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

export const buildPaginationListItems = ({
  route,
  searchParams,
  currentPage,
  itemsPerPage,
  paginationElementType,
  ellipsisEndAt,
  ellipsisStartAt,
  additionalQueryData,
}) => {
  const PAGINATION_ELEMENTS_OBJECT = {
    // adding previous button
    [PAGINATION_PREVIOUS_ELEMENT]: (
      <li key={PAGINATION_PREVIOUS_ELEMENT} className="govuk-pagination__prev">
        <Link
          href={{
            pathname: route,
            query: {
              ...searchParams,
              skip: (currentPage - 2) * itemsPerPage,
              limit: itemsPerPage,
              page: currentPage - 1,
              ...additionalQueryData,
            },
          }}
          className="govuk-link govuk-pagination__link"
        >
          <svg
            className="govuk-pagination__icon govuk-pagination__icon--prev"
            xmlns="http://www.w3.org/2000/svg"
            height="13"
            width="15"
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 15 13"
          >
            <path d="m6.5938-0.0078125-6.7266 6.7266 6.7441 6.4062 1.377-1.449-4.1856-3.9768h12.896v-2h-12.984l4.2931-4.293-1.414-1.414z"></path>
          </svg>
          {PAGINATION_PREVIOUS_ELEMENT}
        </Link>
      </li>
    ),

    //adding next button
    [PAGINATION_NEXT_ELEMENT]: (
      <li key={PAGINATION_NEXT_ELEMENT} className="govuk-pagination__next">
        <Link
          href={{
            pathname: route,
            query: {
              ...searchParams,
              skip: currentPage * itemsPerPage,
              limit: itemsPerPage,
              page: currentPage + 1,
              ...additionalQueryData,
            },
          }}
          className="govuk-link govuk-pagination__link"
        >
          {PAGINATION_NEXT_ELEMENT}
          <svg
            className="govuk-pagination__icon govuk-pagination__icon--next"
            xmlns="http://www.w3.org/2000/svg"
            height="13"
            width="15"
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 15 13"
          >
            <path d="m8.107-0.0078125-1.4136 1.414 4.2926 4.293h-12.986v2h12.896l-4.1855 3.9766 1.377 1.4492 6.7441-6.4062-6.7246-6.7266z"></path>
          </svg>
        </Link>
      </li>
    ),

    //adding ellipsis
    [PAGINATION_ELLIPSIS_ELEMENT]: (
      <li
        key={`${currentPage}_ellipsis`}
        className="govuk-pagination__item govuk-pagination__item--ellipses"
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
        className="govuk-pagination__item govuk-pagination__item--current"
        aria-label={`Current Page, Page ${currentPage}`}
      >
        <a
          className="govuk-link govuk-pagination__link"
          href="#"
          aria-current="page"
        >
          {currentPage}
        </a>
      </li>
    ),
    [PAGINATION_NUMERIC_ELEMENT]: (
      <li key={currentPage} className="govuk-pagination__item">
        <Link
          href={{
            pathname: route,
            query: {
              ...searchParams,
              skip: (currentPage - 1) * itemsPerPage,
              limit: itemsPerPage,
              page: currentPage,
              ...additionalQueryData,
            },
          }}
          className="govuk-link govuk-pagination__link"
        >
          {currentPage}
        </Link>
      </li>
    ),
  };

  return PAGINATION_ELEMENTS_OBJECT[paginationElementType];
};
