interface RelatedContentProps {
  title?: string;
  links: Array<{ href: string; title: string }>;
}

const RelatedContent = (props: RelatedContentProps) => {
  return (
    <>
      <div className="govuk-grid-column-one-third">
        <hr className="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-2 govuk-border-colour"></hr>
        <h2 className="govuk-heading-s">
          {props.title ? props.title : 'Related content'}
        </h2>
        {props.links.map((item) => (
          <p
            key={item.href}
            className="govuk-!-margin-bottom-2 govuk-!-margin-top-0"
          >
            <a
              className="govuk-link govuk-!-font-size-16"
              data-cy={`cyRelatedContentLinkFor_${item.href}`}
              href={item.href}
            >
              {item.title}
            </a>
          </p>
        ))}
      </div>
    </>
  );
};

export default RelatedContent;
