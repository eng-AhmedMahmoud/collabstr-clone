import { Stack, useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { useI18n } from "@/i18n/context";

export default function NotFound() {
  const { t } = useI18n();
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: "" }} />
      <Screen padded>
        <EmptyState
          title={t.errors.pageNotFound}
          icon="compass-outline"
          action={<Button title={t.common.goHome} onPress={() => router.replace("/(tabs)")} />}
        />
      </Screen>
    </>
  );
}
