## 🎯 ASSET EXTRACTION & USAGE (CRITICAL)

Before coding, you MUST:

1. Identify all assets from design:

   * icons
   * vector graphics
   * images
   * illustrations

2. List them explicitly before implementation

---

## ASSET USAGE RULE

* ALL identified assets MUST be included in code
* Do NOT skip icons or images
* Do NOT replace with placeholders

---

## SVG / VECTOR HANDLING

* Use SVG for icons (react-native-svg or similar)
* Preserve:

  * colors
  * stroke width
  * dimensions

Do NOT simplify vector graphics

---

## IMAGE HANDLING

* Use correct image source
* Maintain aspect ratio
* Do NOT stretch or distort

---

## MISSING ASSET RULE (IMPORTANT)

If asset is NOT available:

* DO NOT skip it silently
* Explicitly mention missing asset
* Suggest placeholder WITH explanation

---

## ASSET VALIDATION (MANDATORY)

Before returning code, verify:

* all icons are present
* all images are included
* no asset is missing
* UI matches design visually

If anything is missing:
→ fix before returning

---
