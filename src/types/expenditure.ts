export interface Expenditure {
  id: string;
  date: string;
  description: string;
  imagePath: string;
  createdAt: string;
  createdBy: string;
  modifiedAt: string | null;
  modifiedBy: string | null;
}

export interface CreateExpenditureRequest {
  date: string;
  description: string;
  image_path: string;
  actor: string;
}

export interface UpdateExpenditureRequest {
  id: string;
  date?: string;
  description?: string;
  image_path?: string;
  actor: string;
}

export interface ExpenditureUploadResponse {
  success: boolean;
  fileName: string;
  url: string;
  path: string;
}