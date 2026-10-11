import { fontFamily } from "@/constants/fonts";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCart } from "../../contexts/CartContext";

const BG = "#F7F8F5";
const TITLE = "#1E4146";
const AUTO_RETURN_MS = 5000;
const AUTO_RETURN_SEC = 5;

function formatOrderCode(orderId?: string): string {
  if (!orderId) return "#GG-0000";
  const tail = orderId.replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase();
  return `#GG-${tail || "0000"}`;
}

type FloatConfig = {
  emoji: string;
  style: object;
  delay: number;
  duration: number;
  driftX: number;
  driftY: number;
  rotate: string;
};

function FloatingEmoji({
  emoji,
  style,
  delay,
  duration,
  driftX,
  driftY,
  rotate,
}: FloatConfig) {
  const float = useRef(new Animated.Value(0)).current;
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const enterAnim = Animated.spring(enter, {
      toValue: 1,
      delay,
      friction: 6,
      tension: 60,
      useNativeDriver: true,
    });

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    enterAnim.start(() => loop.start());
    return () => {
      enterAnim.stop();
      loop.stop();
    };
  }, [delay, duration, enter, float]);

  const translateX = float.interpolate({
    inputRange: [0, 1],
    outputRange: [0, driftX],
  });
  const translateY = float.interpolate({
    inputRange: [0, 1],
    outputRange: [0, driftY],
  });
  const wobble = float.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["-4deg", "5deg", "-4deg"],
  });

  return (
    <Animated.View
      style={[
        styles.floatEmoji,
        style,
        {
          opacity: enter,
          transform: [
            { scale: enter },
            { translateX },
            { translateY },
            { rotate },
            { rotate: wobble },
          ],
        },
      ]}
      pointerEvents="none"
    >
      <Text style={styles.floatEmojiText}>{emoji}</Text>
    </Animated.View>
  );
}

export default function OrderSuccessScreen() {
  const { orderId } = useLocalSearchParams<{
    restaurantId?: string;
    orderId?: string;
    deliveryFee?: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { clearCart } = useCart();
  const progress = useRef(new Animated.Value(0)).current;
  const didNavigate = useRef(false);
  const [secondsLeft, setSecondsLeft] = useState(AUTO_RETURN_SEC);

  const goHome = () => {
    if (didNavigate.current) return;
    didNavigate.current = true;
    router.replace("/(tabs)");
  };

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  useEffect(() => {
    progress.setValue(0);
    setSecondsLeft(AUTO_RETURN_SEC);

    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: AUTO_RETURN_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    anim.start(({ finished }) => {
      if (finished) goHome();
    });

    const tick = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(tick);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      anim.stop();
      clearInterval(tick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const orderCode = formatOrderCode(
    Array.isArray(orderId) ? orderId[0] : orderId,
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.glowOuter} pointerEvents="none" />

      <View style={styles.content}>
        <View style={styles.hero}>
          <View style={styles.heroGlow} />
          <View style={styles.heroBlur} />
          <View style={styles.dashRing} />

          <View style={styles.checkCircle}>
            <View style={styles.checkShine} />
            <Ionicons name="checkmark" size={52} color="#FFFFFF" />
          </View>

          <FloatingEmoji
            emoji="🍔"
            style={styles.emojiTL}
            delay={80}
            duration={2200}
            driftX={-6}
            driftY={-10}
            rotate="-10deg"
          />
          <FloatingEmoji
            emoji="🍕"
            style={styles.emojiTR}
            delay={160}
            duration={2400}
            driftX={8}
            driftY={-12}
            rotate="12deg"
          />
          <FloatingEmoji
            emoji="🌮"
            style={styles.emojiMR}
            delay={220}
            duration={2100}
            driftX={10}
            driftY={6}
            rotate="16deg"
          />
          <FloatingEmoji
            emoji="🍣"
            style={styles.emojiBR}
            delay={280}
            duration={2500}
            driftX={6}
            driftY={10}
            rotate="-8deg"
          />
          <FloatingEmoji
            emoji="🥤"
            style={styles.emojiBL}
            delay={120}
            duration={2300}
            driftX={-8}
            driftY={8}
            rotate="-6deg"
          />
          <FloatingEmoji
            emoji="🍩"
            style={styles.emojiML}
            delay={200}
            duration={2600}
            driftX={-10}
            driftY={-4}
            rotate="8deg"
          />
        </View>

        <Text style={styles.title}>შეკვეთა{"\n"}დადასტურებულია</Text>
        <Text style={styles.subtitle}>შენი შეკვეთა წარმატებით მივიღეთ</Text>

        <View style={styles.orderPill}>
          <View style={styles.orderDotOuter}>
            <View style={styles.orderDot} />
          </View>
          <Text style={styles.orderPillLabel}>შეკვეთა</Text>
          <Text style={styles.orderPillCode}>{orderCode}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}
        onPress={goHome}
        activeOpacity={0.85}
      >
        <Text style={styles.footerHint}>
          მთავარ გვერდზე დაბრუნება {secondsLeft} წამში
        </Text>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: barWidth }]} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  glowOuter: {
    position: "absolute",
    width: 520,
    height: 520,
    borderRadius: 260,
    left: "50%",
    marginLeft: -260,
    top: 40,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    opacity: 0.55,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  hero: {
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  heroGlow: {
    position: "absolute",
    width: 248,
    height: 248,
    borderRadius: 124,
    backgroundColor: "rgba(34, 197, 94, 0.18)",
  },
  heroBlur: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(134, 239, 172, 0.45)",
  },
  dashRing: {
    position: "absolute",
    width: 156,
    height: 156,
    borderRadius: 78,
    borderWidth: 2,
    borderColor: "#F5C842",
    borderStyle: "dashed",
  },
  checkCircle: {
    width: 116,
    height: 116,
    borderRadius: 58,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#22C55E",
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 12,
    overflow: "hidden",
  },
  checkShine: {
    position: "absolute",
    top: 10,
    left: 22,
    width: 58,
    height: 35,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.28)",
  },
  floatEmoji: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1E4146",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  floatEmojiText: {
    fontSize: 22,
  },
  emojiTL: {
    left: -8,
    top: 8,
  },
  emojiTR: {
    right: -4,
    top: -4,
  },
  emojiMR: {
    right: -18,
    top: 86,
    width: 38,
    height: 38,
  },
  emojiBR: {
    right: 18,
    bottom: -4,
    width: 36,
    height: 36,
  },
  emojiBL: {
    left: -6,
    bottom: -2,
    width: 40,
    height: 40,
  },
  emojiML: {
    left: -28,
    top: 86,
    width: 34,
    height: 34,
  },
  title: {
    marginTop: 40,
    fontFamily: fontFamily.bold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.42,
    textAlign: "center",
    color: TITLE,
  },
  subtitle: {
    marginTop: 12,
    fontFamily: fontFamily.regular,
    fontSize: 16,
    lineHeight: 26,
    textAlign: "center",
    color: "rgba(30, 65, 70, 0.65)",
  },
  orderPill: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingLeft: 10,
    paddingRight: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    shadowColor: "#1E4146",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(30, 65, 70, 0.1)",
  },
  orderDotOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(245, 200, 66, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  orderDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D9A514",
  },
  orderPillLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 21,
    color: "rgba(30, 65, 70, 0.55)",
  },
  orderPillCode: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    lineHeight: 21,
    color: TITLE,
  },
  footer: {
    alignItems: "center",
    gap: 12,
    paddingTop: 24,
    paddingHorizontal: 32,
  },
  footerHint: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 21,
    color: "rgba(30, 65, 70, 0.45)",
  },
  progressTrack: {
    width: 56,
    height: 3,
    borderRadius: 999,
    backgroundColor: "rgba(30, 65, 70, 0.1)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#22C55E",
  },
});
