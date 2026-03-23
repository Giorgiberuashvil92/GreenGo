import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { existsSync } from 'fs';
import { join } from 'path';

/** greengo-backend/.env — იგივე ადგილი nest start (src) და node dist (dist/src) რეჟიმებში */
function resolveBackendEnvFile(): string {
  const fromSrcTree = join(__dirname, '..', '.env');
  const fromDistTree = join(__dirname, '..', '..', '.env');
  if (existsSync(fromSrcTree)) return fromSrcTree;
  if (existsSync(fromDistTree)) return fromDistTree;
  return fromSrcTree;
}
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BannersModule } from './banners/banners.module';
import { CategoriesModule } from './categories/categories.module';
import { CouriersModule } from './couriers/couriers.module';
import { MenuItemsModule } from './menu-items/menu-items.module';
import { OrdersModule } from './orders/orders.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: resolveBackendEnvFile(),
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/greengo', {
      retryWrites: true,
      w: 'majority',
    }),
    RestaurantsModule,
    OrdersModule,
    MenuItemsModule,
    UsersModule,
    AuthModule,
    CategoriesModule,
    CouriersModule,
    BannersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
