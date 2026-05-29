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

const PrivacyPolicy = () => {
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

    let cleaned = content
      .replace(/&amp;/g, '&')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();

    // Force newlines for existing line breaks
    cleaned = cleaned.replace(/\n/g, '<br/>');

    // --- Headers ---
    // 1. Existing Logic (User Roles, Data We Collect, etc.)
    cleaned = cleaned.replace(
      /(?:^|\s|\.)(\d+\.\s+[A-Za-z\s]+:|Data Safety|Privacy Policy)/g,
      '<br/><br/><h3>$1</h3>',
    );

    // --- Lists ---
    // Replace " - " with a bullet point breaks
    cleaned = cleaned.replace(/\s+-\s+/g, '<br/><br/>• ');

    // --- Formatting ---
    // Bold Key Terms (Labels ending in colon)
    cleaned = cleaned.replace(/([A-Z][a-zA-Z\s,]+:)/g, '<strong>$1</strong>');

    // Wrap in proper HTML structure
    if (!cleaned.includes('<html>')) {
      cleaned = `<html><body>${cleaned}</body></html>`;
    }

    return cleaned;
  };

  const htmlContent = i18n.language === 'hi' 
    ? t('common.privacy_content') 
    : cleanContent(company?.privacyPolicy || '');

  return (
    <MainView transparent bottomSafe={false}>
      <CustomHeader title={t('common.privacy_policy') || 'Privacy Policy'} />
      {loading && !company?.privacyPolicy && i18n.language !== 'hi' ? (
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
                  fontSize: 18,
                  fontWeight: 'bold',
                },
                p: { color: COLORS.white, marginBottom: 10 },
                li: {
                  color: COLORS.white,
                  marginBottom: 5,
                  marginLeft: 10,
                },
                strong: { color: COLORS.white, fontWeight: 'bold' },
              }}
            />
          ) : (
            <Text style={styles.emptyText}>{t('common.no_privacy_policy') || 'No privacy policy available'}</Text>
          )}
        </ScrollView>
      )}
    </MainView>
  );
};

export default PrivacyPolicy;
