// Polyfill for IE11 not supporting forEach on NodeList
if (typeof window !== 'undefined') {
  if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = Array.prototype.forEach;
  }
}
