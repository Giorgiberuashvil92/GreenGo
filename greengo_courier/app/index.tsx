/* eslint-disable react-hooks/exhaustive-deps */
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { useCourierAuth } from "../hooks/useCourierAuth";

SplashScreen.preventAutoHideAsync().catch(() => {});

const MIN_SPLASH_MS = 2200;

export default function Index() {
  const router = useRouter();
  const { courierId, isLoading } = useCourierAuth();
  const [imageReady, setImageReady] = useState(false);
  const navigatedRef = useRef(false);
  const mountedAtRef = useRef(Date.now());

  useEffect(() => {
    if (!imageReady) return;
    SplashScreen.hideAsync().catch(() => {});
  }, [imageReady]);

  useEffect(() => {
    if (isLoading || navigatedRef.current) return;

    let cancelled = false;

    const navigate = async () => {
      const elapsed = Date.now() - mountedAtRef.current;
      const wait = Math.max(0, MIN_SPLASH_MS - elapsed);
      if (wait > 0) {
        await new Promise((resolve) => setTimeout(resolve, wait));
      }
      if (cancelled || navigatedRef.current) return;

      navigatedRef.current = true;
      await SplashScreen.hideAsync().catch(() => {});

      if (courierId) {
        router.replace("/(app)/home");
      } else {
        router.replace("/(auth)/phone");
      }
    };

    navigate().catch((error) => {
      console.error("Error checking auth status:", error);
      if (!cancelled && !navigatedRef.current) {
        navigatedRef.current = true;
        router.replace("/(auth)/phone");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isLoading, courierId]);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/courier.png")}
        style={styles.splash}
        resizeMode="cover"
        onLoadEnd={() => setImageReady(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F5",
  },
  splash: {
    width: "100%",
    height: "100%",
  },
});
