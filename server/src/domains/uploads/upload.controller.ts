import { Request, Response } from 'express';
import { generatePresignedUrl } from './upload.service';

export async function getPresignedUrlController(req: Request, res: Response) {
	try {
		const { field, fileName, fileType } = req.body as {
			field: 'avatar' | 'banner';
			fileName: string;
			fileType: string;
		};

		if (!field || !fileName || !fileType) {
			return res.status(400).json({ error: 'Missing parameters' });
		}

		const { uploadUrl, publicUrl } = await generatePresignedUrl(field, fileName, fileType);
		return res.json({ uploadUrl, publicUrl });
	} catch (error) {
		console.error('Error generating presigned URL', error);
		return res.status(500).json({ error: 'Internal server error' });
	}
} 