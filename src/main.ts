import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app: INestApplication = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api');

  // Create Swagger config
  const config = new DocumentBuilder()
    .setTitle('CRUD API FOR CUSTOMER MODEL')
    .setDescription('API description')
    .setVersion('1.0')
    // .addTag('my-tag') // optional
    .build();
  // Create Swagger document
  const document = SwaggerModule.createDocument(app, config);

  // Setup Swagger module
  SwaggerModule.setup('docs', app, document);
  await app.listen(3000);
}
void bootstrap();
