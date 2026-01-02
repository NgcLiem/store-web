import { Injectable } from '@nestjs/common';
import { JwtAuthGuard as BaseJwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

/**
 * Wrapper guard placed inside Auth module for consistent module structure.
 * Reuses the shared implementation in src/common/guards.
 */
@Injectable()
export class JwtAuthGuard extends BaseJwtAuthGuard {}
