"use client";

import { useEffect } from "react";

const ADOBE_FONTS_STYLESHEET = "https://use.typekit.net/vjh7vll.css";

export function AdobeFontsStylesheet() {
  useEffect(() => {
    if (document.querySelector(`link[href="${ADOBE_FONTS_STYLESHEET}"]`)) return;

    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = ADOBE_FONTS_STYLESHEET;
    stylesheet.dataset.adobeFonts = "medicina-sagrada";
    document.head.append(stylesheet);
  }, []);

  return (
    <noscript>
      <link rel="stylesheet" href={ADOBE_FONTS_STYLESHEET} />
    </noscript>
  );
}
