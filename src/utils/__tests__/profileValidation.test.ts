import {
  maskPhoneInput,
  sanitizePhoneInput,
  validateAvatarFile,
  validatePhoneE164,
  validateProfilePatch
} from "../profileValidation";

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
    name: "sanitizePhoneInput keeps plus and strips non-digits",
    run: () => {
      const value = sanitizePhoneInput("+91 97620-06688");
      assert(value === "+919762006688", `Expected +919762006688, received ${value}`);
    }
  },
  {
    name: "maskPhoneInput applies readable spacing",
    run: () => {
      const value = maskPhoneInput("+919762006688");
      assert(value === "+91 976 200 668 8", `Unexpected mask output: ${value}`);
    }
  },
  {
    name: "validatePhoneE164 accepts valid format",
    run: () => {
      assert(validatePhoneE164("+919762006688"), "Expected valid E.164 phone to pass");
    }
  },
  {
    name: "validatePhoneE164 rejects invalid format",
    run: () => {
      assert(!validatePhoneE164("9762006688"), "Expected missing plus sign to fail");
    }
  },
  {
    name: "validateProfilePatch enforces required display name",
    run: () => {
      const errors = validateProfilePatch({ display_name: " " });
      assert(errors.display_name === "Name is required.", "Display name validation did not trigger");
    }
  },
  {
    name: "validateProfilePatch enforces E.164 phone",
    run: () => {
      const errors = validateProfilePatch({ phone: "12345" });
      assert(
        errors.phone === "Phone must be in E.164 format (example: +919876543210).",
        "Phone validation did not trigger"
      );
    }
  },
  {
    name: "validateAvatarFile rejects oversized image",
    run: () => {
      const error = validateAvatarFile({
        uri: "file:///tmp/a.jpg",
        name: "a.jpg",
        type: "image/jpeg",
        size: 5 * 1024 * 1024 + 1
      });
      assert(error === "Image must be 5MB or smaller.", "Oversized image validation did not trigger");
    }
  },
  {
    name: "validateAvatarFile rejects unsupported image type",
    run: () => {
      const error = validateAvatarFile({
        uri: "file:///tmp/a.gif",
        name: "a.gif",
        type: "image/gif" as "image/jpeg",
        size: 200
      });
      assert(error === "Only JPG, PNG, and WEBP images are allowed.", "Image type validation did not trigger");
    }
  }
];

tests.forEach((test) => {
  test.run();
});

