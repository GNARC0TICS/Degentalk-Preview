// server/src/domains/uploads/upload.service.ts

// import { v4 as uuidv4 } from 'uuid'; // Not strictly needed here if storageService handles unique names or paths are deterministic
import { 
  storageService, 
  AVATARS_BUCKET, 
  BANNERS_BUCKET,
  // type GetPresignedUploadUrlParams, // This type is for storageService, not directly used here
  // type PresignedUrlInfo // This type is for storageService, not directly used here
} from '../../core/storage.service';

// --- Types specific to this Upload Domain Service ---
export type UploadType = 'avatar' | 'banner';

export interface CreatePresignedUrlServiceParams {
  userId: string; 
  fileName: string; 
  fileType: string; 
  fileSize: number; 
  uploadType: UploadType;
}

export interface PresignedUploadServiceResult {
  uploadUrl: string;
  publicUrl: string;
  relativePath: string; 
}

export interface ConfirmUploadServiceParams {
  relativePath: string; 
  uploadType: UploadType;
}

export interface UploadConfirmationServiceResult {
  success: boolean;
  message: string;
  newPublicUrl?: string;
  relativePath?: string;
}

// Custom DegenUploadError (can be defined here or imported if it's shared)
export class DegenUploadError extends Error {
  public statusCode: number;
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'DegenUploadError';
    this.statusCode = statusCode;
  }
}

// --- Service Class ---
export class UploadService {
  // private sanitizeFileName(fileName: string): string { // This logic can move to storage.service if needed or stay if pre-sanitization is desired
  //   const nameWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
  //   const extension = (fileName.substring(fileName.lastIndexOf('.') + 1) || '').toLowerCase();
  //   let sanitized = nameWithoutExtension.replace(/[^a-zA-Z0-9_-]/g, '_');
  //   sanitized = sanitized.replace(/__+/g, '_');
  //   sanitized = sanitized.replace(/^_+|_+$/g, '');
  //   sanitized = sanitized.substring(0, 100);
  //   return extension ? `${sanitized}.${extension}` : sanitized;
  // }

  private getFileExtension(fileName: string): string {
    const lastDot = fileName.lastIndexOf('.');
    if (lastDot === -1 || lastDot === 0 || lastDot === fileName.length - 1) {
      return ''; 
    }
    return fileName.substring(lastDot + 1).toLowerCase();
  }

  async createPresignedUploadUrl(params: CreatePresignedUrlServiceParams): Promise<PresignedUploadServiceResult> {
    const { userId, fileName, fileType, fileSize, uploadType } = params;

    const bucketName = uploadType === 'avatar' ? AVATARS_BUCKET : BANNERS_BUCKET;
    
    const extension = this.getFileExtension(fileName);
    if (!extension) {
        throw new DegenUploadError(`File (${fileName}) needs a valid extension, my G. What even is this?`, 400);
    }

    // Deterministic relative path
    const relativePath = `users/${userId}/${uploadType}.${extension}`;

    try {
      const presignedInfoFromStorage = await storageService.getPresignedUploadUrl({
        bucket: bucketName,
        relativePath: relativePath, // This is the targetPath for storage service
        fileType: fileType,
        fileSize: fileSize,
      });

      // The public URL should also be constructed via the storage service
      const publicUrl = storageService.getPublicUrl(bucketName, presignedInfoFromStorage.relativePath);

      return {
        uploadUrl: presignedInfoFromStorage.uploadUrl,
        publicUrl: publicUrl,
        relativePath: presignedInfoFromStorage.relativePath,
      };
    } catch (err) {
      if (err instanceof DegenUploadError) { // Catch DegenUploadError from storageService
        throw err;
      }
      console.error(`UploadService: Error creating presigned URL for ${relativePath} via storageService:`, err);
      const statusCode = (typeof err === 'object' && err !== null && 'statusCode' in err && typeof err.statusCode === 'number') ? err.statusCode : 500;
      throw new DegenUploadError(
        `The tubes are clogged trying to get that upload URL for ${relativePath}. Server's probably NGMI.`, 
        statusCode // Propagate status code if available
      );
    }
  }

  async confirmUpload(userId: string, params: ConfirmUploadServiceParams): Promise<UploadConfirmationServiceResult> {
    const { relativePath, uploadType } = params;
    
    const bucketName = uploadType === 'avatar' ? AVATARS_BUCKET : BANNERS_BUCKET;

    const expectedUserFolder = `users/${userId}/`;
    if (!relativePath.startsWith(expectedUserFolder)) {
      console.error(`UploadService: Security check failed. User ${userId} trying to confirm path ${relativePath} not matching their folder.`);
      throw new DegenUploadError(
        `Hold your horses, degenerate! That path (${relativePath}) ain't yours to confirm. Nice try, script kiddie.`, 403
      );
    }
    
    try {
      const fileExists = await storageService.verifyFileExists(bucketName, relativePath);

      if (!fileExists) {
        console.warn(`UploadService: File not found in storage at path ${relativePath} during confirmation for user ${userId}.`);
        throw new DegenUploadError(
          `We checked the blockchain (our storage, lol) and your file at ${relativePath} is pure vaporware. Upload it first, genius.`, 404
        );
      }
      
      const publicUrl = storageService.getPublicUrl(bucketName, relativePath);
      
      return {
        success: true,
        message: `Your ${uploadType} at ${relativePath} is confirmed and looking fire on the permaweb!`,
        newPublicUrl: publicUrl,
        relativePath: relativePath,
      };

    } catch (err) {
      if (err instanceof DegenUploadError) { // Catch DegenUploadError from storageService
        throw err;
      }
      console.error(`UploadService: Unexpected error in confirmUpload for path ${relativePath} (user ${userId}):`, err);
      const statusCode = (typeof err === 'object' && err !== null && 'statusCode' in err && typeof err.statusCode === 'number') ? err.statusCode : 500;
      throw new DegenUploadError(
        `Something went intergalactically wrong confirming your upload of ${relativePath}. Server's probably rugged.`,
        statusCode // Propagate status code if available
      );
    }
  }
}

export const uploadService = new UploadService();
