import type { Icon as TablerIconType } from "@tabler/icons-react";

export function Icon({ icon: IconComponent, size = 18 }: { icon: TablerIconType; size?: number }) {
  return <IconComponent size={size} stroke={1.5} aria-hidden="true" />;
}
