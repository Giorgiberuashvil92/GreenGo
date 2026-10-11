import React from "react";
import { View, Animated, StyleSheet } from "react-native";

interface AnimatedTextProps {
  text: string;
  slideValue: Animated.Value;
  maxTranslateX: number;
}

export const AnimatedText = React.memo<AnimatedTextProps>(
  ({ text, slideValue, maxTranslateX }) => {
    const characters = text.split("");

    return (
      <View style={styles.container}>
        {characters.map((char, index) => {
          const startFade = Math.max(
            0,
            (maxTranslateX / characters.length) * index
          );
          const endFade = Math.min(
            maxTranslateX,
            (maxTranslateX / characters.length) * (index + 1)
          );

          const inputRange =
            startFade >= endFade
              ? [0, endFade, maxTranslateX]
              : [0, startFade, endFade, maxTranslateX];

          const outputRange = startFade >= endFade ? [1, 0, 0] : [1, 1, 0, 0];

          const charOpacity = slideValue.interpolate({
            inputRange,
            outputRange,
            extrapolate: "clamp",
          });

          return (
            <Animated.Text
              key={index}
              style={[styles.text, { opacity: charOpacity }]}
            >
              {char}
            </Animated.Text>
          );
        })}
      </View>
    );
  }
);

AnimatedText.displayName = "AnimatedText";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});

