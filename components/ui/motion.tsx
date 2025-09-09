"use client"

import { motion } from "framer-motion"
import { Button, type ButtonProps } from "@/components/ui/button"
import React from "react"

// Animation variants
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4 },
  },
}

export const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
      mass: 0.5,
    },
  },
}

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export const cardHover = {
  rest: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 17,
    },
  },
}

export const buttonTap = {
  rest: { scale: 1 },
  tap: { scale: 0.95 },
}

// @ts-ignore - Suppressing TypeScript errors for motion components
export const MotionDiv = motion.div
// @ts-ignore
export const MotionLink = motion.a  
// @ts-ignore
export const MotionSection = motion.section
// @ts-ignore
export const MotionCard = motion.div
// @ts-ignore
export const MotionHeader = motion.header
// @ts-ignore
export const MotionFooter = motion.footer

// @ts-ignore
export const MotionButton = motion(Button)

