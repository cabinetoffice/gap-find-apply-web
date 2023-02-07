import CustomLink from '../custom-link/CustomLink';

/**
 * Generic component which can hopefully be resued in pages which show object properties and there values.
 *
 * @returns FieldPreview Component
 */
const FieldPreview = ({
  name,
  value,
  linkAttributes,
  marginTop,
}: FieldPreviewProps) => {
  return (
    <>
      <h2
        className={`govuk-heading-m ${
          marginTop ? 'govuk-!-margin-top-' + marginTop : ''
        }`}
        data-cy={`cy_fieldHeader-${name}`}
      >
        {name}
      </h2>
      <p className="govuk-body no-overflow" data-cy={`cy_fieldValue-${name}`}>
        {value}
      </p>
      {linkAttributes && (
        <CustomLink
          href={linkAttributes.href}
          dataCy={`cy_fieldLinkAttribute-${linkAttributes.text}`}
        >
          {linkAttributes.text}
        </CustomLink>
      )}
    </>
  );
};

interface FieldPreviewProps {
  name: string;
  value: string;
  linkAttributes?: LinkAttributes;
  marginTop?: number;
}

interface LinkAttributes {
  href: string;
  text: string;
}

export default FieldPreview;
