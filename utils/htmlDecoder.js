/**
 * HTML Entity Decoder Utility
 * Decodes common HTML entities to their corresponding characters
 */

/**
 * Decode HTML entities in text
 * @param {string} text - Text containing HTML entities
 * @returns {string} - Decoded text
 */
export const decodeHtmlEntities = (text) => {
  if (!text || typeof text !== 'string') {
    return text;
  }

  return text
    .replace(/&#x20;/g, ' ') // Replace &#x20; with space
    .replace(/&#x28;/g, '(') // Replace &#x28; with (
    .replace(/&#x29;/g, ')') // Replace &#x29; with )
    .replace(/&/g, '&') // Replace & with &
    .replace(/</g, '<') // Replace < with <
    .replace(/>/g, '>') // Replace > with >
    .replace(/"/g, '"') // Replace " with "
    .replace(/'/g, "'") // Replace ' with '
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&hellip;/g, '...') // Replace &hellip; with ...
    .replace(/&mdash;/g, '—') // Replace &mdash; with em dash
    .replace(/&ndash;/g, '–'); // Replace &ndash; with en dash
};

export default decodeHtmlEntities;