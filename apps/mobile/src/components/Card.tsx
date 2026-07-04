import { StyleSheet, View, type ViewProps, type ViewStyle } from "react-native";
import { useTheme } from "@/theme/context";
import { radius, spacing } from "@/theme";

type Props = ViewProps & { padded?: boolean };

export function Card({ children, style, padded = true, ...rest }: Props) {
  const { palette } = useTheme();
  return (
    <View
      {...rest}
      style={[
        styles.base,
        { backgroundColor: palette.card, borderColor: palette.border },
        padded && styles.padded,
        style as ViewStyle,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.lg, borderWidth: 1, gap: spacing.sm },
  padded: { padding: spacing.md },
});
