"use client";

import { useEffect, useState } from "react";

type ScrollDirection = "up" | "down" | null;

export function useScrollDirection(threshold = 10) {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null);
  const [prevScrollY, setPrevScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (Math.abs(currentScrollY - prevScrollY) < threshold) {
        return;
      }
      
      // Determine scroll direction
      const newScrollDirection = currentScrollY > prevScrollY ? "down" : "up";
      
      // Update visibility based on scroll direction
      if (newScrollDirection === "down" && currentScrollY > 50) {
        setIsVisible(false);
      } else if (newScrollDirection === "up") {
        setIsVisible(true);
      }
      
      setScrollDirection(newScrollDirection);
      setPrevScrollY(currentScrollY);
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Clean up
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [prevScrollY, threshold]);

  return { scrollDirection, isVisible };
}
