import type { DecimalValue, ISODateString, Nullable } from "./common.type";
import type { Contract } from "./contract.type";
import type { Proposal, ProposalItem } from "./proposal.type";
import type { Review } from "./review.type";
import type { User } from "./user.type";

export const APPLICATION_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface ApplyAsProfessionalPayload {
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

export interface VerifyProfessionalEmailPayload {
  email: string;
  otp: string;
}

export interface ProfessionalApplication extends User {
  professional: Professional;
}

export interface AdditionalFile {
  url: string;
  publicId: string;
}

export interface ProfessionalService {
  id: string;
  professionalId: string;
  name: string;
  description: Nullable<string>;
  pricingNote: Nullable<string>;
  minimumPrice: Nullable<DecimalValue>;
  maximumPrice: Nullable<DecimalValue>;
  isActive: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  professional?: Professional;
  proposalItems?: ProposalItem[];
  contracts?: Contract[];
  _count?: {
    proposalItems?: number;
    contracts?: number;
  };
}

export interface Skill {
  id: string;
  name: string;
  description: Nullable<string>;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  professionals?: ProfessionalSkill[];
}

export interface ProfessionalSkill {
  professionalId: string;
  skillId: string;
  createdAt: ISODateString;
  skill?: Skill;
  professional?: Professional;
}

export interface Experience {
  id: string;
  professionalId: string;
  title: string;
  description: Nullable<string>;
  organization: Nullable<string>;
  startDate: Nullable<ISODateString>;
  endDate: Nullable<ISODateString>;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  professional?: Professional;
}

export interface PortfolioItem {
  id: string;
  professionalId: string;
  title: string;
  description: Nullable<string>;
  eventType: Nullable<string>;
  mediaUrl: Nullable<string>;
  publicId: Nullable<string>;
  externalUrl: Nullable<string>;
  workDate: Nullable<ISODateString>;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  professional?: Professional;
}

export interface Professional {
  id: string;
  name: string;
  email: string;
  phone: Nullable<string>;
  address: Nullable<string>;
  city: Nullable<string>;
  country: Nullable<string>;
  professionalTitle: string;
  bio: Nullable<string>;
  experienceYears: number;
  acceptingBookings: boolean;
  status: ApplicationStatus;
  reviewedById: Nullable<string>;
  reviewedAt: Nullable<ISODateString>;
  rejectionReason: Nullable<string>;
  resume: Nullable<string>;
  resumePublicId: Nullable<string>;
  additionalFiles: Nullable<AdditionalFile[]>;
  isDeleted: boolean;
  deletedAt: Nullable<ISODateString>;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  averageRating: Nullable<DecimalValue>;
  totalReviews: number;
  userId: string;
  user?: User;
  services?: ProfessionalService[];
  skills?: ProfessionalSkill[];
  experiences?: Experience[];
  portfolioItems?: PortfolioItem[];
  proposals?: Proposal[];
  contracts?: Contract[];
  reviews?: Review[];
}

export interface PublicProfessional {
  id: string;
  name: string;
  professionalTitle: string;
  experienceYears: number;
  bio: Nullable<string>;
  averageRating: Nullable<DecimalValue>;
  totalReviews: number;
  createdAt: ISODateString;
  skills: { skill: Pick<Skill, "id" | "name"> }[];
  experiences: Experience[];
  services: ProfessionalService[];
  portfolioItems: PortfolioItem[];
  reviews: Review[];
  user?: User;
}

export interface UpdateProfessionalProfilePayload {
  bio?: string | null;
  professionalTitle?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  experienceYears?: number;
  acceptingBookings?: boolean;
}

export interface CreateProfessionalServicePayload {
  name: string;
  description?: string;
  pricingNote: string;
  minimumPrice: number;
  maximumPrice: number;
}

export type UpdateProfessionalServicePayload =
  Partial<CreateProfessionalServicePayload>;

export interface CreateSkillPayload {
  name: string;
  description?: string;
}

export interface CreateExperiencePayload {
  title: string;
  description?: string;
  organization?: string;
  startDate?: string;
  endDate?: string;
}

export type UpdateExperiencePayload = Partial<CreateExperiencePayload>;

export interface CreatePortfolioItemPayload {
  title: string;
  description?: string;
  eventType?: string;
  workDate: string;
  externalUrl?: string;
}

export type UpdatePortfolioItemPayload = Partial<CreatePortfolioItemPayload>;
