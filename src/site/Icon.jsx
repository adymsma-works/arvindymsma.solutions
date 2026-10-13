import { ICONS } from "./icons-data.js";

/** Inline SVG icon. Decorative by default (aria-hidden); label the button, not the icon. */
export default function Icon({ name, className = "ic", sw = 1.75, style }) {
  const filled = name === "play";
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={style}
      dangerouslySetInnerHTML={{ __html: ICONS[name] || "" }}
    />
  );
}
