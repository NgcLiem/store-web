import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class TrimPipe implements PipeTransform {
  transform(value: any, _metadata: ArgumentMetadata) {
    if (typeof value === 'string') return value.trim();
    if (Array.isArray(value)) return value.map((v) => (typeof v === 'string' ? v.trim() : v));
    if (value && typeof value === 'object') {
      for (const k of Object.keys(value)) {
        if (typeof value[k] === 'string') value[k] = value[k].trim();
      }
    }
    return value;
  }
}
