import { Image, StyleSheet, type ImageStyle } from "react-native";

type Props = {
  uri?: string | null;
  seed?: string;
  size?: number;
  style?: ImageStyle;
};

export function Avatar({ uri, seed, size = 40, style }: Props) {
  // Dummy influencer face photos (deterministic by seed). RN <Image> can't
  // render SVG, and the dicebear PNG endpoint left blank circles on device.
  const fallback = `https://i.pravatar.cc/300?u=${encodeURIComponent(seed ?? "nakhla")}`;
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
