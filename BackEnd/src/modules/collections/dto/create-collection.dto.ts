export class CreateCollectionDto {
  Name: string;
  Title?: string;
  Description?: string;
  ImagePath?: string;
  ImageDescription?: string;
  CategoryID?: number;
  ArticleIDs?: number[];
}
