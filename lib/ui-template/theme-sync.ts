import { buildThemeDraftFromPrimary } from './theme-draft-payload';
import type {
  BorderRadius,
  ContainerWidth,
  ElementAnimation,
  FontFamily,
  HeadingScale,
  SectionSpacing,
  Shadow,
  TextDirection
} from '@/components/ui-template/sidebar-types';

/** Every style control the customizer owns, in one object. */
export interface ThemeSyncState {
  primaryColor: string;
  fontFamily: FontFamily;
  borderRadius: BorderRadius;
  shadow: Shadow;
  elementAnimation: ElementAnimation;
  darkMode: boolean | null;
  textDirection: TextDirection;
  sectionSpacing: SectionSpacing;
  containerWidth: ContainerWidth;
  headingScale: HeadingScale;
}

/**
 * The complete theme, shaped exactly as the preview's `buildThemeCssVariables`
 * expects it.
 *
 * It has to be complete rather than a patch of the one changed control: the CSS
 * variables are derived from the whole set (surfaces and borders are mixed from
 * primary plus background), so sending one field would repaint everything else
 * with defaults.
 */
export function buildFullThemePayload(state: ThemeSyncState) {
  return {
    ...buildThemeDraftFromPrimary(state.primaryColor, {
      borderRadius: state.borderRadius,
      shadow: state.shadow,
      backgroundSvgPattern: ''
    }),
    dark_mode: state.darkMode,
    element_animation_style: state.elementAnimation,
    font_family: state.fontFamily,
    text_direction: state.textDirection,
    section_spacing: state.sectionSpacing,
    container_width: state.containerWidth,
    heading_scale: state.headingScale
  };
}
