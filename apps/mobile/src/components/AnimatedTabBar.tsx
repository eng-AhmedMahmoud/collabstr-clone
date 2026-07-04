import { useEffect, useRef } from "react";
import {
  Animated,
  I18nManager,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useTheme } from "@/theme/context";
import { radius, spacing } from "@/theme";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type IconName = keyof typeof Ionicons.glyphMap;

const ICON_MAP: Record<string, IconName> = {
  index: "search",
  campaigns: "megaphone-outline",
  inbox: "chatbubbles-outline",
  orders: "receipt-outline",
  account: "person-circle-outline",
};

export function AnimatedTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { palette } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: palette.card,
          borderTopColor: palette.border,
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const label =
          typeof options.tabBarLabel === "string"
            ? options.tabBarLabel
            : (options.title ?? route.name);
        const icon = ICON_MAP[route.name] ?? "ellipse-outline";
        const onPress = () => {
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            (navigation as any).navigate(route.name, route.params);
          }
        };
        return (
          <TabButton
            key={route.key}
            label={label as string}
            icon={icon}
            focused={focused}
            onPress={onPress}
            palette={palette}
          />
        );
      })}
    </View>
  );
}

function TabButton({
  label,
  icon,
  focused,
  onPress,
  palette,
}: {
  label: string;
  icon: IconName;
  focused: boolean;
  onPress: () => void;
  palette: { brand: string; fg: string; fgMuted: string; surface: string };
}) {
  const scale = useRef(new Animated.Value(focused ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [focused, scale]);

  const iconScale = scale.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });
  const translateY = scale.interpolate({ inputRange: [0, 1], outputRange: [0, -2] });

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      style={styles.btn}
    >
      <Animated.View
        style={[
          styles.iconPill,
          focused && { backgroundColor: palette.brand + "22" },
          { transform: [{ translateY }] },
        ]}
      >
        <Animated.View style={{ transform: [{ scale: iconScale }] }}>
          <Ionicons
            name={icon}
            size={22}
            color={focused ? palette.brand : palette.fgMuted}
          />
        </Animated.View>
      </Animated.View>
      <Text
        numberOfLines={1}
        style={[
          styles.label,
          { color: focused ? palette.brand : palette.fgMuted, fontWeight: focused ? "700" : "500" },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 6,
    paddingHorizontal: spacing.sm,
  },
  btn: { flex: 1, alignItems: "center", justifyContent: "center", gap: 2 },
  iconPill: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  label: { fontSize: 11 },
});
