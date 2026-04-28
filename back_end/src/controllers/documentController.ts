import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware'; 

export const getDocumentForVerification = async (req: AuthRequest, res: Response): Promise<void> => {
  const documentId = req.params.id;

  // Since we used AuthRequest, we know EXACTLY which admin is making the request
  console.log(`[AUDIT] Admin ${req.user?.id} is accessing document ${documentId}`);

  // Mock database response to unblock the Desktop Team (Issue #13)
  const mockApplicationData = {
    applicationId: documentId,
    citizenData: {
      fullName: "Paul", 
      nationalId: "1092837465",
      dateOfBirth: "1995-08-14",
      councilJurisdiction: "Yaoundé IV"
    },
    // This path tells the Java app where to download the PDF for the right side of the screen
    documentFileUrl: `/uploads/hospital_cert_${documentId}.pdf`, 
    status: "PENDING_VERIFICATION"
  };

  res.status(200).json({
    status: 'success',
    data: mockApplicationData
  });
};