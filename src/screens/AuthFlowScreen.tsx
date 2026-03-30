import React, { useRef, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  NativeSyntheticEvent,
  NativeScrollEvent,
  useWindowDimensions
} from "react-native";

type AuthStage = "onboarding" | "login" | "signup";

type AuthFlowScreenProps = {
  onAuthenticated: () => void;
};

const ONBOARDING_SLIDES = [
  {
    id: "welcome",
    title: "Welcome to Planet App",
    subtitle: "Your society operations hub for gate control, notices, payments, and everyday resident updates.",
    icon: "🏙️"
  },
  {
    id: "gate-and-updates",
    title: "Gate, Notices and News",
    subtitle: "Approve visitors at the gate, receive community notices, and stay updated with real-time news feeds.",
    icon: "🔐"
  },
  {
    id: "payments-and-bookings",
    title: "Payments and Space Booking",
    subtitle: "Track dues, access payment flows, and book society spaces with a simple resident-first experience.",
    icon: "💳"
  }
];

export default function AuthFlowScreen({ onAuthenticated }: AuthFlowScreenProps) {
  const { width } = useWindowDimensions();
  const onboardingRef = useRef<ScrollView | null>(null);
  const [stage, setStage] = useState<AuthStage>("onboarding");
  const [activeSlide, setActiveSlide] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isOnboardingLast = activeSlide === ONBOARDING_SLIDES.length - 1;

  const onOnboardingScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const pageWidth = event.nativeEvent.layoutMeasurement.width;
    if (!pageWidth) {
      return;
    }
    const currentIndex = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
    if (currentIndex !== activeSlide) {
      setActiveSlide(currentIndex);
    }
  };

  const handleOnboardingContinue = () => {
    if (isOnboardingLast) {
      setStage("login");
      return;
    }
    const nextIndex = activeSlide + 1;
    onboardingRef.current?.scrollTo({ x: width * nextIndex, y: 0, animated: true });
    setActiveSlide(nextIndex);
  };

  const handleLogin = async () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    await wait(800);
    setLoading(false);
    onAuthenticated();
  };

  const handleSignup = async () => {
    setError("");
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Please complete all fields.");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Password and confirm password do not match.");
      return;
    }
    setLoading(true);
    await wait(1000);
    setLoading(false);
    onAuthenticated();
  };

  const handleSso = async () => {
    setError("");
    setLoading(true);
    await wait(700);
    setLoading(false);
    onAuthenticated();
  };

  if (stage === "onboarding") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={["#0B1020", "#181D33", "#2B2B4F"]} style={styles.gradient}>
          <View style={styles.brandWrap}>
            <Text style={styles.brandText}>Ultra Planet</Text>
          </View>

          <ScrollView
            ref={onboardingRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onOnboardingScroll}
            scrollEventThrottle={16}
            contentContainerStyle={styles.onboardingScrollContent}
          >
            {ONBOARDING_SLIDES.map((slide) => (
              <View key={slide.id} style={[styles.slide, { width }]}>
                <View style={styles.slideIconWrap}>
                  <Text style={styles.slideIcon}>{slide.icon}</Text>
                </View>
                <Text style={styles.slideTitle}>{slide.title}</Text>
                <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.paginationRow}>
            {ONBOARDING_SLIDES.map((slide, index) => (
              <View
                key={slide.id}
                style={[styles.paginationDot, index === activeSlide && styles.paginationDotActive]}
              />
            ))}
          </View>

          <View style={styles.onboardingActions}>
            <Pressable style={styles.secondaryButton} onPress={() => setStage("login")}>
              <Text style={styles.secondaryButtonText}>Skip</Text>
            </Pressable>
            <Pressable
              style={styles.primaryButton}
              onPress={handleOnboardingContinue}
            >
              <Text style={styles.primaryButtonText}>{isOnboardingLast ? "Get Started" : "Continue"}</Text>
            </Pressable>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const isSignup = stage === "signup";

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={["#080C1A", "#101A2F"]} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.authScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.authCard}>
            <Text style={styles.authTitle}>{isSignup ? "Create Account" : "Welcome Back"}</Text>
            <Text style={styles.authSubtitle}>
              {isSignup
                ? "Join your community in a few steps."
                : "Login to continue to your resident dashboard."}
            </Text>

            {isSignup ? (
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor="#93A0BE"
                  style={styles.input}
                />
              </View>
            ) : null}

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#93A0BE"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                placeholderTextColor="#93A0BE"
                secureTextEntry
                style={styles.input}
              />
            </View>

            {isSignup ? (
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter password"
                  placeholderTextColor="#93A0BE"
                  secureTextEntry
                  style={styles.input}
                />
              </View>
            ) : null}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              style={[styles.authPrimaryButton, loading && styles.authButtonDisabled]}
              onPress={isSignup ? handleSignup : handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0F1428" />
              ) : (
                <Text style={styles.authPrimaryButtonText}>{isSignup ? "Create Account" : "Login"}</Text>
              )}
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable style={styles.ssoButton} onPress={handleSso} disabled={loading}>
              <Text style={styles.ssoButtonIcon}>G</Text>
              <Text style={styles.ssoButtonText}>Continue with Google</Text>
            </Pressable>

            <Pressable style={styles.ssoButton} onPress={handleSso} disabled={loading}>
              <Text style={styles.ssoButtonIcon}></Text>
              <Text style={styles.ssoButtonText}>Continue with Apple</Text>
            </Pressable>

            <View style={styles.switchAuthRow}>
              <Text style={styles.switchAuthText}>
                {isSignup ? "Already have an account?" : "Don’t have an account?"}
              </Text>
              <Pressable onPress={() => setStage(isSignup ? "login" : "signup")}>
                <Text style={styles.switchAuthLink}>{isSignup ? "Login" : "Sign Up"}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

async function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#090D1A"
  },
  gradient: {
    flex: 1
  },
  brandWrap: {
    paddingTop: 8,
    alignItems: "center"
  },
  brandText: {
    color: "#EBECFF",
    fontFamily: "Noto Sans",
    fontSize: 18,
    fontWeight: "700"
  },
  onboardingScrollContent: {
    flexGrow: 1
  },
  slide: {
    paddingHorizontal: 28,
    justifyContent: "center",
    alignItems: "center"
  },
  slideIconWrap: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28
  },
  slideIcon: {
    fontSize: 56
  },
  slideTitle: {
    color: "#FFFFFF",
    fontFamily: "Noto Sans",
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 38
  },
  slideSubtitle: {
    marginTop: 14,
    color: "#CFD7F0",
    fontFamily: "Noto Sans",
    fontSize: 16,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 24
  },
  paginationRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "center",
    gap: 10
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.28)"
  },
  paginationDotActive: {
    width: 22,
    borderRadius: 5,
    backgroundColor: "#E1E7FF"
  },
  onboardingActions: {
    paddingHorizontal: 24,
    paddingBottom: 22,
    marginTop: 24,
    flexDirection: "row",
    gap: 12
  },
  secondaryButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center"
  },
  secondaryButtonText: {
    color: "#E4E8FF",
    fontFamily: "Noto Sans",
    fontSize: 16,
    fontWeight: "600"
  },
  primaryButton: {
    flex: 1.4,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#D8DDFB",
    alignItems: "center",
    justifyContent: "center"
  },
  primaryButtonText: {
    color: "#11162C",
    fontFamily: "Noto Sans",
    fontSize: 16,
    fontWeight: "700"
  },
  authScroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 24
  },
  authCard: {
    borderRadius: 24,
    backgroundColor: "rgba(18,23,40,0.9)",
    borderWidth: 1,
    borderColor: "rgba(123,138,186,0.28)",
    paddingHorizontal: 18,
    paddingVertical: 22
  },
  authTitle: {
    color: "#FFFFFF",
    fontFamily: "Noto Sans",
    fontSize: 28,
    fontWeight: "700"
  },
  authSubtitle: {
    marginTop: 8,
    color: "#AEB9D8",
    fontFamily: "Noto Sans",
    fontSize: 14,
    lineHeight: 20
  },
  inputWrap: {
    marginTop: 14
  },
  inputLabel: {
    color: "#E6EBFF",
    fontFamily: "Noto Sans",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8
  },
  input: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2C3554",
    backgroundColor: "#0E1325",
    color: "#FFFFFF",
    fontFamily: "Noto Sans",
    fontSize: 14,
    paddingHorizontal: 14
  },
  errorText: {
    marginTop: 12,
    color: "#FF8A9E",
    fontFamily: "Noto Sans",
    fontSize: 13,
    fontWeight: "600"
  },
  authPrimaryButton: {
    marginTop: 16,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#D8DDFB",
    alignItems: "center",
    justifyContent: "center"
  },
  authButtonDisabled: {
    opacity: 0.7
  },
  authPrimaryButtonText: {
    color: "#11162C",
    fontFamily: "Noto Sans",
    fontSize: 16,
    fontWeight: "700"
  },
  dividerRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#2D3552"
  },
  dividerText: {
    color: "#8E9ABC",
    fontFamily: "Noto Sans",
    fontSize: 12,
    fontWeight: "500"
  },
  ssoButton: {
    marginTop: 10,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#141B31",
    borderWidth: 1,
    borderColor: "#2C3554",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10
  },
  ssoButtonIcon: {
    color: "#FFFFFF",
    fontFamily: "Noto Sans",
    fontSize: 18,
    fontWeight: "700"
  },
  ssoButtonText: {
    color: "#E9EEFF",
    fontFamily: "Noto Sans",
    fontSize: 14,
    fontWeight: "600"
  },
  switchAuthRow: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6
  },
  switchAuthText: {
    color: "#A5B0CD",
    fontFamily: "Noto Sans",
    fontSize: 13
  },
  switchAuthLink: {
    color: "#DDE4FF",
    fontFamily: "Noto Sans",
    fontSize: 13,
    fontWeight: "700"
  }
});
