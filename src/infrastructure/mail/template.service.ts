import * as path from 'path';
import * as fs from 'fs';
import { Injectable } from '@nestjs/common';
import * as Handlebars from 'handlebars';

@Injectable()
export class TemplateService {
  private cache = new Map<string, Handlebars.TemplateDelegate>();

  render(templateName: string, ctx?: Record<string, any>) {
    if (!this.cache.has(templateName)) {
      const templatePath = path.join(
        process.cwd(),
        'src/infrastructure/mail/templates',
        `${templateName}.hbs`,
      );

      const file = fs.readFileSync(templatePath, 'utf-8');

      this.cache.set(templateName, Handlebars.compile(file));
    }

    const template = this.cache.get(templateName);

    return template!(ctx);
  }
}
