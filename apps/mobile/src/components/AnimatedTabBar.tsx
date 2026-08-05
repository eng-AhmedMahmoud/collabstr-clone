import { useEffect, useRef } from "react";
import {
  Animated,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";
import type { ComponentProps } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Tabs } from "expo-router";
import { useTheme } from "@/theme/context";

// Infer the exact props expo-router's <Tabs tabBar={...}> passes, instead of
// importing @react-navigation/bottom-tabs' BottomTabBarProps directly — the two
// can resolve to different copies of the @react-navigation types and mismatch.
type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0];
import { radius, spacing } from "@/theme";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type IconName = keyof typeof Ionicons.glyphMap;

// Outline at rest, filled when focused — the swap reads as a "lit up" state.
const ICON_MAP: Record<string, { active: IconName; inactive: IconName }> = {
  index: { active: "search", inactive: "search-outline" },
  campaigns: { active: "megaphone", inactive: "megaphone-outline" },
  inbox: { active: "chatbubbles", inactive: "chatbubbles-outline" },
  orders: { active: "receipt", inactive: "receipt-outline" },
  account: { active: "person-circle", inactive: "person-circle-outline" },
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
        const icon = ICON_MAP[route.name] ?? { active: "ellipse", inactive: "ellipse-outline" };
        const onPress = () => {
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            Haptics.selectionAsync().catch(() => {});
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
  icon: { active: IconName; inactive: IconName };
  focused: boolean;
  onPress: () => void;
  palette: { brand: string; fg: string; fgMuted: string; surface: string };
}) {
  const focus = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const press = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(focus, {
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
      speed: 20,
      bounciness: 12,
    }).start();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [focused, focus]);

  const pressIn = () =>
    Animated.spring(press, { toValue: 0.85, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  const pressOut = () =>
    Animated.spring(press, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 12 }).start();

  const iconScale = focus.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });
  const translateY = focus.interpolate({ inputRange: [0, 1], outputRange: [0, -2] });

  return (
    <Pressable
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      style={styles.btn}
    >
      <Animated.View style={[styles.iconPill, { transform: [{ translateY }, { scale: press }] }]}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.pillBg,
            { backgroundColor: palette.brand + "22", opacity: focus },
          ]}
        />
        <Animated.View style={{ transform: [{ scale: iconScale }] }}>
          <Ionicons
            name={focused ? icon.active : icon.inactive}
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
    // Plain "row" — RN already mirrors flex rows under RTL; row-reverse here
    // double-flipped the tab order.
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 6,
    paddingHorizontal: spacing.sm,
  },
  btn: { flex: 1, alignItems: "center", justifyContent: "center", gap: 2 },
  iconPill: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  pillBg: { borderRadius: radius.pill },
  label: { fontSize: 11 },
});
