/**
 * Image Gallery Viewer Component
 * Fullscreen vertical swipe, double tap zoom, swipe down to dismiss
 */

import React, { useState, useRef } from "react";
import {
  View,
  Image,
  Pressable,
  Animated,
  PanResponder,
  Dimensions,
  Share,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ImageGalleryViewerProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
  onImageChange?: (index: number) => void;
}

export function ImageGalleryViewer({
  images,
  initialIndex = 0,
  onClose,
  onImageChange,
}: ImageGalleryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale] = useState(new Animated.Value(1));
  const [translateY] = useState(new Animated.Value(0));
  const [isLoading, setIsLoading] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        // Swipe down to dismiss
        if (gestureState.dy > 50) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 100) {
          // Dismiss on swipe down
          onClose();
        } else {
          // Snap back
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }

        // Horizontal swipe for image navigation
        if (Math.abs(gestureState.vx) > 0.5) {
          if (gestureState.vx > 0) {
            // Swipe right - previous image
            goToPreviousImage();
          } else {
            // Swipe left - next image
            goToNextImage();
          }
        }
      },
    })
  ).current;

  const goToNextImage = () => {
    if (currentIndex < images.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      onImageChange?.(newIndex);
      resetZoom();
    }
  };

  const goToPreviousImage = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      onImageChange?.(newIndex);
      resetZoom();
    }
  };

  const resetZoom = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: false }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: false }),
    ]).start();
  };

  const handleDoubleTap = () => {
    const currentScale = (scale as any)._value || 1;
    const newScale = currentScale > 1 ? 1 : 2;

    Animated.spring(scale, {
      toValue: newScale,
      useNativeDriver: false,
    }).start();
  };

  const shareImage = async () => {
    try {
      await Share.share({
        url: images[currentIndex],
        message: "Check out this image from မိဘမေတ္တာ အထည်ဆိုင်",
        title: "Share Image",
      });
    } catch (error) {
      console.error("Error sharing image:", error);
    }
  };

  const { height, width } = Dimensions.get("window");

  return (
    <Animated.View
      style={[
        {
          flex: 1,
          backgroundColor: "#000",
          justifyContent: "center",
          alignItems: "center",
          transform: [{ translateY }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      {/* Close Button */}
      <Pressable
        onPress={onClose}
        style={{
          position: "absolute",
          top: 40,
          left: 20,
          zIndex: 10,
          padding: 10,
        }}
      >
        <Ionicons name="chevron-back" size={32} color="#fff" />
      </Pressable>

      {/* Share Button */}
      <Pressable
        onPress={shareImage}
        style={{
          position: "absolute",
          top: 40,
          right: 20,
          zIndex: 10,
          padding: 10,
        }}
      >
        <Ionicons name="share-social" size={24} color="#fff" />
      </Pressable>

      {/* Image Display */}
      <Pressable onPress={handleDoubleTap} delayLongPress={500}>
        <Animated.Image
          source={{ uri: images[currentIndex] }}
          style={{
            width: width,
            height: height,
            resizeMode: "contain",
            transform: [{ scale }],
          }}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
        />
      </Pressable>

      {/* Loading Indicator */}
      {isLoading && (
        <ActivityIndicator
          size="large"
          color="#b5ac8a"
          style={{
            position: "absolute",
            alignSelf: "center",
          }}
        />
      )}

      {/* Image Counter */}
      <View
        style={{
          position: "absolute",
          bottom: 30,
          alignSelf: "center",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 20,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 14 }}>
          {currentIndex + 1} / {images.length}
        </Text>
      </View>

      {/* Navigation Hints */}
      {currentIndex < images.length - 1 && (
        <Pressable
          onPress={goToNextImage}
          style={{
            position: "absolute",
            right: 20,
            top: "50%",
            padding: 10,
          }}
        >
          <Ionicons name="chevron-forward" size={32} color="#b5ac8a" />
        </Pressable>
      )}

      {currentIndex > 0 && (
        <Pressable
          onPress={goToPreviousImage}
          style={{
            position: "absolute",
            left: 20,
            top: "50%",
            padding: 10,
          }}
        >
          <Ionicons name="chevron-back" size={32} color="#b5ac8a" />
        </Pressable>
      )}
    </Animated.View>
  );
}

import { Text } from "react-native";
