import { getContrastRatio, passesWcagAaNormalText } from "../wcag";

type TestCase = {
  name: string;
  run: () => void;
};

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const tests: TestCase[] = [
  {
    name: "dark theme primary text contrast on screen background",
    run: () => {
      const ratio = getContrastRatio("#FFFFFF", "#060B1D");
      assert(ratio >= 4.5, `Expected >= 4.5, got ${ratio.toFixed(2)}`);
      assert(passesWcagAaNormalText("#FFFFFF", "#060B1D"), "Expected WCAG AA pass");
    }
  },
  {
    name: "light theme primary text contrast on screen background",
    run: () => {
      const ratio = getContrastRatio("#101A35", "#F3F6FF");
      assert(ratio >= 4.5, `Expected >= 4.5, got ${ratio.toFixed(2)}`);
      assert(passesWcagAaNormalText("#101A35", "#F3F6FF"), "Expected WCAG AA pass");
    }
  },
  {
    name: "light theme muted text contrast on card background",
    run: () => {
      const ratio = getContrastRatio("#3D4F7A", "#FFFFFF");
      assert(ratio >= 4.5, `Expected >= 4.5, got ${ratio.toFixed(2)}`);
    }
  }
];

tests.forEach((test) => test.run());

