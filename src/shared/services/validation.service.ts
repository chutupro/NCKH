import { Injectable } from '@nestjs/common';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_RATING = 0;
const MAX_RATING = 5;

/**
 * Provides common validation utilities
 */
@Injectable()
export class ValidationService {
  /**
   * Validates email format
   */
  isValidEmail(email: string): boolean {
    return EMAIL_REGEX.test(email);
  }

  /**
   * Validates rating value
   */
  isValidRating(rating: number): boolean {
    return rating >= MIN_RATING && rating <= MAX_RATING;
  }

  /**
   * Validates coordinate values
   */
  isValidCoordinate({ latitude, longitude }: { latitude: number; longitude: number }): boolean {
    const isLatitudeValid = latitude >= -90 && latitude <= 90;
    const isLongitudeValid = longitude >= -180 && longitude <= 180;
    return isLatitudeValid && isLongitudeValid;
  }

  /**
   * Checks if string is empty
   */
  isEmpty(value: string | null | undefined): boolean {
    if (value === null || value === undefined) {
      return true;
    }
    if (typeof value === 'string' && value.trim() === '') {
      return true;
    }
    return false;
  }
}

