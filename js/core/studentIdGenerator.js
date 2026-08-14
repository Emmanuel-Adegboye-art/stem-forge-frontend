// ============================================
// STUDENT ID GENERATOR
// Format: [ClassCode][Section][3-digit-number]
// Examples: J1A001, S2B042
// ============================================

const CLASS_CODES = {
    'JSS1A': 'J1A',
    'JSS1B': 'J1B',
    'JSS1C': 'J1C',
    'JSS2A': 'J2A',
    'JSS2B': 'J2B',
    'JSS2C': 'J2C',
    'JSS3A': 'J3A',
    'JSS3B': 'J3B',
    'JSS3C': 'J3C',
    'SS1A': 'S1A',
    'SS1B': 'S1B',
    'SS1C': 'S1C',
    'SS2A': 'S2A',
    'SS2B': 'S2B',
    'SS2C': 'S2C',
    'SS3A': 'S3A',
    'SS3B': 'S3B',
    'SS3C': 'S3C'
};

/**
 * Generate next available student ID for a class
 * @param {string} className - e.g., "JSS1A"
 * @param {Array} existingStudents - All existing students in this class
 * @returns {string} - New ID like "J1A005"
 */
export function generateStudentId(className, existingStudents = []) {
    const classCode = CLASS_CODES[className];
    if (!classCode) {
        throw new Error(`Invalid class name: ${className}`);
    }
    
    // Find the highest number used for this class code
    const usedNumbers = existingStudents
        .filter(s => s.id && s.id.startsWith(classCode))
        .map(s => {
            const num = parseInt(s.id.replace(classCode, ''));
            return isNaN(num) ? 0 : num;
        });
    
    const nextNumber = usedNumbers.length > 0 
        ? Math.max(...usedNumbers) + 1 
        : 1;
    
    // Pad to 3 digits (J1A001, J1A042, J1A367)
    return `${classCode}${String(nextNumber).padStart(3, '0')}`;
}

/**
 * Validate student ID format
 * @param {string} id 
 * @returns {boolean}
 */
export function isValidStudentId(id) {
    return /^[J|S]\d[A-C]\d{3}$/.test(id);
}

/**
 * Extract class from student ID
 * @param {string} id - e.g., "J1A001"
 * @returns {string} - e.g., "JSS1A"
 */
export function getClassFromId(id) {
    if (!isValidStudentId(id)) return null;
    
    const code = id.substring(0, 3);
    for (const [className, classCode] of Object.entries(CLASS_CODES)) {
        if (classCode === code) return className;
    }
    return null;
}

/**
 * Get all available classes
 */
export function getAllClasses() {
    return Object.keys(CLASS_CODES);
}

export { CLASS_CODES };
