import { Stack } from "expo-router";
import { useTheme } from "@/theme/context";
import { AppHeader } from "@/components/AppHeader";

export default function AuthLayout() {
  const { palette } = useTheme();
  return (
    <Stack
      screenOptions={{
        header: (props) => <AppHeader title={typeof props.options.title === "string" ? props.options.title : ""} />,
        contentStyle: { backgroundColor: palette.bg },
      }}
    />
  );
}
