import { SearchResult } from "./SearchResult";

export interface SearchResponse {
    searchTerm: string;
    totalFiles: number;
    matchedFiles: number;
    totalMatches: number;
    matches: SearchResult[];
}
