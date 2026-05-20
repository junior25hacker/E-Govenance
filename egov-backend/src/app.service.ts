import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  // Schema generator for the Report Lost Document Wizard
  getDocumentSchema(type: string) {
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
}