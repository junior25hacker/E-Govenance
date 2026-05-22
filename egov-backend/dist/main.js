"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const app_module_1 = require("./app.module");
const unauthorized_exception_filter_1 = require("./common/filters/unauthorized-exception.filter");
const cookieParser = require('cookie-parser');
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use(cookieParser());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalFilters(new unauthorized_exception_filter_1.UnauthorizedExceptionFilter());
    app.enableCors({
        origin: true,
        credentials: true,
    });
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'public'));
    app.setBaseViewsDir((0, path_1.join)(__dirname, '..', 'views'));
    app.setViewEngine('hbs');
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log(`[BACKEND] 🚀 E-Governance Backend & Portal running on: http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map