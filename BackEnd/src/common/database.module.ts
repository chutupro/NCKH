import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3310,
      username: 'root',
      password: '123456',
      database: 'QLNV',
      autoLoadEntities: true,
      synchronize: true, 
    })]
})

export class databaseModule{};