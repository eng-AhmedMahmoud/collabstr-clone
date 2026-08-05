import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { useTheme } from "../theme/context";
import { useI18n } from "../i18n/context";
import { radius } from "../theme";

type Props = TextInputProps & {
  label?: string;
  error?: string | null;
};

export function TextField({ label, error, style, ...rest }: Props) {
  const { palette } = useTheme();
  const { isRTL } = useI18n();
  const align = isRTL ? "right" : "left";
  return (
    <View style={styles.wrap}>
      {label ? <Text style={[styles.label, { color: palette.fgMuted, textAlign: align }]}>{label}</Text> : null}
      <TextInput
        {...rest}
        placeholderTextColor={palette.fgMuted}
        style={[
          styles.input,
          {
            color: palette.fg,
            backgroundColor: palette.card,
            borderColor: error ? palette.danger : palette.border,
            textAlign: align,
          },
          style,
        ]}
      />
      {error ? <Text style={[styles.error, { color: palette.danger, textAlign: align }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontSize: 13, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  error: { fontSize: 12 },
});
