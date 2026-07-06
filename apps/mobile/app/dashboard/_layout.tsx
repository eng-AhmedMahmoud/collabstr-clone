import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/auth/context";

// Dashboard screens (brand/creator/packages) all hit authed endpoints —
// guard during render so guests never see them flash.
export default function DashboardLayout() {
  const { me, hydrated } = useAuth();

  if (!hydrated) return null;
  if (!me) return <Redirect href="/(auth)/login" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
