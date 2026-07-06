import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/auth/context";

export default function AdminLayout() {
  const { me, hydrated } = useAuth();

  // Guard during render — a useEffect redirect briefly flashes admin content
  // (and data fetches) to non-admins before kicking them out.
  if (!hydrated) return null;
  if (!me || me.role !== "admin") return <Redirect href="/(tabs)/account" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
