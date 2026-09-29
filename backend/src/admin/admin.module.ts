import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { CatalogModule } from '../catalog/catalog.module';
import { CommerceModule } from '../commerce/commerce.module';
import { AuthModule } from '../auth/auth.module';
import { PosService } from './pos.service';
import { ReportsService } from './reports.service';
@Module({ imports: [AuthModule, CatalogModule, CommerceModule], controllers: [AdminController], providers: [PosService, ReportsService] })
export class AdminModule {}
