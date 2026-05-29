import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import Collapsible from 'react-native-collapsible';
import { useDispatch, useSelector } from 'react-redux';
import MainView from '../../components/mainView';
import { SIZES, icons } from '../../constants';
import { faqApi } from '../../redux/actions/companyAction';
import styles from './styles';
import CustomHeader from '../../components/header/CustomHeader';
import { useTranslation } from 'react-i18next';

const Faqs = () => {
  const { t } = useTranslation();
  const { faqs } = useSelector(state => state.company);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(faqApi({ cb: setLoading }));
  }, []);

  // 🧠 Function to handle deep link URL
  const handleDeepLink = async event => {
    const url = event?.url;
    if (url) {
      const route = url.split('://')[1]; // "watch/123
      const parts = route.split('/');
      const idAndParams = parts[1]; // "123"
      console.log('Params value : ', idAndParams);
    }
  };

  // 🧭 Handle deep links when app is opened via link
  useEffect(() => {
    const getInitialUrl = async () => {
      const url = await Linking.getInitialURL();
      if (url) handleDeepLink({ url });
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    getInitialUrl();

    return () => subscription.remove();
  }, []);

  // Use null as initial activeId (not an object)
  const [activeId, setActiveId] = useState(null);

  // Keep a mutable map of Animated.Values keyed by faq _id
  const rotations = useRef({}); // { [id]: Animated.Value }

  // Whenever faqs changes ensure there's an Animated.Value for each id
  useEffect(() => {
    if (!faqs || !Array.isArray(faqs)) return;

    // create missing Animated.Values
    faqs.forEach(item => {
      if (!item || !item._id) return;
      if (!rotations.current[item._id]) {
        rotations.current[item._id] = new Animated.Value(0);
      }
    });

    // (optional) remove Animated.Values for faqs that were removed
    const existingIds = new Set(faqs.map(f => f._id));
    Object.keys(rotations.current).forEach(key => {
      if (!existingIds.has(key)) {
        delete rotations.current[key];
      }
    });
  }, [faqs]);

  const toggle = id => {
    const isActive = activeId === id;

    // Animate the clicked item (guard if value missing)
    const anim = rotations.current[id];
    if (anim) {
      Animated.timing(anim, {
        toValue: isActive ? 0 : 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    // If another item was open, close it (so only one open at a time)
    if (!isActive && activeId && rotations.current[activeId]) {
      Animated.timing(rotations.current[activeId], {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    setActiveId(isActive ? null : id);
  };

  return (
    <MainView transparent bottomSafe={false}>
      <CustomHeader title={t('common.faqs') || 'FAQ'} />
      <ScrollView
        style={styles.center}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: SIZES.height * 0.05 }}
      >
        {faqs?.map((item, index) => {
          if (!item || !item._id) return null;

          // guard: fallback Animated.Value to avoid crashes (shouldn't be needed if effect ran)
          const anim = rotations.current[item._id] ?? new Animated.Value(0);

          const rotate = anim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '180deg'],
          });

          const isCollapsed = activeId !== item._id;

          return (
            <View
              key={item._id}
              style={[
                styles.card,
                index === 0 && {
                  borderTopLeftRadius: SIZES.w5,
                  borderTopRightRadius: SIZES.w5,
                },
                index === faqs.length - 1 && {
                  borderBottomLeftRadius: SIZES.w5,
                  borderBottomRightRadius: SIZES.w5,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.header}
                onPress={() => toggle(item._id)}
                activeOpacity={0.8}
              >
                <Text style={styles.question}>{item.question}</Text>

                <Animated.View style={{ transform: [{ rotate }] }}>
                  <Image source={icons.downArrow} style={styles.arrow} />
                </Animated.View>
              </TouchableOpacity>

              <Collapsible collapsed={isCollapsed} align="top">
                <View style={styles.answerContainer}>
                  <Text style={styles.answer}>
                    {item.answer.split(/([A-Z][a-z]+:)/g).map((part, i) => {
                      if (/[A-Z][a-z]+:/.test(part)) {
                        return (
                          <Text key={i} style={styles.boldText}>
                            {part}
                          </Text>
                        );
                      }
                      return <Text key={i}>{part}</Text>;
                    })}
                  </Text>
                </View>
              </Collapsible>
              {index !== faqs.length - 1 && (
                <View style={styles.itemSeparator} />
              )}
            </View>
          );
        })}
      </ScrollView>
    </MainView>
  );
};

export default Faqs;
