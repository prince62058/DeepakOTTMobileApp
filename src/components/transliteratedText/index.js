import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { transliterateToHindi } from '../../utils/transliterate';

const TransliteratedText = ({ text, style, language, ...props }) => {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    let isMounted = true;

    const handleTransliteration = async () => {
      if (language === 'hi' && text) {
        // Basic check for Hindi characters - if already contains Hindi, skip
        const hindiRegex = /[\u0900-\u097F]/;
        if (hindiRegex.test(text)) {
           if (isMounted) setDisplayText(text);
           return;
        }

        const result = await transliterateToHindi(text);
        if (isMounted) setDisplayText(result);
      } else {
        if (isMounted) setDisplayText(text);
      }
    };

    handleTransliteration();

    return () => {
      isMounted = false;
    };
  }, [text, language]);

  return (
    <Text style={style} {...props}>
      {displayText}
    </Text>
  );
};

export default TransliteratedText;
