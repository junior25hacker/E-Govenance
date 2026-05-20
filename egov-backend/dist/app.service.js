"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
let AppService = class AppService {
    getHello() {
        return 'Hello World!';
    }
    getDocumentSchema(type) {
        const dataModels = {
            'national-id': {
                title: 'National ID Replacement Wizard',
                questions: [
                    { id: 'nin', label: 'National Identification Number (NIN)', type: 'text', placeholder: 'XX-XXXXXXXX-X' },
                    { id: 'jurisdiction', label: 'Original Issuing Council Location', type: 'text', placeholder: 'e.g. Central Registry' },
                    { id: 'notes', label: 'Briefly explain circumstances of card loss', type: 'textarea' }
                ]
            },
            'passport': {
                title: 'International Passport Loss Statement',
                questions: [
                    { id: 'passportNo', label: 'Passport Serial Sequence Number (If known)', type: 'text' },
                    { id: 'jurisdiction', label: 'Region / Location where identity loss happened', type: 'text' },
                    { id: 'statement', label: 'Provide police case tracking details if filed', type: 'textarea' }
                ]
            },
            'birth-certificate': {
                title: 'Registry Birth Certificate Re-Issue Request',
                questions: [
                    { id: 'fullNameOnCert', label: 'Full Initial Name Registered at Birth', type: 'text' },
                    { id: 'jurisdiction', label: 'Hospital Registry Center Jurisdiction Name', type: 'text' }
                ]
            }
        };
        return dataModels[type] || { title: 'Asset Loss Declaration', questions: [{ id: 'jurisdiction', label: 'Registry Jurisdiction Place', type: 'text' }] };
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)()
], AppService);
//# sourceMappingURL=app.service.js.map