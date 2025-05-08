import { Match } from "./Match";
import { S3FileInfo } from "./S3FileInfo";

export interface SearchResult {
    file: S3FileInfo;
    matches: Match[];
    matchCount: number;
}
