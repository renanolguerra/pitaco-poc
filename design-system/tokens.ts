export type DesignTokens = {
  colors: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    border: string;
    input: string;
    ring: string;
    statusPlanned: string;
    statusInProgress: string;
    statusDone: string;
  };
  sidebar: {
    background: string;
    foreground: string;
    primary: string;
    primaryForeground: string;
    accent: string;
    accentForeground: string;
    border: string;
    ring: string;
  };
  radius: string;
  spacing: Record<string, string>;
  typography: {
    fontSans: string;
    fontMono: string;
  };
};

export const tokens: DesignTokens = {
  colors: {
    background: "0 0% 100%",
    foreground: "222.2 84% 4.9%",
    card: "0 0% 100%",
    cardForeground: "222.2 84% 4.9%",
    popover: "0 0% 100%",
    popoverForeground: "222.2 84% 4.9%",
    primary: "221.2 83.2% 53.3%",
    primaryForeground: "210 40% 98%",
    secondary: "210 40% 96%",
    secondaryForeground: "222.2 47.4% 11.2%",
    muted: "210 40% 96%",
    mutedForeground: "215.4 16.3% 46.9%",
    accent: "210 40% 96%",
    accentForeground: "222.2 47.4% 11.2%",
    destructive: "0 84.2% 60.2%",
    destructiveForeground: "210 40% 98%",
    border: "214.3 31.8% 91.4%",
    input: "214.3 31.8% 91.4%",
    ring: "221.2 83.2% 53.3%",
    statusPlanned: "213 94% 68%",
    statusInProgress: "38 92% 50%",
    statusDone: "142 71% 45%",
  },
  sidebar: {
    background: "0 0% 98%",
    foreground: "240 5.3% 26.1%",
    primary: "240 5.9% 10%",
    primaryForeground: "0 0% 98%",
    accent: "240 4.8% 95.9%",
    accentForeground: "240 5.9% 10%",
    border: "220 13% 91%",
    ring: "217.2 91.2% 59.8%",
  },
  radius: "0.5rem",
  spacing: {
    "0": "0px", "1": "4px", "2": "8px", "3": "12px", "4": "16px",
    "5": "20px", "6": "24px", "8": "32px", "10": "40px", "12": "48px",
    "16": "64px", "20": "80px", "24": "96px",
  },
  typography: {
    fontSans: "Inter, system-ui, -apple-system, sans-serif",
    fontMono: "JetBrains Mono, Menlo, Monaco, monospace",
  },
};
