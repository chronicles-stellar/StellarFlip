declare module "lucide-react" {
  import type { FC, SVGProps } from "react";

  export type LucideProps = SVGProps<SVGSVGElement> & {
    size?: string | number;
    absoluteStrokeWidth?: boolean;
  };

  export const ArrowUpRight: FC<LucideProps>;
  export const Crown: FC<LucideProps>;
  export const Flag: FC<LucideProps>;
  export const Gauge: FC<LucideProps>;
  export const Gift: FC<LucideProps>;
  export const Loader2: FC<LucideProps>;
  export const LogOut: FC<LucideProps>;
  export const Orbit: FC<LucideProps>;
  export const RefreshCw: FC<LucideProps>;
  export const Rocket: FC<LucideProps>;
  export const Sparkles: FC<LucideProps>;
  export const Stars: FC<LucideProps>;
  export const TimerReset: FC<LucideProps>;
  export const Trophy: FC<LucideProps>;
  export const Volume2: FC<LucideProps>;
  export const VolumeX: FC<LucideProps>;
  export const Wallet: FC<LucideProps>;
  export const Zap: FC<LucideProps>;
}
