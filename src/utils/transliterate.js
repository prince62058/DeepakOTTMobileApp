import axios from 'axios';

/**
 * Transliterates English text to Hindi using Google Input Tools API.
 * @param {string} text - The text to transliterate.
 * @returns {Promise<string>} - The transliterated Hindi text.
 */
export const transliterateToHindi = async (text) => {
  if (!text || typeof text !== 'string') return text;
  
  // Basic check for Hindi characters - if already contains Hindi, return as is
  const hindiRegex = /[\u0900-\u097F]/;
  if (hindiRegex.test(text)) return text;

  try {
    const response = await axios.get(
      `https://inputtools.google.com/request?text=${encodeURIComponent(
        text,
      )}&itc=hi-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8&app=test`,
    );

    if (
      response.data &&
      response.data[0] === 'SUCCESS' &&
      response.data[1] &&
      response.data[1][0] &&
      response.data[1][0][1] &&
      response.data[1][0][1][0]
    ) {
      return response.data[1][0][1][0];
    }
    return text;
  } catch (error) {
    console.log('Transliteration error:', error);
    return text;
  }
};
