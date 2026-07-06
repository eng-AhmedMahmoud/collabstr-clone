import { Alert } from "react-native";
import { useI18n } from "@/i18n/context";

export function useConfirm() {
  const { t } = useI18n();
  return (opts: { title: string; message?: string; okText?: string; cancelText?: string; destructive?: boolean }) =>
    new Promise<boolean>((resolve) => {
      Alert.alert(
        opts.title,
        opts.message,
        [
          { text: opts.cancelText ?? t.common.cancel, style: "cancel", onPress: () => resolve(false) },
          { text: opts.okText ?? t.common.confirm, style: opts.destructive ? "destructive" : "default", onPress: () => resolve(true) },
        ],
        { cancelable: true, onDismiss: () => resolve(false) },
      );
    });
}
