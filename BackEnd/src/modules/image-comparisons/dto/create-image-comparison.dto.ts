export class CreateImageComparisonDto {
  Title: string;
  Description?: string;
  YearOld?: number;
  YearNew?: number;
  CategoryID?: number;
  OldImagePath?: string;
  NewImagePath?: string;
  Address?: string;
}
