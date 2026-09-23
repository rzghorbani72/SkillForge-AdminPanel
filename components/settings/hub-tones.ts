export type HubCardTone = {
  tile: string;
  hover: string;
};

export const HUB_TONES = {
  violet: {
    tile: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    hover: 'hover:border-violet-500/30 hover:bg-violet-500/[0.05] dark:hover:bg-violet-500/[0.09]',
  },
  indigo: {
    tile: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    hover: 'hover:border-indigo-500/30 hover:bg-indigo-500/[0.05] dark:hover:bg-indigo-500/[0.09]',
  },
  sky: {
    tile: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    hover: 'hover:border-sky-500/30 hover:bg-sky-500/[0.05] dark:hover:bg-sky-500/[0.09]',
  },
  amber: {
    tile: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    hover: 'hover:border-amber-500/30 hover:bg-amber-500/[0.05] dark:hover:bg-amber-500/[0.09]',
  },
  emerald: {
    tile: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    hover:
      'hover:border-emerald-500/30 hover:bg-emerald-500/[0.05] dark:hover:bg-emerald-500/[0.09]',
  },
  teal: {
    tile: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    hover: 'hover:border-teal-500/30 hover:bg-teal-500/[0.05] dark:hover:bg-teal-500/[0.09]',
  },
  rose: {
    tile: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    hover: 'hover:border-rose-500/30 hover:bg-rose-500/[0.05] dark:hover:bg-rose-500/[0.09]',
  },
} as const satisfies Record<string, HubCardTone>;
