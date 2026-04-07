/**
 * Central academic metadata for the GPS Kunda Smart Portal.
 */
export const CLASSES = ['4', '5', '6', '7', '8', '9', '10'];

export const BASE_SUBJECTS = [
  'English', 
  'Urdu', 
  'Islamiat', 
  'Maths', 
  'General Science', 
  'Social Study'
];

export const HIGH_SCHOOL_SUBJECTS = [
  'Physics', 
  'Chemistry', 
  'Biology'
];

/**
 * Returns available subjects for a specific class.
 * @param {string} className 
 */
export const getSubjectsByClass = (className) => {
  if (className === '9' || className === '10') {
    return [...BASE_SUBJECTS, ...HIGH_SCHOOL_SUBJECTS];
  }
  return BASE_SUBJECTS;
};
