function InsetText({ className, children, ...rest }) {
  return (
    <div className={`govuk-inset-text ${className || ''}`} {...rest}>
      {children}
    </div>
  );
}

export { InsetText };
