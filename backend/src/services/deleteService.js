import fs from 'fs/promises';
import path from 'path';

/**
 * Delete service for cleaning up files and associated data
 */

/**
 * Delete local file if it exists
 * @param {string} filePath - Path to file
 */
export async function deleteLocalFile(filePath) {
  if (!filePath) {
    return;
  }

  try {
    await fs.access(filePath);
    await fs.unlink(filePath);
    console.log(`Deleted local file: ${filePath}`);
  } catch (err) {
    // File doesn't exist or already deleted
    if (err.code !== 'ENOENT') {
      console.error(`Error deleting file ${filePath}:`, err);
    }
  }
}

/**
 * Delete S3 file (placeholder for future S3 integration)
 * @param {string} s3Key - S3 object key
 */
export async function deleteS3File(s3Key) {
  // TODO: Implement S3 deletion when S3 is configured
  // const AWS = require('aws-sdk');
  // const s3 = new AWS.S3();
  // await s3.deleteObject({ Bucket: process.env.S3_BUCKET, Key: s3Key }).promise();
  console.log(`S3 deletion not yet implemented for: ${s3Key}`);
}

/**
 * Delete resume file (local or S3)
 * @param {object} resume - Resume document
 */
export async function deleteResumeFile(resume) {
  if (!resume) {
    return;
  }

  // Delete local file
  if (resume.filePath) {
    await deleteLocalFile(resume.filePath);
  }

  // Delete S3 file if configured
  if (resume.s3Key) {
    await deleteS3File(resume.s3Key);
  }
}

/**
 * Calculate TTL expiry date
 * @param {number} days - Number of days until expiry
 * @returns {Date}
 */
export function calculateTTL(days = 30) {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);
  return expiryDate;
}
