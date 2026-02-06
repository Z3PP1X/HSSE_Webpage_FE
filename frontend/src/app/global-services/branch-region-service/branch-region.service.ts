/**
 * Branch Region Service
 *
 * Fetches Company_Number for branches via API and caches results.
 */

import { Injectable, inject } from '@angular/core';
import { Observable, of, map, tap } from 'rxjs';
import { ApiService } from '../api-service/api-service';

/**
 * Response structure for branch lookup API.
 */
interface BGRegion {
    sys_id: string;
    Contract_Legal_Name: string;
    Entity_Code: string;
    Company_Number: string;
}

interface BranchResponse {
    CostCenter: string;
    BranchName: string;
    bg_regions: BGRegion[];
}

@Injectable({ providedIn: 'root' })
export class BranchRegionService {
    private apiService = inject(ApiService);
    private cache = new Map<string, string>();

    /**
     * Get Company_Number for a given cost center.
     *
     * @param costCenter - The branch cost center identifier.
     * @returns Observable<string> - The Company_Number or empty string.
     */
    getCompanyNumber(costCenter: string): Observable<string> {
        if (!costCenter) {
            return of('');
        }

        // Return cached value if available
        if (this.cache.has(costCenter)) {
            return of(this.cache.get(costCenter)!);
        }

        return this.apiService.get<BranchResponse[]>(
            `branchnetwork/company-lookup/?search=${costCenter}`
        ).pipe(
            map(response => {
                if (response && response.length > 0) {
                    const regions = response[0]?.bg_regions;
                    if (regions && regions.length > 0) {
                        return regions[0].Company_Number || '';
                    }
                }
                return '';
            }),
            tap(companyNumber => {
                this.cache.set(costCenter, companyNumber);
            })
        );
    }

    /**
     * Clear the cache (e.g., after PDF generation).
     */
    clearCache(): void {
        this.cache.clear();
    }
}
