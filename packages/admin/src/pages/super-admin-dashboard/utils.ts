export const toSentenceCase = (string: string) =>
  string
    .split(/[^A-Za-z]/)
    .map(
      (word) => word.charAt(0).toUpperCase() + word.substring(1).toLowerCase()
    )
    .join(' ');
