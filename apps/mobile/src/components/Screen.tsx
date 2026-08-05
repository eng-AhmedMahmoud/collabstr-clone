import type { ReactNode } from "react";
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform, type ViewStyle } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { useTheme } from "../theme/context";

type Props = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  header?: ReactNode;
  keyboard?: boolean;
  style?: ViewStyle;
  /** Which safe-area edges to inset. Defaults to top+left+right.
   *  Pass ["left","right"] for screens inside a Stack with a custom AppHeader
   *  (the header already consumes the top inset). */
  edges?: Edge[];
};

export function Screen({ children, scroll, padded = true, header, keyboard, style, edges = ["top", "left", "right"] }: Props) {
  const { palette } = useTheme();
  const bg = { backgroundColor: palette.bg };
  const contentStyle = padded ? styles.padded : undefined;

  const inner = scroll ? (
    <ScrollView
      contentContainerStyle={[contentStyle, style]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, contentStyle, style]}>{children}</View>
  );

  const body = (
    <SafeAreaView style={[styles.root, bg]} edges={edges}>
      {header}
      {inner}
    </SafeAreaView>
  );

  if (keyboard) {
    return (
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {body}
      </KeyboardAvoidingView>
    );
  }
  return body;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  padded: { padding: 16, gap: 12 },
});
