import { Tabs } from "expo-router";
import { useI18n } from "@/i18n/context";
import { AnimatedTabBar } from "@/components/AnimatedTabBar";

export default function TabsLayout() {
  const { t } = useI18n();
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <AnimatedTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: t.tabs.discover }} />
      <Tabs.Screen name="campaigns" options={{ title: t.tabs.campaigns }} />
      <Tabs.Screen name="inbox" options={{ title: t.tabs.inbox }} />
      <Tabs.Screen name="orders" options={{ title: t.tabs.orders }} />
      <Tabs.Screen name="account" options={{ title: t.tabs.account }} />
    </Tabs>
  );
}
