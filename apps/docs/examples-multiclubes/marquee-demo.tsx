import { Badge } from "@multiclubes/ui/components/badge";
import { Card, CardContent } from "@multiclubes/ui/components/card";
import { Marquee } from "@multiclubes/ui/components/marquee";

const ITEMS = ["Button", "Card", "Dialog", "Input", "Select", "Tabs", "Theme Toggle", "Date Field"];

export default function MarqueeDemo() {
  return (
    <Marquee pauseOnHover className="w-full max-w-2xl [--duration:30s]">
      {ITEMS.map((item) => (
        <Card key={item} className="w-40 py-4">
          <CardContent className="flex items-center justify-between gap-2 px-4">
            <span className="text-sm font-medium">{item}</span>
            <Badge variant="secondary">UI</Badge>
          </CardContent>
        </Card>
      ))}
    </Marquee>
  );
}
