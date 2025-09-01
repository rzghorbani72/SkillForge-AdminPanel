import { toast } from 'react-toastify';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: ValidationError[];
}

export class ErrorHandler {
  /**
   * Parse backend validation errors and display them as toast notifications
   */
  static handleValidationErrors(error: any): void {
    // Handle different error formats from the backend
    let errorMessage = '';
    let validationErrors: ValidationError[] = [];

    if (typeof error === 'string') {
      // Simple string error
      errorMessage = error;
    } else if (error?.message) {
      // Error object with message
      errorMessage = error.message;

      // Check if it's a validation error string from backend
      if (typeof error.message === 'string' && error.message.includes(',')) {
        // Parse comma-separated validation errors
        const errorParts = error.message
          .split(',')
          .map((part: string) => part.trim());

        errorParts.forEach((part: string) => {
          if (part.includes('should not be empty')) {
            const field = part.split(' ')[0];
            validationErrors.push({
              field,
              message: `${this.formatFieldName(field)} is required`
            });
          } else if (part.includes('must be a valid phone number')) {
            validationErrors.push({
              field: 'phone_number',
              message: 'Please enter a valid phone number'
            });
          } else if (part.includes('must be shorter than or equal to')) {
            const field = part.split(' ')[0];
            const maxLength = part.match(/(\d+)/)?.[1] || '';
            validationErrors.push({
              field,
              message: `${this.formatFieldName(field)} must be ${maxLength} characters or less`
            });
          } else if (part.includes('must be longer than or equal to')) {
            const field = part.split(' ')[0];
            const minLength = part.match(/(\d+)/)?.[1] || '';
            validationErrors.push({
              field,
              message: `${this.formatFieldName(field)} must be at least ${minLength} characters`
            });
          } else if (part.includes('must be a string')) {
            const field = part.split(' ')[0];
            validationErrors.push({
              field,
              message: `${this.formatFieldName(field)} must be text`
            });
          } else {
            // Generic error
            validationErrors.push({
              field: 'general',
              message: part
            });
          }
        });
      }
    } else if (error?.errors && Array.isArray(error.errors)) {
      // Array of validation errors
      validationErrors = error.errors;
    } else if (error?.response?.data) {
      // Axios error response
      const responseData = error.response.data;
      if (responseData.message) {
        errorMessage = responseData.message;
      }
      if (responseData.errors) {
        validationErrors = responseData.errors;
      }
    }

    // Display validation errors as individual toasts
    if (validationErrors.length > 0) {
      validationErrors.forEach((validationError) => {
        try {
          if (validationError.field === 'general') {
            toast.error(validationError.message);
          } else {
            toast.error(
              `${this.formatFieldName(validationError.field)}: ${validationError.message}`
            );
          }
        } catch (error) {
          console.error('Error displaying toast:', error);
          console.error('Validation error:', validationError);
        }
      });
    } else if (errorMessage) {
      // Display general error message
      try {
        toast.error(errorMessage);
      } catch (error) {
        console.error('Error displaying toast:', error);
        console.error('Error message:', errorMessage);
      }
    } else {
      // Fallback error message
      try {
        toast.error('An unexpected error occurred. Please try again.');
      } catch (error) {
        console.error('Error displaying toast:', error);
        console.error('Fallback error message');
      }
    }
  }

  /**
   * Handle general API errors
   */
  static handleApiError(error: any): void {
    console.error('API Error:', error);

    if (error?.response?.status === 401) {
      try {
        toast.error('Authentication failed. Please log in again.');
      } catch (toastError) {
        console.error('Authentication failed. Please log in again.');
      }
    } else if (error?.response?.status === 403) {
      try {
        toast.error('You do not have permission to perform this action.');
      } catch (toastError) {
        console.error('You do not have permission to perform this action.');
      }
    } else if (error?.response?.status === 404) {
      try {
        toast.error('The requested resource was not found.');
      } catch (toastError) {
        console.error('The requested resource was not found.');
      }
    } else if (error?.response?.status === 422) {
      // Validation errors
      this.handleValidationErrors(error);
    } else if (error?.response?.status >= 500) {
      try {
        toast.error('Server error. Please try again later.');
      } catch (toastError) {
        console.error('Server error. Please try again later.');
      }
    } else {
      this.handleValidationErrors(error);
    }
  }

  /**
   * Handle form submission errors
   */
  static handleFormError(
    error: any,
    formFields?: string[]
  ): Record<string, string> {
    const fieldErrors: Record<string, string> = {};

    if (typeof error === 'string') {
      // Simple string error - show as general error
      try {
        toast.error(error);
      } catch (toastError) {
        console.error('Form error:', error);
      }
      return fieldErrors;
    }

    if (error?.message) {
      const errorMessage = error.message;

      // Parse validation errors and map to form fields
      if (typeof errorMessage === 'string' && errorMessage.includes(',')) {
        const errorParts = errorMessage
          .split(',')
          .map((part: string) => part.trim());

        errorParts.forEach((part: string) => {
          if (part.includes('should not be empty')) {
            const field = part.split(' ')[0];
            const formattedField = this.mapFieldName(field);
            if (formattedField) {
              fieldErrors[formattedField] =
                `${this.formatFieldName(field)} is required`;
            }
          } else if (part.includes('must be a valid phone number')) {
            fieldErrors['phone_number'] = 'Please enter a valid phone number';
          } else if (part.includes('must be shorter than or equal to')) {
            const field = part.split(' ')[0];
            const maxLength = part.match(/(\d+)/)?.[1] || '';
            const formattedField = this.mapFieldName(field);
            if (formattedField) {
              fieldErrors[formattedField] =
                `${this.formatFieldName(field)} must be ${maxLength} characters or less`;
            }
          } else if (part.includes('must be longer than or equal to')) {
            const field = part.split(' ')[0];
            const minLength = part.match(/(\d+)/)?.[1] || '';
            const formattedField = this.mapFieldName(field);
            if (formattedField) {
              fieldErrors[formattedField] =
                `${this.formatFieldName(field)} must be at least ${minLength} characters`;
            }
          } else if (part.includes('must be a string')) {
            const field = part.split(' ')[0];
            const formattedField = this.mapFieldName(field);
            if (formattedField) {
              fieldErrors[formattedField] =
                `${this.formatFieldName(field)} must be text`;
            }
          }
        });
      }
    }

    // Show any unmapped errors as toast
    if (Object.keys(fieldErrors).length === 0 && error?.message) {
      try {
        toast.error(error.message);
      } catch (toastError) {
        console.error('Unmapped error:', error.message);
      }
    }

    return fieldErrors;
  }

  /**
   * Format field names for display
   */
  private static formatFieldName(field: string): string {
    const fieldMap: Record<string, string> = {
      phone_number: 'Phone number',
      confirmed_password: 'Confirm password',
      otp: 'OTP code',
      password: 'Password',
      email: 'Email',
      name: 'Name',
      role: 'Role',
      school_id: 'School',
      display_name: 'Display name'
    };

    return (
      fieldMap[field] ||
      field.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    );
  }

  /**
   * Map backend field names to frontend field names
   */
  private static mapFieldName(field: string): string | null {
    const fieldMap: Record<string, string> = {
      phone_number: 'phone',
      confirmed_password: 'confirmPassword',
      otp: 'otp',
      password: 'password',
      email: 'email',
      name: 'name',
      role: 'role',
      school_id: 'existingSchoolId',
      display_name: 'name'
    };

    return fieldMap[field] || null;
  }

  /**
   * Show success message
   */
  static showSuccess(message: string): void {
    try {
      toast.success(message);
    } catch (error) {
      console.log('Success:', message);
    }
  }

  /**
   * Show info message
   */
  static showInfo(message: string): void {
    try {
      toast.info(message);
    } catch (error) {
      console.log('Info:', message);
    }
  }

  /**
   * Show warning message
   */
  static showWarning(message: string): void {
    try {
      toast.warning(message);
    } catch (error) {
      console.warn('Warning:', message);
    }
  }
}
