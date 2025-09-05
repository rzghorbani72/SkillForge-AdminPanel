/**
 * Video Constraints Configuration for Educational Platform
 * Optimized for cost efficiency and storage management
 */

export const VIDEO_CONSTRAINTS = {
  // File Format
  ALLOWED_FORMATS: ['video/mp4'],
  ALLOWED_EXTENSIONS: ['.mp4'],

  // File Size Limits - Market Competitive
  MAX_FILE_SIZE: 500 * 1024 * 1024, // 500MB (competitive with Udemy)
  MAX_FILE_SIZE_MB: 500,

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

  // Error Messages
  MESSAGES: {
    INVALID_FORMAT: 'Please select a valid MP4 video file',
    FILE_TOO_LARGE: (size: string) =>
      `Video file size (${size}) must be less than 500MB. Consider compressing your video.`,
    DURATION_TOO_LONG: (duration: string) =>
      `Video duration (${duration}) must be less than 30 minutes. Consider splitting into shorter segments.`,
    FILE_SELECTED: (size: string) => `Video selected: ${size}`,
    UPLOAD_SUCCESS: 'Video uploaded successfully!',
    UPLOAD_ERROR: 'Failed to upload video. Please try again.'
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

// Helper functions
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const validateVideoFile = (
  file: File
): { valid: boolean; error?: string } => {
  // Check file type
  if (!VIDEO_CONSTRAINTS.ALLOWED_FORMATS.includes(file.type)) {
    return { valid: false, error: VIDEO_CONSTRAINTS.MESSAGES.INVALID_FORMAT };
  }

  // Check file size
  if (file.size > VIDEO_CONSTRAINTS.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: VIDEO_CONSTRAINTS.MESSAGES.FILE_TOO_LARGE(
        formatFileSize(file.size)
      )
    };
  }

  return { valid: true };
};

export const validateVideoDuration = (
  duration: number
): { valid: boolean; error?: string } => {
  if (duration > VIDEO_CONSTRAINTS.MAX_DURATION_SECONDS) {
    return {
      valid: false,
      error: VIDEO_CONSTRAINTS.MESSAGES.DURATION_TOO_LONG(
        formatDuration(duration)
      )
    };
  }

  return { valid: true };
};
