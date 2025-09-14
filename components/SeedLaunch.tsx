// components/SeedLaunch.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

type Props = {
  /** 애니메이션을 시작할 때마다 key 값을 바꿔 주세요 (ex. Date.now()) */
  trigger: number | null;
  /** 시작 좌표(px). 지정 안 하면 화면 하단 중앙에서 시작 */
  startX?: number;
  startY?: number;
  /** 보여줄 이모지 (기본: 씨앗) */
  emoji?: string;
  /** 지속시간(ms) */
  duration?: number;
  /** 끝난 후 콜백 */
  onDone?: () => void;
};

export default function SeedLaunch({
  trigger,
  startX,
  startY,
  emoji = '🌱',
  duration = 900,
  onDone,
}: Props) {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trigger == null) return;
    // 초기화
    translateY.setValue(0);
    translateX.setValue(0);
    scale.setValue(0.8);
    opacity.setValue(0);

    // 살짝 곡선을 그리며 위로 + 페이드아웃
    Animated.parallel([
      Animated.timing(translateY, { toValue: -240, duration, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(translateX, { toValue: 40, duration, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 120, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: duration - 120, useNativeDriver: true }),
      ]),
      Animated.timing(scale, { toValue: 1.2, duration: duration - 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start(() => {
      onDone?.();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.Text
        style={[
          styles.seed,
          {
            transform: [{ translateX }, { translateY }, { scale }],
            opacity,
            left: startX ?? '50%',
            bottom: startY ?? 40,
          },
        ]}
      >
        {emoji}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  seed: {
    position: 'absolute',
    fontSize: 34,
  },
});
