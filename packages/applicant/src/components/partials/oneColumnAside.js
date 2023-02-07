import Link from 'next/link';

const OneColumnAside = ({ title = '', links = [] }) => {
  return (
    <div className="govuk-grid-column-one-third">
      <h2
        className="govuk-heading-s govuk-!-padding-top-3"
        style={{ borderTop: '2px solid #1d70b8' }}
      >
        {title}
      </h2>
      {links.map((item, index) => (
        <p key={index}>
          <Link href={item.link}>
            <a className="govuk-link govuk-link--no-visited-state" data-cy="ct">
              {item.label}
            </a>
          </Link>
        </p>
      ))}
    </div>
  );
};

export default OneColumnAside;
