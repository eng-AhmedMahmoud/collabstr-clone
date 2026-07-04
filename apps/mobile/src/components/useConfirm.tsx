import { Alert } from "react-native";

export function useConfirm() {
  return (opts: { title: string; message?: string; okText?: string; cancelText?: string; destructive?: boolean }) =>
    new Promise<boolean>((resolve) => {
      Alert.alert(
        opts.title,
        opts.message,
        [
          { text: opts.cancelText ?? "Cancel", style: "cancel", onPress: () => resolve(false) },
          { text: opts.okText ?? "OK", style: opts.destructive ? "destructive" : "default", onPress: () => resolve(true) },
        ],
        { cancelable: true, onDismiss: () => resolve(false) },
      );
    });
}
