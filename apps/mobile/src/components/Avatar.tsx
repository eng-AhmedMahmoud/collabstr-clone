import { Image, StyleSheet, type ImageStyle } from "react-native";

type Props = {
  uri?: string | null;
  seed?: string;
  size?: number;
  style?: ImageStyle;
};

export function Avatar({ uri, seed, size = 40, style }: Props) {
  const fallback = `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed ?? "nakhla")}`;
  return (
    <Image
      source={{ uri: uri || fallback }}
      style={[styles.base, { width: size, height: size, borderRadius: size / 2 }, style]}
    />
  );
}

const styles = StyleSheet.create({
  base: { backgroundColor: "#e5e7eb" },
});
