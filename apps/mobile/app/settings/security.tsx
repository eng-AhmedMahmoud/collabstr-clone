import { useState } from "react";
import { Text } from "react-native";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { Card } from "@/components/Card";
import { useChangePassword } from "@/api/mutations";
import { fieldErrorsFrom, apiErrorMessage } from "@/i18n/errors";
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const submit = async () => {
    setFormError(null);
    const nextErrors: Record<string, string> = {};
    if (!current) nextErrors.current = t.errors.passwordRequired;
    if (!next) nextErrors.next = t.errors.passwordRequired;
    else if (next.length < 8) nextErrors.next = t.errors.passwordMin;
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    setErrors({});
    try {
      await change.mutateAsync({ current, next });
      setCurrent(""); setNext("");
      toast(t.common.done, "success");
    } catch (e) {
      const fe = fieldErrorsFrom(e);
      if (fe) setErrors(fe);
      setFormError(apiErrorMessage(e, t, { on401: t.errors.invalidCredentials }));
    }
  };

  return (
    <Screen scroll padded header={<AppHeader title={t.settings.security} />}>
      <Card>
        <TextField label={t.settings.currentPw} value={current} onChangeText={setCurrent} secureTextEntry autoCapitalize="none" error={errors.current} />
        <TextField label={t.settings.newPw} value={next} onChangeText={setNext} secureTextEntry autoCapitalize="none" error={errors.next} />
        {formError ? <Text style={{ color: palette.danger }}>{formError}</Text> : null}
        <Button title={t.settings.changePw} onPress={submit} loading={change.isPending} />
      </Card>
    </Screen>
  );
}
