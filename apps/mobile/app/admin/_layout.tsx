import { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { useAuth } from "@/auth/context";

export default function AdminLayout() {
  const { me, hydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && (!me || me.role !== "admin")) {
      router.replace("/(tabs)/account");
    }
  }, [hydrated, me, router]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
