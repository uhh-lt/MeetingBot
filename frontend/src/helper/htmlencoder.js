export { encodeHTML };

const tagsToReplace = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
};

function replaceTag(tag) {
  return tagsToReplace[tag] || tag;
}

function encodeHTML(str) {
  return str.replace(/[&<>]/g, replaceTag);
}
