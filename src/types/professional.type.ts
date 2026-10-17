import type { DecimalValue, ISODateString, Nullable } from "./common.type";
import type { Contract } from "./contract.type";
import type { ApplicationStatus } from "./enums";
import type { Proposal, ProposalItem } from "./proposal.type";
import type { Review } from "./review.type";
import type { User } from "./user.type";

/** A file attached to a professional application (`additionalFiles` JSON). */
export interface AdditionalFile {
  url: string;
  publicId: string;
}

/** A service offered by a professional (`ProfessionalService` model). */
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

/** A canonical skill (`Skill` model). */
export interface Skill {
  id: string;
  name: string;
  description: Nullable<string>;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  professionals?: ProfessionalSkill[];
}

/** Join row linking a professional to a skill (`ProfessionalSkill` model). */
export interface ProfessionalSkill {
  professionalId: string;
  skillId: string;
  createdAt: ISODateString;
  skill?: Skill;
  professional?: Professional;
}

/** A work-history entry (`Experience` model). */
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

/** A past-work showcase item (`PortfolioItem` model). */
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

/** A professional profile (`Professional` model). */
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

/**
 * Public professional payload returned by `GET /professional/public/all-Professionals`
 * and `GET /professional/public/:professionalId`. Both endpoints share the same
 * `select`, so nested skills only carry the skill `name`.
 */
export interface PublicProfessional {
  id: string;
  name: string;
  professionalTitle: string;
  experienceYears: number;
  bio: Nullable<string>;
  averageRating: Nullable<DecimalValue>;
  totalReviews: number;
  createdAt: ISODateString;
  skills: { skill: Pick<Skill, "name"> }[];
  experiences: Experience[];
  services: ProfessionalService[];
  portfolioItems: PortfolioItem[];
  reviews: Review[];
}
