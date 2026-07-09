import {createContext, type ReactNode, useContext, useEffect, useState} from "react";
import {cancelRender, continueRender, delayRender, staticFile} from "remotion";
import {theme as legacyTheme} from "../../../../styles/theme";

export type ShowcaseBrandMode = "legacy" | "oracle-redwood";

const oracleColors = {
  background: "#F1EFED",
  surface: "#FFFFFF",
  surfaceMuted: "#E9E5E1",
  ink: "#161513",
  inkSoft: "#312D2A",
  muted: "#697778",
  line: "#D7D1CC",
  lineStrong: "#A9A39D",
  accent: "#C74634",
  accentSoft: "#F8E2DE",
  teal: "#5C926D",
  tealSoft: "#E3EEE6",
  gold: "#F1B13F",
  goldSoft: "#FFF0D2",
  red: "#C74634",
  redSoft: "#F8E2DE",
  violet: "#DEB068",
  violetSoft: "#F4E6D0",
  code: "#3C4545",
  codeSoft: "#505A5A",
  white: "#FFFFFF",
};

export const oracleTheme: typeof legacyTheme = {
  ...legacyTheme,
  colors: oracleColors,
  gradients: {
    page: "linear-gradient(135deg, #F1EFED 0%, #FFFFFF 54%, #E9E5E1 100%)",
    aurora: "linear-gradient(135deg, #F8E2DE 0%, #E3EEE6 54%, #F4E6D0 100%)",
    accent: "linear-gradient(135deg, #C74634 0%, #DEB068 100%)",
    dark: "linear-gradient(135deg, #3C4545 0%, #293131 100%)",
  },
  typography: {
    ...legacyTheme.typography,
    family: "Oracle Sans, Arial, sans-serif",
  },
  radius: {
    sm: 6,
    md: 12,
    lg: 18,
    pill: 999,
  },
  shadow: {
    soft: "0 20px 60px rgba(49,45,42,0.14)",
    line: "0 0 0 1px rgba(105,119,120,0.38)",
  },
};

const BrandContext = createContext<ShowcaseBrandMode>("legacy");

const oracleFontCss = `
@font-face { font-family: 'Oracle Sans'; src: url('${staticFile("brand/oracle/fonts/OracleSans_Rg.ttf")}') format('truetype'); font-weight: 400; font-style: normal; font-display: block; }
@font-face { font-family: 'Oracle Sans'; src: url('${staticFile("brand/oracle/fonts/OracleSans_SBd.ttf")}') format('truetype'); font-weight: 600; font-style: normal; font-display: block; }
@font-face { font-family: 'Oracle Sans'; src: url('${staticFile("brand/oracle/fonts/OracleSans_Bd.ttf")}') format('truetype'); font-weight: 700; font-style: normal; font-display: block; }
@font-face { font-family: 'Oracle Sans'; src: url('${staticFile("brand/oracle/fonts/OracleSans_XBd.ttf")}') format('truetype'); font-weight: 800; font-style: normal; font-display: block; }
`;

const OracleFontGate = ({children}: {children: ReactNode}) => {
  const [handle] = useState(() => delayRender("Loading bundled Oracle Sans fonts"));

  useEffect(() => {
    Promise.all([
      document.fonts.load("400 16px 'Oracle Sans'"),
      document.fonts.load("600 16px 'Oracle Sans'"),
      document.fonts.load("700 16px 'Oracle Sans'"),
      document.fonts.load("800 16px 'Oracle Sans'"),
    ])
      .then(() => continueRender(handle))
      .catch((error) => cancelRender(error));
  }, [handle]);

  return <>{children}</>;
};

export const ShowcaseBrandProvider = ({mode, children}: {mode: ShowcaseBrandMode; children: ReactNode}) => (
  <BrandContext.Provider value={mode}>
    {mode === "oracle-redwood" ? (
      <>
        <style>{oracleFontCss}</style>
        <OracleFontGate>{children}</OracleFontGate>
      </>
    ) : children}
  </BrandContext.Provider>
);

export const useShowcaseBrand = () => useContext(BrandContext);
export const useOracleBrand = () => useShowcaseBrand() === "oracle-redwood";
export const useShowcaseTheme = () => useOracleBrand() ? oracleTheme : legacyTheme;

export const colorForTone = (
  theme: typeof legacyTheme,
  tone: string,
) => theme.colors[tone as keyof typeof theme.colors] ?? theme.colors.accent;

export const oracleAssets = {
  logo: staticFile("brand/oracle/logos/Oracle_rgb_#c74634.png"),
  o: staticFile("brand/oracle/logos/TheO_rgb_#c74634.png"),
  oTag: staticFile("brand/oracle/logos/Oracle red tag rgb_#c74634.png"),
  texture: staticFile("brand/oracle/textures/96dpi_DataTexture_10a.png"),
  icons: {
    engineer: staticFile("brand/oracle/icons/RMIL_Personas_Developer-M_Bark_RGB.svg"),
    product: staticFile("brand/oracle/icons/RMIL_Personas_Business-Person-LOB-F_Bark_RGB.svg"),
    leadership: staticFile("brand/oracle/icons/RMIL_Personas_Executive-Male_Bark_RGB.svg"),
    automation: staticFile("brand/oracle/icons/RMIL_Tech_Automation-CX_Bark_RGB.svg"),
    codex: staticFile("brand/oracle/icons/RMIL_Technology_Chatbot_Bark_RGB.svg"),
    traceability: staticFile("brand/oracle/icons/RMIL_Technology_Buttons-Links_Bark_RGB.svg"),
  },
};

export const OracleIcon = ({src, size = 56}: {src: string; size?: number}) => (
  <img src={src} style={{width: size, height: size, objectFit: "contain"}} />
);
