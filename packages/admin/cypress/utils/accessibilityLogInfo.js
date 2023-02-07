export default function accessibilityLogInfo(violationsLength) {
  return `${violationsLength} accessibility violation${
    violationsLength === 1 ? '' : 's'
  } ${violationsLength === 1 ? 'was' : 'were'} detected.`;
}
