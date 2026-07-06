import type {CSSProperties} from "react";
import {theme} from "./theme";

export const subtitleSafeArea = {
  bottom: 24,
  horizontalInset: 96,
  maxWidth: 900,
} as const;

export const subtitleBoxStyle: CSSProperties = {
  maxWidth: subtitleSafeArea.maxWidth,
  boxSizing: "border-box",
  padding: "12px 20px",
  borderRadius: 7,
  background: "rgba(17, 24, 39, 0.74)",
  color: theme.colors.white,
  fontFamily: theme.typography.family,
  fontSize: 24,
  lineHeight: 1.18,
  fontWeight: 620,
  textAlign: "center",
  boxShadow: "0 12px 38px rgba(17, 24, 39, 0.18)",
};
