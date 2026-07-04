import { Pressable, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { Avatar } from "./Avatar";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { useToast } from "./Toast";
import { useUploadAvatar } from "@/api/mutations";
import { spacing } from "@/theme";

type Props = {
  uri?: string | null;
  seed?: string;
  onUploaded?: (url: string) => void;
};

export function AvatarPicker({ uri, seed, onUploaded }: Props) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const { toast } = useToast();
  const upload = useUploadAvatar();

  const pick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      toast(t.errors.forbidden, "error");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    try {
      const res = await upload.mutateAsync({
        uri: asset.uri,
        name: asset.fileName ?? undefined,
        mimeType: asset.mimeType ?? undefined,
      });
      onUploaded?.(res.url);
      toast(t.common.done, "success");
    } catch { toast(t.common.error, "error"); }
  };

  return (
    <Pressable
      onPress={pick}
      style={({ pressed }) => [styles.wrap, { opacity: pressed ? 0.85 : 1 }]}
      accessibilityRole="button"
      accessibilityLabel={t.settings.avatarUrl}
    >
      <View>
        <Avatar uri={uri} seed={seed} size={96} />
        <View style={[styles.badge, { backgroundColor: palette.brand, borderColor: palette.bg }]}>
          <Ionicons name={upload.isPending ? "hourglass" : "camera"} size={16} color="#fff" />
        </View>
      </View>
      <Text style={{ color: palette.brand, fontWeight: "700", marginTop: spacing.sm }}>{t.common.edit}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: spacing.xs },
  badge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
});
