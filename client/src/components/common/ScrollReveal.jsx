'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Variants cho Stagger Container (Thác đổ mượt mà như Apple / CellphoneS / Nike)
 */
export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  show: (custom = {}) => ({
    opacity: 1,
    transition: {
      staggerChildren: custom.stagger || 0.045,
      delayChildren: custom.delay || 0.02,
    },
  }),
};

/**
 * Variants cho từng Card Item bên trong Grid (Hiệu ứng Spring nảy nhẹ siêu cao cấp)
 */
export const staggerItemVariants = {
  hidden: { 
    opacity: 0, 
    y: 16, 
    scale: 0.98,
  },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 380,
      damping: 26,
      mass: 0.7,
    },
  },
};

/**
 * StaggerGrid — Container tự động kích hoạt thác đổ cho các Card con
 */
export function StaggerGrid({
  children,
  className = '',
  stagger = 0.045,
  delay = 0.02,
  once = true,
  ...props
}) {
  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: '50px 0px 0px 0px', amount: 'some' }}
      custom={{ stagger, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerItem — Thẻ con trong StaggerGrid (bọc ProductCard, Banner, Pill)
 */
export function StaggerItem({ children, className = '', ...props }) {
  return (
    <motion.div
      variants={staggerItemVariants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * ScrollReveal — Reveal Section cao cấp:
 * - immediate: Nếu true, hiển thị ngay lập tức (không ẩn khi vừa F5 trang đầu)
 * - variant="spring": Nảy nhẹ bằng Spring Physics chuẩn Apple
 * - variant="blurUp": Mờ dần kết hợp trượt nhẹ
 * - variant="cascade": Trượt dứt khoát 0.35s
 */
export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  variant = 'spring', // 'spring' | 'blurUp' | 'cascade'
  yOffset = 18,
  immediate = false,
  ...props
}) {
  const getVariants = () => {
    switch (variant) {
      case 'blurUp':
        return {
          hidden: { opacity: 0, y: yOffset, filter: 'blur(4px)' },
          show: {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: {
              duration: 0.38,
              delay,
              ease: [0.16, 1, 0.3, 1],
            },
          },
        };
      case 'cascade':
        return {
          hidden: { opacity: 0, y: yOffset },
          show: {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.32,
              delay,
              ease: [0.25, 1, 0.5, 1],
            },
          },
        };
      case 'spring':
      default:
        return {
          hidden: { opacity: 0, y: yOffset, scale: 0.99 },
          show: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
              type: 'spring',
              stiffness: 360,
              damping: 26,
              delay,
            },
          },
        };
    }
  };

  return (
    <motion.div
      variants={getVariants()}
      initial={immediate ? false : 'hidden'}
      whileInView="show"
      viewport={{ once: true, margin: '80px 0px 0px 0px', amount: 'some' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
