function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const normalized = clean.length === 3 ? clean.split("").map((v) => `${v}${v}`).join("") : clean;
  const value = parseInt(normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255
  };
}

function srgbToLinear(value) {
  const v = value / 255;
  if (v <= 0.03928) return v / 12.92;
  return ((v + 0.055) / 1.055) ** 2.4;
}

function ratio(fg, bg) {
  const f = hexToRgb(fg);
  const b = hexToRgb(bg);
  const l1 = 0.2126 * srgbToLinear(f.r) + 0.7152 * srgbToLinear(f.g) + 0.0722 * srgbToLinear(f.b);
  const l2 = 0.2126 * srgbToLinear(b.r) + 0.7152 * srgbToLinear(b.g) + 0.0722 * srgbToLinear(b.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const checks = [
  { name: "Dark primary text vs dark screen", fg: "#FFFFFF", bg: "#060B1D" },
  { name: "Dark secondary text vs dark card", fg: "#E7EBFA", bg: "#20253D" },
  { name: "Light primary text vs light screen", fg: "#101A35", bg: "#F3F6FF" },
  { name: "Light muted text vs light card", fg: "#3D4F7A", bg: "#FFFFFF" },
  { name: "Light secondary button text vs light card", fg: "#1E2C54", bg: "#FFFFFF" }
];

let hasFailure = false;
for (const check of checks) {
  const value = ratio(check.fg, check.bg);
  const pass = value >= 4.5;
  if (!pass) hasFailure = true;
  console.log(`${pass ? "PASS" : "FAIL"} ${check.name}: ${value.toFixed(2)}:1`);
}

if (hasFailure) {
  process.exit(1);
}

