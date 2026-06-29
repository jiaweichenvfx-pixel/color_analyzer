import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HarmonyCard } from "./HarmonyCard";
import type { HarmonyScheme } from "@/types/color";

interface HarmonyTabsProps {
  harmonies: HarmonyScheme[];
}

export function HarmonyTabs({ harmonies }: HarmonyTabsProps) {
  return (
    <Tabs defaultValue="0" className="w-full">
      <TabsList className="grid grid-cols-5 mb-4">
        {harmonies.map((h, i) => (
          <TabsTrigger key={i} value={String(i)} className="text-xs">
            {h.name}
          </TabsTrigger>
        ))}
      </TabsList>
      {harmonies.map((h, i) => (
        <TabsContent key={i} value={String(i)}>
          <HarmonyCard scheme={h} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
