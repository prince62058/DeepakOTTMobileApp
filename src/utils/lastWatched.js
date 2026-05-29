import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_PREFIX = 'last_watched_series_';

/**
 * Save the last watched episode ID for a given series.
 * @param {string} seriesId - The ID of the web series.
 * @param {string} episodeId - The ID of the episode being watched.
 */
export const saveLastWatchedEpisode = async (seriesId, episodeId) => {
  try {
    if (!seriesId || !episodeId) return;
    await AsyncStorage.setItem(`${STORAGE_KEY_PREFIX}${seriesId}`, episodeId);
    console.log(
      `💾 Saved last watched episode for series ${seriesId}: ${episodeId}`,
    );
  } catch (error) {
    console.error('Failed to save last watched episode:', error);
  }
};

/**
 * Get the last watched episode ID for a given series.
 * @param {string} seriesId - The ID of the web series.
 * @returns {Promise<string|null>} - The episode ID or null if not found.
 */
export const getLastWatchedEpisode = async seriesId => {
  try {
    if (!seriesId) return null;
    const episodeId = await AsyncStorage.getItem(
      `${STORAGE_KEY_PREFIX}${seriesId}`,
    );
    return episodeId;
  } catch (error) {
    console.error('Failed to retrieve last watched episode:', error);
    return null;
  }
};
