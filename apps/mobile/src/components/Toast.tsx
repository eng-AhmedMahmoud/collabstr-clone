import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/context";
import { radius, spacing } from "@/theme";

type Tone = "info" | "success" | "error";
type ToastItem = { id: number; text: string; tone: Tone };

type ToastCtx = {
  toast: (text: string, tone?: Tone) => void;
};

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const toast = useCallback((text: string, tone: Tone = "info") => {
    const id = nextId.current++;
    setItems((prev) => [...prev, { id, text, tone }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }, 3200);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <ToastStack items={items} />
    </Ctx.Provider>
  );
}

function ToastStack({ items }: { items: ToastItem[] }) {
  const insets = useSafeAreaInsets();
  return (
    <View pointerEvents="none" style={[styles.stack, { bottom: insets.bottom + 80 }]}>
      {items.map((it) => (
        <ToastPill key={it.id} item={it} />
      ))}
    </View>
  );
}

function ToastPill({ item }: { item: ToastItem }) {
  const { palette } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 8 }),
    ]).start();
  }, [opacity, translateY]);
  const bg =
    item.tone === "success" ? palette.success :
    item.tone === "error" ? palette.danger :
    palette.fg;
  return (
    <Animated.View style={[styles.pill, { backgroundColor: bg, opacity, transform: [{ translateY }] }]}>
      <Text style={styles.text}>{item.text}</Text>
    </Animated.View>
  );
}

export function useToast(): ToastCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useToast outside ToastProvider");
  return v;
}

const styles = StyleSheet.create({
  stack: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    gap: spacing.sm,
    alignItems: "center",
  },
  pill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radius.pill,
    maxWidth: "100%",
  },
  text: { color: "#fff", fontWeight: "600", fontSize: 14 },
});
