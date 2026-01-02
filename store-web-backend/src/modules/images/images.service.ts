import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/services/database.service';

export interface Image {
    image_id: number;
    image_url: string;
}

@Injectable()
export class ImagesService {
    constructor(private db: DatabaseService) {}

    async findAll(): Promise<Image[]> {
        try {
            const rows = await this.db.query<Image>(
                'SELECT image_id, image_url FROM image ORDER BY image_id ASC',
            );
            return rows || [];
        } catch (err) {
            console.error('Error fetching images:', err);
            return [];
        }
    }

    async findOne(imageId: number): Promise<Image | null> {
        try {
            const rows = await this.db.query<Image>(
                'SELECT image_id, image_url FROM image WHERE image_id = ? LIMIT 1',
                [imageId],
            );
            return rows?.[0] || null;
        } catch (err) {
            console.error('Error fetching image:', err);
            return null;
        }
    }
}
