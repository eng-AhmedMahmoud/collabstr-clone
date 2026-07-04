import { useState } from "react";
import { Text } from "react-native";
import { Screen } from "@/components/Screen";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { useTheme } from "@/theme/context";
import { useI18n } from "@/i18n/context";
import { useToast } from "@/components/Toast";

export default function Contact() {
  const { palette } = useTheme();
  const { t } = useI18n();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const submit = () => {
    if (!email || !msg) return;
    toast("Message sent.", "success");
    setEmail(""); setMsg("");
  };

  return (
    <Screen scroll padded header={<AppHeader title="Contact" />}>
      <Card>
        <Text style={{ color: palette.fg }}>hello@nakhla.dev</Text>
      </Card>
      <Card>
        <TextField label={t.auth.email} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextField label="Message" value={msg} onChangeText={setMsg} multiline numberOfLines={5} style={{ minHeight: 120, textAlignVertical: "top" }} />
        <Button title={t.common.send} onPress={submit} />
      </Card>
    </Screen>
  );
}
