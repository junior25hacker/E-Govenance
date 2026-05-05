import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { BirthDeclaration } from '../entities/BirthDeclaration';

const birthDeclRepo = AppDataSource.getRepository(BirthDeclaration);

// Create a new birth declaration (Step 1)
export const createBirthDeclaration = async (req: Request, res: Response) => {
  try {
    const { citizenId, parentFullName, parentIdNumber, childFullName, dateOfBirth, placeOfBirth, gender, councilJurisdiction } = req.body;

    const declaration = birthDeclRepo.create({
      citizenId,
      parentFullName,
      parentIdNumber,
      childFullName,
      dateOfBirth,
      placeOfBirth,
      gender,
      councilJurisdiction,
      status: 'STEP_1_SUBMITTED',
      currentStep: 1,
    });

    await birthDeclRepo.save(declaration);

    res.status(201).json({
      status: 'success',
      message: 'Birth declaration created successfully',
      data: declaration,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to create birth declaration',
      error: (error as Error).message,
    });
  }
};

// Upload documents (Step 2)
export const uploadBirthDocuments = async (req: Request, res: Response) => {
  try {
    const { declarationId } = req.params;
    const { birthCertificatePath, identityDocPath } = req.body;

    const declaration = await birthDeclRepo.findOneBy({ id: declarationId });

    if (!declaration) {
      return res.status(404).json({
        status: 'error',
        message: 'Birth declaration not found',
      });
    }

    // Validate file extensions
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
    const validateExtension = (path: string) => {
      const ext = path.toLowerCase().substring(path.lastIndexOf('.'));
      return allowedExtensions.includes(ext);
    };

    if (birthCertificatePath && !validateExtension(birthCertificatePath)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid birth certificate file format',
      });
    }

    if (identityDocPath && !validateExtension(identityDocPath)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid identity document file format',
      });
    }

    declaration.birthCertificatePath = birthCertificatePath || declaration.birthCertificatePath;
    declaration.identityDocPath = identityDocPath || declaration.identityDocPath;
    declaration.currentStep = 2;
    declaration.status = 'STEP_2_DOCUMENTS_UPLOADED';

    await birthDeclRepo.save(declaration);

    res.status(200).json({
      status: 'success',
      message: 'Documents uploaded successfully',
      data: declaration,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload documents',
      error: (error as Error).message,
    });
  }
};

// Get birth declaration by ID
export const getBirthDeclaration = async (req: Request, res: Response) => {
  try {
    const { declarationId } = req.params;

    const declaration = await birthDeclRepo.findOneBy({ id: declarationId });

    if (!declaration) {
      return res.status(404).json({
        status: 'error',
        message: 'Birth declaration not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: declaration,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch birth declaration',
      error: (error as Error).message,
    });
  }
};

// Get all declarations for a citizen
export const getBirthDeclarationsByCitizen = async (req: Request, res: Response) => {
  try {
    const { citizenId } = req.params;

    const declarations = await birthDeclRepo.findBy({ citizenId });

    res.status(200).json({
      status: 'success',
      data: declarations,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch birth declarations',
      error: (error as Error).message,
    });
  }
};

// Update declaration status (admin verification)
export const updateBirthDeclarationStatus = async (req: Request, res: Response) => {
  try {
    const { declarationId } = req.params;
    const { status } = req.body;

    const declaration = await birthDeclRepo.findOneBy({ id: declarationId });

    if (!declaration) {
      return res.status(404).json({
        status: 'error',
        message: 'Birth declaration not found',
      });
    }

    declaration.status = status;
    await birthDeclRepo.save(declaration);

    res.status(200).json({
      status: 'success',
      message: 'Birth declaration status updated',
      data: declaration,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to update birth declaration status',
      error: (error as Error).message,
    });
  }
};