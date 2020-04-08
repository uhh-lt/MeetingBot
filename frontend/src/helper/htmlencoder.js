const tagsToReplace = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
};

function replaceTag(tag) {
  return tagsToReplace[tag] || tag;
}

/**
 * Escapes &, &lt;, > in the given string.
 * @param str {string} text containing unescaped HTML characters
 * @returns {string} text containing escaped HTML characters
 */
function encodeHTML(str) {
  return str.replace(/[&<>]/g, replaceTag);
}

export default encodeHTML;
