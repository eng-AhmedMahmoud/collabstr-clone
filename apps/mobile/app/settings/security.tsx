import { useState } from "react";
import { Text } from "react-native";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { Card } from "@/components/Card";
import { useChangePassword } from "@/api/mutations";
import { useI18n } from "@/i18n/context";
import { useTheme } from "@/theme/context";
import { useToast } from "@/components/Toast";

export default function Security() {
  const { t } = useI18n();
  const { palette } = useTheme();
  const { toast } = useToast();
  const change = useChangePassword();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (next.length < 8) { setError(t.auth.minPassword); return; }
    try {
      await change.mutateAsync({ current, next });
      setCurrent(""); setNext("");
      toast(t.common.done, "success");
    } catch { setError(t.common.error); }
  };

  return (
    <Screen scroll padded header={<AppHeader title={t.settings.security} />}>
      <Card>
        <TextField label={t.settings.currentPw} value={current} onChangeText={setCurrent} secureTextEntry autoCapitalize="none" />
        <TextField label={t.settings.newPw} value={next} onChangeText={setNext} secureTextEntry autoCapitalize="none" />
        {error ? <Text style={{ color: palette.danger }}>{error}</Text> : null}
        <Button title={t.settings.changePw} onPress={submit} loading={change.isPending} />
      </Card>
    </Screen>
  );
}
