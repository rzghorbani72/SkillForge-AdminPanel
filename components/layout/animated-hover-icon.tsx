'use client';

import type { IconHandle } from '@animateicons/react';
import { useEffect, useRef, type ForwardRefExoticComponent, type RefAttributes } from 'react';

export type AnimateIconProps = {
  size?: number;
  duration?: number;
  isAnimated?: boolean;
  color?: string;
  className?: string;
};

export type AnimateNavIcon = ForwardRefExoticComponent<
  AnimateIconProps & RefAttributes<IconHandle>
>;

type AnimatedHoverIconProps = {
  icon: AnimateNavIcon;
  playing: boolean;
  className?: string;
  size?: number;
};

export function AnimatedHoverIcon({
  icon: Icon,
  playing,
  className,
  size = 18,
}: AnimatedHoverIconProps) {
  const ref = useRef<IconHandle>(null);

  useEffect(() => {
    const handle = ref.current;
    if (!handle) return;
    if (playing) {
      handle.startAnimation();
    } else {
      handle.stopAnimation();
    }
  }, [playing]);

  return <Icon ref={ref} size={size} duration={0.7} className={className} />;
}
