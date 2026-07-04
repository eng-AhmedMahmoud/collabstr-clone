import { useEffect, useRef } from "react";
import { Animated, StyleSheet, type ViewStyle } from "react-native";
import { useTheme } from "@/theme/context";
import { radius } from "@/theme";

type Props = { width?: number | string; height?: number; style?: ViewStyle };

export function Skeleton({ width = "100%", height = 16, style }: Props) {
  const { palette } = useTheme();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.base,
        { backgroundColor: palette.surface, width: width as any, height, opacity },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.sm },
});
