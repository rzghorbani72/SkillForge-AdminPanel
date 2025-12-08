'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Palette,
  Image,
  Save,
  Sparkles,
  Layers,
  Zap,
  Play
} from 'lucide-react';
import { ErrorHandler } from '@/lib/error-handler';
import { apiClient } from '@/lib/api';
import {
  applyThemeVariables,
  DEFAULT_THEME_CONFIG,
  dispatchThemeUpdate,
  parseThemeResponse
} from '@/lib/theme';
import { useTheme } from 'next-themes';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/lib/i18n/hooks';
import { useRef, useEffect as useReactEffect } from 'react';

type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeFormState {
  primaryLight: string;
  primaryDark: string;
  secondaryLight: string;
  secondaryDark: string;
  accent: string;
  backgroundLight: string;
  backgroundDark: string;
  darkMode: ThemeMode;
  logoUrl: string;
  backgroundAnimationType: string;
  backgroundAnimationSpeed: string;
  backgroundSvgPattern: string;
  elementAnimationStyle: string;
  borderRadiusStyle: string;
  shadowStyle: string;
}

const getThemeMode = (darkMode: boolean | null): ThemeMode => {
  if (darkMode === null) return 'system';
  return darkMode ? 'dark' : 'light';
};

const getDarkModeValue = (mode: ThemeMode): boolean | null => {
  if (mode === 'system') return null;
  return mode === 'dark';
};

const getEffectiveDarkMode = (mode: ThemeMode): boolean => {
  if (mode === 'system') {
    return (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  }
  return mode === 'dark';
};

// Live Preview Component with Animation
function LivePreview({
  theme,
  previewStyles,
  t
}: {
  theme: ThemeFormState;
  previewStyles: Record<string, string>;
  t: (key: string) => string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const timeRef = useRef(0);

  const isDark = getEffectiveDarkMode(theme.darkMode);
  const primaryColor = isDark ? theme.primaryDark : theme.primaryLight;
  const secondaryColor = isDark ? theme.secondaryDark : theme.secondaryLight;

  const speedMap: Record<string, number> = {
    slow: 0.3,
    medium: 0.6,
    fast: 1.2
  };

  const speed = speedMap[theme.backgroundAnimationSpeed] || 0.6;

  useReactEffect(() => {
    if (theme.backgroundAnimationType === 'none' || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = () => {
      timeRef.current += 0.01 * speed;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      switch (theme.backgroundAnimationType) {
        case 'gradient':
          drawGradient(
            ctx,
            canvas,
            timeRef.current,
            primaryColor,
            secondaryColor
          );
          break;
        case 'blobs':
          drawBlobs(ctx, canvas, timeRef.current, primaryColor, secondaryColor);
          break;
        case 'particles':
          drawParticles(
            ctx,
            canvas,
            timeRef.current,
            primaryColor,
            secondaryColor
          );
          break;
        case 'waves':
          drawWaves(ctx, canvas, timeRef.current, primaryColor, secondaryColor);
          break;
        case 'mesh':
          drawMesh(ctx, canvas, timeRef.current, primaryColor, secondaryColor);
          break;
        case 'grid':
          drawGrid(ctx, canvas, timeRef.current, primaryColor, secondaryColor);
          break;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    theme.backgroundAnimationType,
    theme.backgroundAnimationSpeed,
    primaryColor,
    secondaryColor
  ]);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        }
      : { r: 59, g: 130, b: 246 };
  };

  const drawGradient = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    time: number,
    primary: string,
    secondary: string
  ) => {
    const primaryRgb = hexToRgb(primary);
    const secondaryRgb = hexToRgb(secondary);

    const angle = time * 0.5;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.max(canvas.width, canvas.height) * 0.8;

    const x1 = centerX + Math.cos(angle) * radius;
    const y1 = centerY + Math.sin(angle) * radius;
    const x2 = centerX + Math.cos(angle + Math.PI) * radius;
    const y2 = centerY + Math.sin(angle + Math.PI) * radius;

    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(
      0,
      `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.4)`
    );
    gradient.addColorStop(
      0.3,
      `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.3)`
    );
    gradient.addColorStop(
      0.6,
      `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.25)`
    );
    gradient.addColorStop(
      1,
      `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.35)`
    );

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const radialGradient = ctx.createRadialGradient(
      centerX + Math.cos(time) * canvas.width * 0.2,
      centerY + Math.sin(time * 0.7) * canvas.height * 0.2,
      0,
      centerX,
      centerY,
      Math.max(canvas.width, canvas.height) * 0.6
    );
    radialGradient.addColorStop(
      0,
      `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.2)`
    );
    radialGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = radialGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const drawBlobs = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    time: number,
    primary: string,
    secondary: string
  ) => {
    const primaryRgb = hexToRgb(primary);
    const secondaryRgb = hexToRgb(secondary);

    const blobCount = 4;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    for (let i = 0; i < blobCount; i++) {
      const angle = time * 0.3 + (i / blobCount) * Math.PI * 2;
      const distance = Math.max(canvas.width, canvas.height) * 0.25;

      const baseX = centerX + Math.cos(angle) * distance;
      const baseY = centerY + Math.sin(angle * 0.8) * distance;

      const pulse = Math.sin(time * 2 + i) * 0.3 + 0.7;
      const radius = (60 + Math.sin(time * 1.5 + i * 2) * 25) * pulse;

      const morphX = baseX + Math.sin(time * 0.8 + i) * 30;
      const morphY = baseY + Math.cos(time * 0.6 + i) * 30;

      const gradient = ctx.createRadialGradient(
        morphX,
        morphY,
        0,
        morphX,
        morphY,
        radius
      );

      const color = i % 2 === 0 ? primaryRgb : secondaryRgb;
      const alpha = 0.5 * pulse;

      gradient.addColorStop(
        0,
        `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`
      );
      gradient.addColorStop(
        0.5,
        `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.6})`
      );
      gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(morphX, morphY, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 20;
      ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0.3)`;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    for (let i = 0; i < 2; i++) {
      const smallAngle = time * 0.5 + i * Math.PI;
      const smallX = centerX + Math.cos(smallAngle) * (canvas.width * 0.15);
      const smallY =
        centerY + Math.sin(smallAngle * 1.2) * (canvas.height * 0.15);
      const smallRadius = 25 + Math.sin(time * 2 + i) * 10;

      const smallGradient = ctx.createRadialGradient(
        smallX,
        smallY,
        0,
        smallX,
        smallY,
        smallRadius
      );

      const smallColor = i === 0 ? primaryRgb : secondaryRgb;
      smallGradient.addColorStop(
        0,
        `rgba(${smallColor.r}, ${smallColor.g}, ${smallColor.b}, 0.4)`
      );
      smallGradient.addColorStop(
        1,
        `rgba(${smallColor.r}, ${smallColor.g}, ${smallColor.b}, 0)`
      );

      ctx.fillStyle = smallGradient;
      ctx.beginPath();
      ctx.arc(smallX, smallY, smallRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawParticles = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    time: number,
    primary: string,
    secondary: string
  ) => {
    const primaryRgb = hexToRgb(primary);
    const secondaryRgb = hexToRgb(secondary);

    const particleCount = 35;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: typeof primaryRgb;
      trail: Array<{ x: number; y: number }>;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = Math.min(canvas.width, canvas.height) * 0.4;
      const baseX = canvas.width / 2 + Math.cos(angle) * radius;
      const baseY = canvas.height / 2 + Math.sin(angle) * radius;

      particles.push({
        x: baseX + Math.sin(time + i) * 20,
        y: baseY + Math.cos(time * 0.7 + i) * 20,
        vx: Math.cos(angle + time) * 0.5,
        vy: Math.sin(angle + time) * 0.5,
        size: 2.5 + Math.sin(time + i) * 1.5,
        color: i % 2 === 0 ? primaryRgb : secondaryRgb,
        trail: []
      });
    }

    particles.forEach((particle, i) => {
      particle.trail.push({ x: particle.x, y: particle.y });
      if (particle.trail.length > 8) {
        particle.trail.shift();
      }

      particle.trail.forEach((point, trailIndex) => {
        const alpha = (trailIndex / particle.trail.length) * 0.4;
        ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(point.x, point.y, particle.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, 0.8)`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();

      const nextParticle = particles[(i + 1) % particles.length];
      const distance = Math.sqrt(
        Math.pow(particle.x - nextParticle.x, 2) +
          Math.pow(particle.y - nextParticle.y, 2)
      );

      if (distance < 120) {
        ctx.strokeStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${0.2 * (1 - distance / 120)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(nextParticle.x, nextParticle.y);
        ctx.stroke();
      }
    });
  };

  const drawWaves = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    time: number,
    primary: string,
    secondary: string
  ) => {
    const primaryRgb = hexToRgb(primary);
    const secondaryRgb = hexToRgb(secondary);

    const waveCount = 4;

    for (let i = 0; i < waveCount; i++) {
      const waveTime = time + i * 0.5;
      const amplitude = 25 + Math.sin(waveTime) * 10;
      const frequency = 3 + i * 0.5;
      const speed = 0.5 + i * 0.2;

      const color = i % 2 === 0 ? primaryRgb : secondaryRgb;
      const alpha = 0.4 - i * 0.08;

      ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
      ctx.lineWidth = 2.5 - i * 0.3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      for (let x = 0; x < canvas.width; x += 2) {
        const y =
          canvas.height / 2 +
          Math.sin(
            (x / canvas.width) * Math.PI * frequency + waveTime * speed
          ) *
            amplitude +
          Math.cos(
            (x / canvas.width) * Math.PI * (frequency * 0.7) +
              waveTime * speed * 0.8
          ) *
            (amplitude * 0.3);

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    for (let i = 0; i < 2; i++) {
      const verticalTime = time * 0.7 + i * Math.PI;
      const verticalAmplitude = 15;

      ctx.strokeStyle = `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.2)`;
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      for (let y = 0; y < canvas.height; y += 2) {
        const x =
          canvas.width / 2 +
          Math.sin((y / canvas.height) * Math.PI * 2 + verticalTime) *
            verticalAmplitude;

        if (y === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }
  };

  const drawMesh = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    time: number,
    primary: string,
    secondary: string
  ) => {
    const primaryRgb = hexToRgb(primary);
    const secondaryRgb = hexToRgb(secondary);

    const gridSize = 35;
    const points: Array<Array<{ x: number; y: number }>> = [];

    for (let x = 0; x <= canvas.width; x += gridSize) {
      const column: Array<{ x: number; y: number }> = [];
      for (let y = 0; y <= canvas.height; y += gridSize) {
        const noiseX = Math.sin(time + x * 0.02 + y * 0.01) * 8;
        const noiseY = Math.cos(time * 0.8 + y * 0.02 + x * 0.01) * 8;
        column.push({
          x: x + noiseX,
          y: y + noiseY
        });
      }
      points.push(column);
    }

    ctx.strokeStyle = `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.25)`;
    ctx.lineWidth = 1;

    for (let i = 0; i < points.length - 1; i++) {
      for (let j = 0; j < points[i].length - 1; j++) {
        const p1 = points[i][j];
        const p2 = points[i + 1][j];
        const p3 = points[i + 1][j + 1];
        const p4 = points[i][j + 1];

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.closePath();
        ctx.stroke();

        const centerX = (p1.x + p2.x + p3.x + p4.x) / 4;
        const centerY = (p1.y + p2.y + p3.y + p4.y) / 4;
        const distance = Math.sqrt(
          Math.pow(centerX - canvas.width / 2, 2) +
            Math.pow(centerY - canvas.height / 2, 2)
        );
        const maxDistance = Math.sqrt(
          Math.pow(canvas.width / 2, 2) + Math.pow(canvas.height / 2, 2)
        );
        const intensity = 1 - distance / maxDistance;

        if (intensity > 0.3) {
          const gradient = ctx.createRadialGradient(
            centerX,
            centerY,
            0,
            centerX,
            centerY,
            gridSize * 0.6
          );
          const color = (i + j) % 2 === 0 ? primaryRgb : secondaryRgb;
          gradient.addColorStop(
            0,
            `rgba(${color.r}, ${color.g}, ${color.b}, ${0.15 * intensity})`
          );
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.fillStyle = gradient;
          ctx.fill();
        }
      }
    }
  };

  const drawGrid = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    time: number,
    primary: string,
    secondary: string
  ) => {
    const primaryRgb = hexToRgb(primary);
    const secondaryRgb = hexToRgb(secondary);

    const gridSize = 45;
    const offset = (time * 15) % gridSize;
    const pulse = Math.sin(time * 2) * 0.3 + 0.7;

    ctx.strokeStyle = `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, ${0.2 * pulse})`;
    ctx.lineWidth = 1;

    for (let x = -offset; x < canvas.width + gridSize; x += gridSize) {
      const waveOffset = Math.sin((x / canvas.width) * Math.PI * 2 + time) * 3;
      ctx.beginPath();
      ctx.moveTo(x + waveOffset, 0);
      ctx.lineTo(x + waveOffset, canvas.height);
      ctx.stroke();
    }

    for (let y = -offset; y < canvas.height + gridSize; y += gridSize) {
      const waveOffset = Math.cos((y / canvas.height) * Math.PI * 2 + time) * 3;
      ctx.beginPath();
      ctx.moveTo(0, y + waveOffset);
      ctx.lineTo(canvas.width, y + waveOffset);
      ctx.stroke();
    }

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const centerRadius = Math.min(canvas.width, canvas.height) * 0.3;

    const radialGradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      centerRadius
    );
    radialGradient.addColorStop(
      0,
      `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.15)`
    );
    radialGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = radialGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 3; i++) {
      const dotX = (canvas.width / 4) * (i + 1);
      const dotY = canvas.height / 2 + Math.sin(time + i) * 20;
      const dotSize = 3 + Math.sin(time * 2 + i) * 2;

      const dotGradient = ctx.createRadialGradient(
        dotX,
        dotY,
        0,
        dotX,
        dotY,
        dotSize * 2
      );
      dotGradient.addColorStop(
        0,
        `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.6)`
      );
      dotGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = dotGradient;
      ctx.beginPath();
      ctx.arc(dotX, dotY, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  return (
    <div className="space-y-4">
      <div
        className="relative overflow-hidden rounded-lg border p-6 text-sm"
        style={{
          backgroundColor: previewStyles[
            '--preview-background' as keyof typeof previewStyles
          ] as string,
          color: previewStyles[
            '--preview-text' as keyof typeof previewStyles
          ] as string,
          borderColor: previewStyles[
            '--preview-primary' as keyof typeof previewStyles
          ] as string,
          borderRadius:
            theme.borderRadiusStyle === 'rounded'
              ? '16px'
              : theme.borderRadiusStyle === 'soft'
                ? '24px'
                : '4px',
          boxShadow:
            theme.shadowStyle === 'none'
              ? 'none'
              : theme.shadowStyle === 'subtle'
                ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                : theme.shadowStyle === 'strong'
                  ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                  : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}
      >
        {theme.backgroundAnimationType !== 'none' && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full"
            style={{ opacity: 0.6 }}
          />
        )}
        <div className="relative z-10 space-y-3">
          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              backgroundColor: previewStyles[
                '--preview-secondary' as keyof typeof previewStyles
              ] as string,
              color: '#fff'
            }}
          >
            {t('settings.previewBadge')}
          </span>
          <h3 className="text-lg font-semibold">
            {t('settings.welcomeToYourStore')}
          </h3>
          <p className="text-sm opacity-80">
            {t('settings.previewDescription')}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              style={{
                backgroundColor: previewStyles[
                  '--preview-primary' as keyof typeof previewStyles
                ] as string,
                color: '#fff'
              }}
            >
              {t('settings.primaryAction')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              style={{
                borderColor: previewStyles[
                  '--preview-primary' as keyof typeof previewStyles
                ] as string,
                color: previewStyles[
                  '--preview-primary' as keyof typeof previewStyles
                ] as string
              }}
            >
              {t('common.secondary') || 'Secondary'}
            </Button>
          </div>
        </div>
      </div>
      {theme.backgroundAnimationType !== 'none' && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Play className="h-3 w-3" />
          <span>
            {t('settings.animationActive') || 'Animation active'} -{' '}
            {theme.backgroundAnimationSpeed}
          </span>
        </div>
      )}
    </div>
  );
}

// Mini Animation Preview for Selection Cards
function AnimationPreviewMini({
  type,
  primaryColor,
  secondaryColor
}: {
  type: 'gradient' | 'blobs' | 'particles' | 'waves' | 'mesh' | 'grid';
  primaryColor: string;
  secondaryColor: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const timeRef = useRef(0);

  useReactEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resizeCanvas();

    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
          }
        : { r: 59, g: 130, b: 246 };
    };

    const animate = () => {
      timeRef.current += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const primaryRgb = hexToRgb(primaryColor);
      const secondaryRgb = hexToRgb(secondaryColor);

      switch (type) {
        case 'gradient': {
          const angle = timeRef.current * 0.5;
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const radius = Math.max(canvas.width, canvas.height) * 0.8;

          const x1 = centerX + Math.cos(angle) * radius;
          const y1 = centerY + Math.sin(angle) * radius;
          const x2 = centerX + Math.cos(angle + Math.PI) * radius;
          const y2 = centerY + Math.sin(angle + Math.PI) * radius;

          const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
          gradient.addColorStop(
            0,
            `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.5)`
          );
          gradient.addColorStop(
            0.5,
            `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.4)`
          );
          gradient.addColorStop(
            1,
            `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.3)`
          );
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          break;
        }
        case 'blobs': {
          const blobCount = 3;
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;

          for (let i = 0; i < blobCount; i++) {
            const angle = timeRef.current * 0.3 + (i / blobCount) * Math.PI * 2;
            const distance = Math.max(canvas.width, canvas.height) * 0.25;

            const baseX = centerX + Math.cos(angle) * distance;
            const baseY = centerY + Math.sin(angle * 0.8) * distance;

            const pulse = Math.sin(timeRef.current * 2 + i) * 0.3 + 0.7;
            const radius =
              (15 + Math.sin(timeRef.current * 1.5 + i * 2) * 8) * pulse;

            const morphX = baseX + Math.sin(timeRef.current * 0.8 + i) * 10;
            const morphY = baseY + Math.cos(timeRef.current * 0.6 + i) * 10;

            const color = i % 2 === 0 ? primaryRgb : secondaryRgb;
            const gradient = ctx.createRadialGradient(
              morphX,
              morphY,
              0,
              morphX,
              morphY,
              radius
            );
            gradient.addColorStop(
              0,
              `rgba(${color.r}, ${color.g}, ${color.b}, ${0.6 * pulse})`
            );
            gradient.addColorStop(
              1,
              `rgba(${color.r}, ${color.g}, ${color.b}, 0)`
            );

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(morphX, morphY, radius, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case 'particles': {
          const particleCount = 12;

          for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = Math.min(canvas.width, canvas.height) * 0.35;
            const baseX = canvas.width / 2 + Math.cos(angle) * radius;
            const baseY = canvas.height / 2 + Math.sin(angle) * radius;

            const x = baseX + Math.sin(timeRef.current + i) * 8;
            const y = baseY + Math.cos(timeRef.current * 0.7 + i) * 8;
            const size = 2 + Math.sin(timeRef.current + i) * 1;
            const color = i % 2 === 0 ? primaryRgb : secondaryRgb;

            ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.8)`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();

            const nextI = (i + 1) % particleCount;
            const nextAngle = (nextI / particleCount) * Math.PI * 2;
            const nextX =
              canvas.width / 2 +
              Math.cos(nextAngle) * radius +
              Math.sin(timeRef.current + nextI) * 8;
            const nextY =
              canvas.height / 2 +
              Math.sin(nextAngle) * radius +
              Math.cos(timeRef.current * 0.7 + nextI) * 8;

            const distance = Math.sqrt(
              Math.pow(x - nextX, 2) + Math.pow(y - nextY, 2)
            );
            if (distance < 40) {
              ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${0.3 * (1 - distance / 40)})`;
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(nextX, nextY);
              ctx.stroke();
            }
          }
          break;
        }
        case 'waves': {
          for (let i = 0; i < 2; i++) {
            const waveTime = timeRef.current + i * 0.5;
            const amplitude = 8 + Math.sin(waveTime) * 3;
            const frequency = 2.5 + i * 0.3;

            const color = i % 2 === 0 ? primaryRgb : secondaryRgb;
            ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${0.5 - i * 0.15})`;
            ctx.lineWidth = 1.5 - i * 0.3;
            ctx.lineCap = 'round';

            ctx.beginPath();
            for (let x = 0; x < canvas.width; x += 2) {
              const y =
                canvas.height / 2 +
                Math.sin((x / canvas.width) * Math.PI * frequency + waveTime) *
                  amplitude;

              if (x === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
            }
            ctx.stroke();
          }
          break;
        }
        case 'mesh': {
          const gridSize = 12;
          ctx.strokeStyle = `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.3)`;
          ctx.lineWidth = 0.5;

          for (let x = 0; x < canvas.width; x += gridSize) {
            for (let y = 0; y < canvas.height; y += gridSize) {
              const noiseX =
                Math.sin(timeRef.current + x * 0.05 + y * 0.02) * 3;
              const noiseY =
                Math.cos(timeRef.current * 0.8 + y * 0.05 + x * 0.02) * 3;

              ctx.beginPath();
              ctx.moveTo(x + noiseX, y + noiseY);
              ctx.lineTo(x + gridSize + noiseX, y + noiseY);
              ctx.lineTo(x + gridSize + noiseX, y + gridSize + noiseY);
              ctx.stroke();
            }
          }
          break;
        }
        case 'grid': {
          const gridSize = 18;
          const offset = (timeRef.current * 8) % gridSize;
          const pulse = Math.sin(timeRef.current * 2) * 0.3 + 0.7;

          ctx.strokeStyle = `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, ${0.25 * pulse})`;
          ctx.lineWidth = 0.5;

          for (let x = -offset; x < canvas.width + gridSize; x += gridSize) {
            const waveOffset =
              Math.sin((x / canvas.width) * Math.PI * 2 + timeRef.current) * 2;
            ctx.beginPath();
            ctx.moveTo(x + waveOffset, 0);
            ctx.lineTo(x + waveOffset, canvas.height);
            ctx.stroke();
          }

          for (let y = -offset; y < canvas.height + gridSize; y += gridSize) {
            const waveOffset =
              Math.cos((y / canvas.height) * Math.PI * 2 + timeRef.current) * 2;
            ctx.beginPath();
            ctx.moveTo(0, y + waveOffset);
            ctx.lineTo(canvas.width, y + waveOffset);
            ctx.stroke();
          }
          break;
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [type, primaryColor, secondaryColor]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ opacity: 0.7 }}
    />
  );
}

const DEFAULT_THEME: ThemeFormState = {
  primaryLight:
    DEFAULT_THEME_CONFIG.primary_color_light ??
    DEFAULT_THEME_CONFIG.primary_color,
  primaryDark: DEFAULT_THEME_CONFIG.primary_color_dark ?? '#60a5fa',
  secondaryLight:
    DEFAULT_THEME_CONFIG.secondary_color_light ??
    DEFAULT_THEME_CONFIG.secondary_color,
  secondaryDark: DEFAULT_THEME_CONFIG.secondary_color_dark ?? '#818cf8',
  accent: DEFAULT_THEME_CONFIG.accent_color,
  backgroundLight:
    DEFAULT_THEME_CONFIG.background_color_light ??
    DEFAULT_THEME_CONFIG.background_color,
  backgroundDark: DEFAULT_THEME_CONFIG.background_color_dark ?? '#0f172a',
  darkMode: getThemeMode(DEFAULT_THEME_CONFIG.dark_mode),
  logoUrl: 'https://cdn.yourstore.com/logo.png',
  backgroundAnimationType: 'none',
  backgroundAnimationSpeed: 'medium',
  backgroundSvgPattern: '',
  elementAnimationStyle: 'subtle',
  borderRadiusStyle: 'rounded',
  shadowStyle: 'medium'
};

export default function ThemeSettingsPage() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const themeContext = useTheme();
  const setNextTheme = themeContext?.setTheme;
  const [theme, setTheme] = useState<ThemeFormState>(DEFAULT_THEME);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [themeId, setThemeId] = useState<number | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
  }, []);

  const applyLivePreview = (nextState: ThemeFormState) => {
    const payload = buildConfigPayload(nextState);
    applyThemeVariables(payload);
    // Note: We don't change AdminPanel's theme here - these settings are only for edusphere
    // The preview shows how edusphere will look, but AdminPanel keeps its own theme
    dispatchThemeUpdate(payload);
  };

  const buildConfigPayload = (state: ThemeFormState) => ({
    themeId,
    name: 'Custom Theme',
    primary_color: state.primaryLight,
    primary_color_light: state.primaryLight,
    primary_color_dark: state.primaryDark,
    secondary_color: state.secondaryLight,
    secondary_color_light: state.secondaryLight,
    secondary_color_dark: state.secondaryDark,
    accent_color: state.accent,
    background_color: state.backgroundLight,
    background_color_light: state.backgroundLight,
    background_color_dark: state.backgroundDark,
    dark_mode: getDarkModeValue(state.darkMode),
    background_animation_type: state.backgroundAnimationType,
    background_animation_speed: state.backgroundAnimationSpeed,
    background_svg_pattern: state.backgroundSvgPattern,
    element_animation_style: state.elementAnimationStyle,
    border_radius_style: state.borderRadiusStyle,
    shadow_style: state.shadowStyle
  });

  const getEffectiveDarkMode = (mode: ThemeMode): boolean => {
    if (mode === 'system') {
      return (
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      );
    }
    return mode === 'dark';
  };

  const previewStyles = useMemo(() => {
    const isDark = getEffectiveDarkMode(theme.darkMode);
    return {
      '--preview-primary': isDark ? theme.primaryDark : theme.primaryLight,
      '--preview-secondary': isDark
        ? theme.secondaryDark
        : theme.secondaryLight,
      '--preview-accent': theme.accent,
      '--preview-background': isDark
        ? theme.backgroundDark
        : theme.backgroundLight,
      '--preview-surface': isDark
        ? theme.backgroundDark
        : theme.backgroundLight,
      '--preview-text': isDark ? '#f8fafc' : '#0f172a'
    };
  }, [theme]);

  useEffect(() => {
    let mounted = true;

    const loadTheme = async () => {
      try {
        const response = await apiClient.getCurrentThemeConfig();
        if (!mounted) return;
        const config = parseThemeResponse(response);
        const responseData = response as any;
        const configs = (responseData?.data?.configs ||
          responseData?.data ||
          {}) as any;
        setTheme({
          primaryLight: config.primary_color_light ?? config.primary_color,
          primaryDark: config.primary_color_dark ?? config.primary_color,
          secondaryLight:
            config.secondary_color_light ?? config.secondary_color,
          secondaryDark: config.secondary_color_dark ?? config.secondary_color,
          accent: config.accent_color,
          backgroundLight:
            config.background_color_light ?? config.background_color,
          backgroundDark:
            config.background_color_dark ?? config.background_color,
          darkMode: getThemeMode(config.dark_mode),
          logoUrl:
            configs.logo_url ||
            configs.logoUrl ||
            'https://cdn.yourstore.com/logo.png',
          backgroundAnimationType: configs.background_animation_type || 'none',
          backgroundAnimationSpeed:
            configs.background_animation_speed || 'medium',
          backgroundSvgPattern: configs.background_svg_pattern || '',
          elementAnimationStyle: configs.element_animation_style || 'subtle',
          borderRadiusStyle: configs.border_radius_style || 'rounded',
          shadowStyle: configs.shadow_style || 'medium'
        });
        setThemeId(config.themeId);
        applyThemeVariables(config);
        // Note: We don't change AdminPanel's theme here - these settings are only for edusphere
      } catch (error) {
        console.error('Failed to load theme configuration', error);
        if (!mounted) return;
        setTheme(DEFAULT_THEME);
        applyThemeVariables(DEFAULT_THEME_CONFIG);
        // Note: We don't change AdminPanel's theme here - these settings are only for edusphere
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadTheme();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await apiClient.updateCurrentThemeConfig(
        buildConfigPayload(theme)
      );

      const updatedConfig = parseThemeResponse(response);
      const responseData = response as any;
      const configs = (responseData?.data?.configs ||
        responseData?.data ||
        {}) as any;
      setTheme({
        primaryLight:
          updatedConfig.primary_color_light ?? updatedConfig.primary_color,
        primaryDark:
          updatedConfig.primary_color_dark ?? updatedConfig.primary_color,
        secondaryLight:
          updatedConfig.secondary_color_light ?? updatedConfig.secondary_color,
        secondaryDark:
          updatedConfig.secondary_color_dark ?? updatedConfig.secondary_color,
        accent: updatedConfig.accent_color,
        backgroundLight:
          updatedConfig.background_color_light ??
          updatedConfig.background_color,
        backgroundDark:
          updatedConfig.background_color_dark ?? updatedConfig.background_color,
        darkMode: getThemeMode(updatedConfig.dark_mode),
        logoUrl: theme.logoUrl,
        backgroundAnimationType:
          configs.background_animation_type || theme.backgroundAnimationType,
        backgroundAnimationSpeed:
          configs.background_animation_speed || theme.backgroundAnimationSpeed,
        backgroundSvgPattern:
          configs.background_svg_pattern || theme.backgroundSvgPattern,
        elementAnimationStyle:
          configs.element_animation_style || theme.elementAnimationStyle,
        borderRadiusStyle:
          configs.border_radius_style || theme.borderRadiusStyle,
        shadowStyle: configs.shadow_style || theme.shadowStyle
      });
      setThemeId(updatedConfig.themeId);

      applyThemeVariables(updatedConfig);
      // Note: We don't change AdminPanel's theme here - these settings are only for edusphere
      dispatchThemeUpdate(updatedConfig);

      ErrorHandler.showSuccess(t('settings.themePreferencesSaved'));
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted || isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-[420px]" />
        <Skeleton className="h-[220px]" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('settings.themeBrandingTitle')}
        </h1>
        <p className="text-muted-foreground">
          {t('settings.themeBrandingSubtitle')}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.colours')}</CardTitle>
            <CardDescription>
              {t('settings.coloursDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-6">
              {[
                {
                  key: 'primary',
                  label: t('settings.primaryColour'),
                  helper: t('settings.primaryColourHelper'),
                  lightKey: 'primaryLight' as const,
                  darkKey: 'primaryDark' as const
                },
                {
                  key: 'secondary',
                  label: t('settings.secondaryColour'),
                  helper: t('settings.secondaryColourHelper'),
                  lightKey: 'secondaryLight' as const,
                  darkKey: 'secondaryDark' as const
                },
                {
                  key: 'background',
                  label: t('settings.backgroundColour'),
                  helper: t('settings.backgroundColourHelper'),
                  lightKey: 'backgroundLight' as const,
                  darkKey: 'backgroundDark' as const
                }
              ].map(({ key, label, helper, lightKey, darkKey }) => (
                <div key={key} className="space-y-3">
                  <Label>{label}</Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor={`${key}-light`}
                        className="text-xs text-muted-foreground"
                      >
                        {t('settings.lightTheme')}
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id={`${key}-light`}
                          type="color"
                          value={theme[lightKey]}
                          onChange={(event) =>
                            setTheme((prev) => {
                              const nextState = {
                                ...prev,
                                [lightKey]: event.target.value
                              } as ThemeFormState;
                              applyLivePreview(nextState);
                              return nextState;
                            })
                          }
                          className="h-10 w-16"
                        />
                        <Input
                          value={theme[lightKey]}
                          onChange={(event) =>
                            setTheme((prev) => {
                              const nextState = {
                                ...prev,
                                [lightKey]: event.target.value
                              } as ThemeFormState;
                              applyLivePreview(nextState);
                              return nextState;
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor={`${key}-dark`}
                        className="text-xs text-muted-foreground"
                      >
                        {t('settings.darkTheme')}
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id={`${key}-dark`}
                          type="color"
                          value={theme[darkKey]}
                          onChange={(event) =>
                            setTheme((prev) => {
                              const nextState = {
                                ...prev,
                                [darkKey]: event.target.value
                              } as ThemeFormState;
                              applyLivePreview(nextState);
                              return nextState;
                            })
                          }
                          className="h-10 w-16"
                        />
                        <Input
                          value={theme[darkKey]}
                          onChange={(event) =>
                            setTheme((prev) => {
                              const nextState = {
                                ...prev,
                                [darkKey]: event.target.value
                              } as ThemeFormState;
                              applyLivePreview(nextState);
                              return nextState;
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{helper}</p>
                </div>
              ))}

              <div className="space-y-2">
                <Label htmlFor="accent-color">
                  {t('settings.accentColour')}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="accent-color"
                    type="color"
                    value={theme.accent}
                    onChange={(event) =>
                      setTheme((prev) => {
                        const nextState = {
                          ...prev,
                          accent: event.target.value
                        } as ThemeFormState;
                        applyLivePreview(nextState);
                        return nextState;
                      })
                    }
                    className="h-10 w-16"
                  />
                  <Input
                    value={theme.accent}
                    onChange={(event) =>
                      setTheme((prev) => {
                        const nextState = {
                          ...prev,
                          accent: event.target.value
                        } as ThemeFormState;
                        applyLivePreview(nextState);
                        return nextState;
                      })
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('settings.accentColourHelper')}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('settings.themeMode')}</Label>
              <Select
                value={theme.darkMode}
                onValueChange={(value: ThemeMode) =>
                  setTheme((prev) => {
                    const nextState = {
                      ...prev,
                      darkMode: value
                    } as ThemeFormState;
                    applyLivePreview(nextState);
                    return nextState;
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">{t('settings.light')}</SelectItem>
                  <SelectItem value="dark">{t('settings.dark')}</SelectItem>
                  <SelectItem value="system">{t('settings.system')}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {theme.darkMode === 'system'
                  ? t('settings.systemModeDescription')
                  : theme.darkMode === 'dark'
                    ? t('settings.darkModeDescription')
                    : t('settings.lightModeDescription')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <Palette className="h-4 w-4" /> {t('settings.livePreview')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LivePreview theme={theme} previewStyles={previewStyles} t={t} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            {t('settings.advancedCustomization')}
          </CardTitle>
          <CardDescription>
            {t('settings.advancedCustomizationDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="backgroundAnimationType">
                {t('settings.backgroundAnimation')}
              </Label>
              <Select
                value={theme.backgroundAnimationType}
                onValueChange={(value) =>
                  setTheme((prev) => {
                    const nextState = {
                      ...prev,
                      backgroundAnimationType: value
                    } as ThemeFormState;
                    applyLivePreview(nextState);
                    return nextState;
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('common.none')}</SelectItem>
                  <SelectItem value="gradient">
                    {t('settings.backgroundAnimationGradient')}
                  </SelectItem>
                  <SelectItem value="blobs">
                    {t('settings.backgroundAnimationBlobs')}
                  </SelectItem>
                  <SelectItem value="particles">
                    {t('settings.backgroundAnimationParticles')}
                  </SelectItem>
                  <SelectItem value="waves">
                    {t('settings.backgroundAnimationWaves')}
                  </SelectItem>
                  <SelectItem value="mesh">
                    {t('settings.backgroundAnimationMesh')}
                  </SelectItem>
                  <SelectItem value="grid">
                    {t('settings.backgroundAnimationGrid')}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t('settings.backgroundAnimationHelp')}
              </p>
            </div>

            {/* Animation Preview Cards */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { value: 'none', label: t('common.none') },
                {
                  value: 'gradient',
                  label: t('settings.backgroundAnimationGradient')
                },
                {
                  value: 'blobs',
                  label: t('settings.backgroundAnimationBlobs')
                },
                {
                  value: 'particles',
                  label: t('settings.backgroundAnimationParticles')
                },
                {
                  value: 'waves',
                  label: t('settings.backgroundAnimationWaves')
                },
                {
                  value: 'mesh',
                  label: t('settings.backgroundAnimationMesh')
                },
                {
                  value: 'grid',
                  label: t('settings.backgroundAnimationGrid')
                }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setTheme((prev) => {
                      const nextState = {
                        ...prev,
                        backgroundAnimationType: option.value
                      } as ThemeFormState;
                      applyLivePreview(nextState);
                      return nextState;
                    })
                  }
                  className={`group relative h-20 overflow-hidden rounded-lg border-2 transition-all ${
                    theme.backgroundAnimationType === option.value
                      ? 'border-primary ring-2 ring-primary ring-offset-2'
                      : 'border-border hover:border-primary/50'
                  }`}
                  style={{
                    backgroundColor: previewStyles[
                      '--preview-background' as keyof typeof previewStyles
                    ] as string
                  }}
                >
                  {option.value !== 'none' && (
                    <AnimationPreviewMini
                      type={option.value as any}
                      primaryColor={
                        getEffectiveDarkMode(theme.darkMode)
                          ? theme.primaryDark
                          : theme.primaryLight
                      }
                      secondaryColor={
                        getEffectiveDarkMode(theme.darkMode)
                          ? theme.secondaryDark
                          : theme.secondaryLight
                      }
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                    <span className="text-xs font-medium">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {theme.backgroundAnimationType !== 'none' && (
            <div className="space-y-2">
              <Label htmlFor="backgroundAnimationSpeed">
                {t('settings.animationSpeed')}
              </Label>
              <Select
                value={theme.backgroundAnimationSpeed}
                onValueChange={(value) =>
                  setTheme((prev) => {
                    const nextState = {
                      ...prev,
                      backgroundAnimationSpeed: value
                    } as ThemeFormState;
                    applyLivePreview(nextState);
                    return nextState;
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slow">
                    {t('settings.speedSlow')}
                  </SelectItem>
                  <SelectItem value="medium">
                    {t('settings.speedMedium')}
                  </SelectItem>
                  <SelectItem value="fast">
                    {t('settings.speedFast')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="backgroundSvgPattern">
              {t('settings.svgPatternOptional')}
            </Label>
            <Input
              id="backgroundSvgPattern"
              placeholder={t('settings.svgPatternPlaceholder')}
              value={theme.backgroundSvgPattern}
              onChange={(event) =>
                setTheme((prev) => {
                  const nextState = {
                    ...prev,
                    backgroundSvgPattern: event.target.value
                  } as ThemeFormState;
                  applyLivePreview(nextState);
                  return nextState;
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              {t('settings.svgPatternHelper')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="elementAnimationStyle">
              {t('settings.elementAnimationStyle')}
            </Label>
            <Select
              value={theme.elementAnimationStyle}
              onValueChange={(value) =>
                setTheme((prev) => {
                  const nextState = {
                    ...prev,
                    elementAnimationStyle: value
                  } as ThemeFormState;
                  applyLivePreview(nextState);
                  return nextState;
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="subtle">
                  {t('settings.elementAnimationSubtle')}
                </SelectItem>
                <SelectItem value="moderate">
                  {t('settings.elementAnimationModerate')}
                </SelectItem>
                <SelectItem value="dynamic">
                  {t('settings.elementAnimationDynamic')}
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t('settings.elementAnimationHelp')}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="borderRadiusStyle">
                {t('settings.borderRadiusStyle')}
              </Label>
              <Select
                value={theme.borderRadiusStyle}
                onValueChange={(value) =>
                  setTheme((prev) => {
                    const nextState = {
                      ...prev,
                      borderRadiusStyle: value
                    } as ThemeFormState;
                    applyLivePreview(nextState);
                    return nextState;
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rounded">
                    {t('settings.borderRadiusRounded')}
                  </SelectItem>
                  <SelectItem value="soft">
                    {t('settings.borderRadiusSoft')}
                  </SelectItem>
                  <SelectItem value="sharp">
                    {t('settings.borderRadiusSharp')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shadowStyle">{t('settings.shadowStyle')}</Label>
              <Select
                value={theme.shadowStyle}
                onValueChange={(value) =>
                  setTheme((prev) => {
                    const nextState = {
                      ...prev,
                      shadowStyle: value
                    } as ThemeFormState;
                    applyLivePreview(nextState);
                    return nextState;
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('common.none')}</SelectItem>
                  <SelectItem value="subtle">
                    {t('settings.shadowSubtle')}
                  </SelectItem>
                  <SelectItem value="medium">
                    {t('settings.shadowMedium')}
                  </SelectItem>
                  <SelectItem value="strong">
                    {t('settings.shadowStrong')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.brandAssets')}</CardTitle>
          <CardDescription>
            {t('settings.brandAssetsDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="logoUrl">{t('settings.logoUrl')}</Label>
            <Input
              id="logoUrl"
              placeholder={t('settings.logoUrlPlaceholder')}
              value={theme.logoUrl}
              onChange={(event) =>
                setTheme((prev) => ({ ...prev, logoUrl: event.target.value }))
              }
            />
            <p className="text-xs text-muted-foreground">
              {t('settings.logoUrlHint')}
            </p>
          </div>
          <div className="rounded-lg border p-4 text-sm text-muted-foreground">
            <div className="mb-2 flex items-center gap-2 text-foreground">
              <Image className="h-4 w-4" /> {t('settings.preview')}
            </div>
            {theme.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={theme.logoUrl}
                alt={t('settings.storeLogoPreview')}
                className="h-16"
              />
            ) : (
              <p>{t('settings.noLogoProvided')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? t('settings.savingTheme') : t('settings.saveTheme')}
        </Button>
      </div>
    </div>
  );
}
