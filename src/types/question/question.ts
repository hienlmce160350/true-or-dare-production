import { QuestionModeEnum } from "./question-mode-enum";
import { QuestionTypeEnum } from "./question-type-enum";

export type Question = {
  id: string;
  gameType: string;
  mode: QuestionModeEnum;
  type: QuestionTypeEnum;
  text: string;
  difficulty: string;
  ageGroup: string;
  timeLimit: number;
  responseType: string;
  points: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isCustom: boolean;
  visibility: string;
  tags: string[];
  isDeleted: boolean;
};

export type IQuestionFilters = {
  mode?: string;
  type?: string;
  difficulty?: string;
  age_group?: string;
};

export type filterQuestionRequest = {
  filter?: IQuestionFilters | null;
};