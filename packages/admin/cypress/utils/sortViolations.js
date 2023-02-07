export default function sortViolation(violationData) {
  violationData.sort((a, b) => {
    if (a.impact == 'critical') {
      return -1;
    } else if (a.impact == 'serious' && b.impact == 'critical') {
      return 1;
    } else if (a.impact == 'serious') {
      return -1;
    } else if (a.impact == 'moderate' && b.impact == 'serious') {
      return 1;
    } else if (a.impact == 'moderate') {
      return -1;
    } else {
      return 1;
    }
  });
}
