export const MESSAGES = {
  common: {
    cancel: 'Cancel',
    save: 'Save',
    loading: 'Loading...',
    creating: 'Creating...',
    uploading: 'Uploading...',
    unavailable: 'Unavailable',
    watch: 'Watch'
  },

  category: {
    noCategoriesFound: 'No categories found',
    adjustSearch: 'Try adjusting your search or filter criteria.',
    createFirstCategory: 'Get started by creating your first category.'
  },

  product: {
    createProduct: 'Create Product',
    addNewProductTo: (storeName: string) => `Add a new product to ${storeName}`
  },

  season: {
    createNewSeason: 'Create New Season',
    organizeContent:
      'Organize your course content into logical modules or seasons',
    createSeason: 'Create Season',
    orderDescription: 'The sequence order of this season within the course',
    seasonTitle: 'Season Title',
    order: 'Order',
    description: 'Description (Optional)',
    descriptionHint: 'Explain what students will learn in this season',
    courseRequired: 'Course',
    selectCourse: 'Select a course',
    orderingConflict:
      'Unable to create season due to ordering conflict. Please try again.'
  },

  video: {
    noVideosFound: 'No videos found',
    uploadFirstVideo: 'Upload your first video to get started.',
    yourUpload: 'Your upload',
    unknownCreator: 'Unknown creator',
    untitledVideo: 'Untitled video',
    uploadVideo: 'Upload Video',
    noVideoSelected: 'No video selected',
    videoPreviewHint: 'Upload a video to preview it here',
    selectVideoFirst: 'Select a video first',
    noPosterSelected: 'No poster selected',
    posterHint: 'Upload a poster image for this video',
    selectPosterFirst: 'Select a poster first'
  },

  planForm: {
    name: 'Name',
    slug: 'Slug',
    monthlyPrice: 'Monthly Price',
    yearlyPrice: 'Yearly Price',
    storageGb: 'Storage (GB)',
    sortOrder: 'Sort Order',
    featuresPerLine: 'Features (one per line)',
    activePlanNote: 'Inactive plans are hidden from academies.',
    createPlan: 'Create Plan',
    editPlan: (planName: string) => `Edit ${planName}`,
    editPlanDesc: 'Update the subscription plan details.',
    createPlanDesc: 'Add a new subscription plan to the platform.',
    saveChanges: 'Save Changes'
  },

  validation: {
    titleMinLength: 'Title must be at least 3 characters',
    descriptionMinLength: 'Description must be at least 10 characters',
    videoRequired: 'Video file is required',
    courseRequired: 'Course is required',
    orderRequired: 'Order is required',
    orderPositiveInteger: 'Order must be a positive integer'
  }
} as const;
