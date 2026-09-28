import assert from "node:assert/strict";
import test from "node:test";
import { ethnicityThemes, getEthnicityTheme } from "../lib/ethnicity-colors.ts";

const expectedColors = new Map([
  ["Apurinã", "#83bc43"],
  ["Caboclo", "#997052"],
  ["Huni Kuin", "#bfa771"],
  ["Katukina", "#79bc43"],
  ["Kuntanawa", "#606161"],
  ["Nukini", "#dc9c41"],
  ["Puyanawa", "#ba9b80"],
  ["Shanenawa", "#0568a7"],
  ["Shawãdawa", "#ec2326"],
  ["Yawanawa", "#2f2f2a"],
]);

const expectedForegrounds = new Map([
  ["Apurinã", "#000000"],
  ["Caboclo", "#000000"],
  ["Huni Kuin", "#000000"],
  ["Katukina", "#000000"],
  ["Kuntanawa", "#ffffff"],
  ["Nukini", "#000000"],
  ["Puyanawa", "#000000"],
  ["Shanenawa", "#ffffff"],
  ["Shawãdawa", "#000000"],
  ["Yawanawa", "#ffffff"],
]);

function luminance(hex) {
  const channels = hex.match(/[a-f\d]{2}/gi).map((channel) => {
    const value = Number.parseInt(channel, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(first, second) {
  const lighter = Math.max(luminance(first), luminance(second));
  const darker = Math.min(luminance(first), luminance(second));
  return (lighter + 0.05) / (darker + 0.05);
}

test("mantém o mapeamento canônico de cores das etnias", () => {
  assert.equal(ethnicityThemes.length, expectedColors.size);
  for (const theme of ethnicityThemes) {
    assert.equal(theme.accent, expectedColors.get(theme.name));
  }
});

test("usa o foreground neutro de maior contraste e mantém WCAG AA", () => {
  for (const theme of ethnicityThemes) {
    const blackContrast = contrast(theme.accent, "#000000");
    const whiteContrast = contrast(theme.accent, "#ffffff");
    assert.equal(theme.foreground, expectedForegrounds.get(theme.name));
    assert.equal(theme.foreground, blackContrast >= whiteContrast ? "#000000" : "#ffffff");
    assert.ok(Math.max(blackContrast, whiteContrast) >= 4.5);
  }
});

test("resolve a cor pela categoria estruturada do produto", () => {
  assert.equal(
    getEthnicityTheme([{ name: "Apurinã", slug: "rape-apurina" }])?.accent,
    "#83bc43",
  );
  assert.equal(
    getEthnicityTheme([{ name: "Shawãdawa", slug: "shawadawa" }])?.accent,
    "#ec2326",
  );
});

test("não infere etnia quando só existe a categoria genérica de rapé", () => {
  assert.equal(getEthnicityTheme([{ name: "Rapé", slug: "rape" }]), undefined);
});
