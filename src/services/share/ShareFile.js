import Share from 'react-native-share';

export const shareFile = async ({ loading, title, message }) => {
  try {
    loading?.(true);
    const options = {
      title: title || 'Share via',
      message: message || 'Check this out!',
    };

    const res = await Share.open(options);
    loading?.(false);
  } catch (err) {
    if (err && err.message !== 'User did not share') {
      console.log('Share error:', err);
    }
    loading?.(false);
  }
};
