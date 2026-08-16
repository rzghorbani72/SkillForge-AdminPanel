/**
 * Video Constraints Configuration for Educational Platform
 * Optimized for cost efficiency and storage management
 */

import {
  formatDuration,
  formatFileSize
} from '@/components/shared/utils';

// Locale-aware size/duration labels (Persian digits + مگابایت when language is fa)
export { formatFileSize, formatDuration };

export const VIDEO_CONSTRAINTS = {
  // File Format
  ALLOWED_FORMATS: ['video/mp4'],
  ALLOWED_EXTENSIONS: ['.mp4'],

  // File Size Limits - Market Competitive
  MAX_FILE_SIZE: 700 * 1024 * 1024, // 700MB (0.7 GB)
  MAX_FILE_SIZE_MB: 700,

  // Duration Limits - Market Competitive
  MAX_DURATION_SECONDS: 30 * 60, // 30 minutes (optimal for engagement)
  MAX_DURATION_MINUTES: 30,
  RECOMMENDED_DURATION_MINUTES: { min: 5, max: 15 },

  // Video Quality
  RECOMMENDED_RESOLUTION: {
    min: { width: 1280, height: 720 }, // 720p minimum
    max: { width: 1920, height: 1080 } // 1080p maximum
  },

  // Compression Settings
  RECOMMENDED_BITRATE: {
    '720p': 5000000, // 5 Mbps for 720p
    '1080p': 8000000 // 8 Mbps for 1080p
  },

  // Storage Optimization
  STORAGE_OPTIMIZATION: {
    // Cost per GB per month (example rates)
    COST_PER_GB_MONTH: 0.023, // AWS S3 standard storage
    BANDWIDTH_COST_PER_GB: 0.09, // AWS CloudFront

    // Estimated savings with constraints
    ESTIMATED_SAVINGS: {
      fileSizeReduction: '80%', // From 500MB to 100MB
      storageCostReduction: '80%',
      bandwidthCostReduction: '80%'
    }
  },

  // Educational Best Practices
  EDUCATIONAL_GUIDELINES: {
    optimalDuration: '5-10 minutes for better engagement',
    compressionTips: [
      'Use H.264 codec for best compatibility',
      'Set bitrate to 5 Mbps for 720p',
      'Remove unnecessary audio tracks',
      'Use 30fps instead of 60fps for educational content'
    ],
    qualityVsSize:
      'Balance between quality and file size for optimal learning experience'
  }
} as const;

/**
 * Validators return a translation key (plus its params) instead of a message,
 * so the text is rendered in the user's language at the call site.
 */
export type VideoValidation =
  | { valid: true }
  | { valid: false; errorKey: string; params?: Record<string, string> };

export const validateVideoFile = (file: File): VideoValidation => {
  if (!VIDEO_CONSTRAINTS.ALLOWED_FORMATS.includes(file.type as never)) {
    return { valid: false, errorKey: 'toasts.videoInvalidFormat' };
  }

  if (file.size > VIDEO_CONSTRAINTS.MAX_FILE_SIZE) {
    return {
      valid: false,
      errorKey: 'toasts.videoTooLarge',
      params: {
        size:
          formatFileSize(file.size) ||
          `${VIDEO_CONSTRAINTS.MAX_FILE_SIZE_MB}`
      }
    };
  }

  return { valid: true };
};

export const validateVideoDuration = (duration: number): VideoValidation => {
  if (duration > VIDEO_CONSTRAINTS.MAX_DURATION_SECONDS) {
    return {
      valid: false,
      errorKey: 'toasts.videoTooLong',
      params: { duration: formatDuration(duration) }
    };
  }

  return { valid: true };
};
