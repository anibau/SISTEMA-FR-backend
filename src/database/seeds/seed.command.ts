import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';
import { InitialDataSeed } from './initial-data.seed';

async function runSeeds() {
  console.log('🌱 Iniciando proceso de semillas...');
  
  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);
    
    // Ejecutar semillas
    const initialSeed = new InitialDataSeed(dataSource);
    await initialSeed.run();
    
    console.log('✅ Semillas ejecutadas exitosamente');
    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando semillas:', error);
    process.exit(1);
  }
}

runSeeds();

