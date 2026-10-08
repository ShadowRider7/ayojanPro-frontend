export type ProfessionalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ProfessionalApplicationData {
  user: {
    name: string;
    email: string;
  };
  professional: {
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    professionalTitle: string;
    bio?: string;
    experienceYears: number;
  };
}

export interface ProfessionalApplicationPayload {
  data: ProfessionalApplicationData;
  resume: File;
  additionalFiles: File[];
}
