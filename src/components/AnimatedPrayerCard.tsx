import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Dimensions } from 'react-native';
import PrayerCard from './PrayerCard';
import { animations } from '@/theme';

const { height: screenHeight } = Dimensions.get('window');

interface AnimatedPrayerCardProps {
  isNew?: boolean;
  isNewlyAdded?: boolean;
  isPushedDown?: boolean;
  index: number;
  [key: string]: any;
}

const AnimatedPrayerCard: React.FC<AnimatedPrayerCardProps> = ({
  isNew = false,
  isNewlyAdded = false,
  isPushedDown = false,
  index,
  ...prayerCardProps
}) => {
  // Track if this specific card was ever marked as newly added to prevent re-animation
  const [wasNewlyAdded, setWasNewlyAdded] = useState(isNewlyAdded);
  const [hasAnimated, setHasAnimated] = useState(false);
  

  // Start from behind/underneath other cards with smaller scale (only for newly added prayers)
  const slideAnimation = useRef(new Animated.Value(
    (isNewlyAdded && !hasAnimated) ? -80 : 0
  )).current;
  const scaleAnimation = useRef(new Animated.Value(
    (isNewlyAdded && !hasAnimated) ? 0.4 : 1
  )).current;
  const opacityAnimation = useRef(new Animated.Value(
    (isNewlyAdded && !hasAnimated) ? 0.3 : 1
  )).current;
  const highlightAnimation = useRef(new Animated.Value(0)).current;
  
  // Add depth/z-index animation for layering effect
  const depthAnimation = useRef(new Animated.Value(
    (isNewlyAdded && !hasAnimated) ? -1 : 0  // Start behind other cards
  )).current;

  // Track when this component becomes newly added
  useEffect(() => {
    if (isNewlyAdded && !wasNewlyAdded) {
      setWasNewlyAdded(true);
    }
  }, [isNewlyAdded, wasNewlyAdded]);

  // Handle push-down animation when a card above becomes newly added
  useEffect(() => {
    if (isPushedDown && !isNewlyAdded) {
      
      // Animate this card being pushed down slightly
      Animated.sequence([
        // Push down
        Animated.spring(slideAnimation, {
          toValue: 20,
          useNativeDriver: true,
          tension: 150,
          friction: 8,
        }),
        // Return to original position
        Animated.spring(slideAnimation, {
          toValue: 0,
          useNativeDriver: true,
          tension: 120,
          friction: 8,
        }),
      ]).start();
    }
  }, [isPushedDown, isNewlyAdded, slideAnimation, prayerCardProps.id]);

  useEffect(() => {
    // Only animate if this is newly added AND we haven't animated yet
    if ((isNewlyAdded || wasNewlyAdded) && !hasAnimated) {
      setHasAnimated(true);
      
      // "Emerging from behind" animation - starts small and behind, grows as it slides up
      Animated.sequence([
        // Phase 1: Start emerging (small movement, scale up begins)
        Animated.parallel([
          Animated.timing(slideAnimation, {
            toValue: -40, // Move halfway to position
            duration: 200,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
          }),
          Animated.timing(scaleAnimation, {
            toValue: 0.7, // Grow from 0.4 to 0.7
            duration: 200,
            useNativeDriver: true,
            easing: Easing.out(Easing.quad),
          }),
          Animated.timing(opacityAnimation, {
            toValue: 0.7, // Become more visible
            duration: 200,
            useNativeDriver: true,
            easing: Easing.out(Easing.quad),
          }),
          Animated.timing(depthAnimation, {
            toValue: 0, // Come to surface level
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        // Phase 2: Complete emergence with spring physics
        Animated.parallel([
          Animated.spring(slideAnimation, {
            toValue: 0, // Final position
            useNativeDriver: true,
            tension: 120,
            friction: 8,
            velocity: 0,
          }),
          Animated.spring(scaleAnimation, {
            toValue: 1.02, // Slight overshoot
            useNativeDriver: true,
            tension: 150,
            friction: 7,
          }),
          Animated.timing(opacityAnimation, {
            toValue: 1, // Fully visible
            duration: 300,
            useNativeDriver: true,
            easing: Easing.out(Easing.quad),
          }),
        ]),
        // Phase 3: Settle to final state with highlight
        Animated.parallel([
          Animated.spring(scaleAnimation, {
            toValue: 1, // Final scale
            useNativeDriver: true,
            tension: 200,
            friction: 8,
          }),
          Animated.sequence([
            Animated.timing(highlightAnimation, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
              easing: Easing.out(Easing.cubic),
            }),
            Animated.timing(highlightAnimation, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
              easing: Easing.out(Easing.cubic),
            }),
          ]),
        ]),
      ]).start(() => {
      });
    }
  }, [isNewlyAdded, wasNewlyAdded, hasAnimated, slideAnimation, scaleAnimation, opacityAnimation, highlightAnimation, depthAnimation, prayerCardProps.id]);

  const highlightStyle = {
    backgroundColor: highlightAnimation.interpolate({
      inputRange: [0, 0.3, 0.7, 1],
      outputRange: ['rgba(0,0,0,0)', 'rgba(74,144,226,0.15)', 'rgba(74,144,226,0.08)', 'rgba(0,0,0,0)'],
    }),
    shadowOpacity: highlightAnimation.interpolate({
      inputRange: [0, 0.3, 0.7, 1],
      outputRange: [0, 0.4, 0.2, 0],
    }),
    shadowRadius: highlightAnimation.interpolate({
      inputRange: [0, 0.3, 0.7, 1],
      outputRange: [0, 15, 8, 0],
    }),
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: highlightAnimation.interpolate({
        inputRange: [0, 0.3, 1],
        outputRange: [0, 4, 0],
      }),
    },
    elevation: highlightAnimation.interpolate({
      inputRange: [0, 0.3, 0.7, 1],
      outputRange: [0, 12, 6, 0],
    }),
  };

  return (
    <Animated.View
      style={[
        {
          transform: [
            { translateY: slideAnimation },
            { scale: scaleAnimation },
          ],
          opacity: opacityAnimation,
          zIndex: depthAnimation.interpolate({
            inputRange: [-1, 0],
            outputRange: [-1, 0],
          }),
          elevation: depthAnimation.interpolate({
            inputRange: [-1, 0],
            outputRange: [0, 1],
          }),
        },
        (isNewlyAdded || wasNewlyAdded) && highlightStyle,
      ]}
    >
      <PrayerCard {...prayerCardProps} />
    </Animated.View>
  );
};

export default AnimatedPrayerCard;