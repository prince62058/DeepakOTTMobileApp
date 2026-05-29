import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import RenderHTML from 'react-native-render-html';

import MainView from '../../components/mainView';
import { companyApi } from '../../redux/actions/companyAction';
import styles from './styles';
import { COLORS, SIZES } from '../../constants';
import CustomHeader from '../../components/header/CustomHeader';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';

const Terms = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { company } = useSelector(state => state.company);
  const [loading, setLoading] = useState(false);
  const { width } = useWindowDimensions();

  useEffect(() => {
    dispatch(companyApi({ cb: setLoading }));
  }, []);

  // Clean and wrap HTML content
  const cleanContent = content => {
    if (!content) return '';

    // Decode HTML entities
    let cleaned = content
      .replace(/&amp;/g, '&')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();

    // Force newlines for breaks
    cleaned = cleaned.replace(/\n/g, '<br/>');

    // Wrap numbered sections (e.g., "1. Eligibility") in <h3>
    // Heuristic: Digit + Dot + Space + Words + Lookahead for Capital Letter (Start of sentence)
    cleaned = cleaned.replace(
      /(^|\s|<br\/>)(\d+\.\s+[A-Za-z\s&]{2,50}?)(?=\s+[A-Z])/g,
      '$1<h3>$2</h3>',
    );

    // Wrap in proper HTML structure if not already wrapped
    if (!cleaned.includes('<html>') && !cleaned.includes('<body>')) {
      cleaned = `<html><body>${cleaned}</body></html>`;
    }

    return cleaned;
  };

  const htmlContent = i18n.language === 'hi' 
    ? t('common.terms_content') 
    : cleanContent(company?.termsCondition || '');

  return (
    <MainView transparent bottomSafe={false}>
      <CustomHeader title={t('common.terms_conditions') || 'Terms & Conditions'} />
      {loading && !company?.termsCondition && i18n.language !== 'hi' ? (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.white} size="large" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}
        >
          {htmlContent ? (
            <RenderHTML
              contentWidth={width}
              source={{ html: htmlContent }}
              tagsStyles={{
                body: {
                  color: COLORS.white,
                  fontSize: 14,
                  lineHeight: 22,
                },
                h1: { color: COLORS.white, marginBottom: 10 },
                h2: { color: COLORS.white, marginBottom: 8 },
                h3: {
                  color: COLORS.white,
                  marginBottom: 8,
                  marginTop: 15,
                  fontSize: 16,
                  fontWeight: 'bold',
                },
                p: { color: COLORS.white, marginBottom: 10 },
                li: { color: COLORS.white, marginBottom: 5 },
                strong: { color: COLORS.white, fontWeight: 'bold' },
              }}
            />
          ) : (
            <Text style={styles.emptyText}>
              {t('common.no_terms') || 'No terms and conditions available'}
            </Text>
          )}
        </ScrollView>
      )}
    </MainView>
  );
};

export default Terms;
