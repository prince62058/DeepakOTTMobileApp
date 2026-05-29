import React, { useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Orientation from 'react-native-orientation-locker';

const { width } = Dimensions.get('window');

const CustomVideoPlayer = ({ source }) => {
  const playerRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const togglePlayPause = () => setPaused(!paused);
  const toggleFullscreen = () => {
    if (fullscreen) Orientation.unlockAllOrientations();
    else Orientation.lockToLandscape();
    setFullscreen(!fullscreen);
  };

  const handleProgress = data => setCurrentTime(data.currentTime);
  const handleLoad = data => setDuration(data.duration);

  const getSource = src => {
    if (!src) return src;
    if (src.uri && typeof src.uri === 'string' && !src.uri.startsWith('http')) {
      return { ...src, uri: `https://${src.uri}` };
    }
    return src;
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden={fullscreen} />
      <TouchableOpacity
        style={styles.videoContainer}
        onPress={() => setShowControls(!showControls)}
        activeOpacity={1}
      >
        <Video
          ref={playerRef}
          source={getSource(source)}
          style={styles.video}
          resizeMode="contain"
          paused={paused}
          onLoad={handleLoad}
          onProgress={handleProgress}
        />

        {/* Custom Controls */}
        {showControls && (
          <View style={styles.controls}>
            <TouchableOpacity onPress={togglePlayPause}>
              <Icon
                name={paused ? 'play-circle-outline' : 'pause-circle-outline'}
                size={48}
                color="#fff"
              />
            </TouchableOpacity>

            <View style={styles.bottomControls}>
              <Text style={styles.timeText}>
                {Math.floor(currentTime)} / {Math.floor(duration)}s
              </Text>

              <TouchableOpacity onPress={toggleFullscreen}>
                <Icon
                  name={fullscreen ? 'fullscreen-exit' : 'fullscreen'}
                  size={24}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#000', flex: 1, justifyContent: 'center' },
  videoContainer: { width: '100%', height: 220, backgroundColor: '#000' },
  video: { width: '100%', height: '100%' },
  controls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  bottomControls: {
    width,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeText: { color: '#fff', fontSize: 14 },
});

export default CustomVideoPlayer;
