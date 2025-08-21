# Schema Drift Report - Leagues Collection
*Generated: August 20, 2025*

## Critical Schema Misalignment Found

### ✅ Fields Present in Both SSOT and Appwrite:
| Field | SSOT Type | Appwrite Type | Status |
|-------|-----------|---------------|---------|
| name | String (1-100) | String | ✅ Match |
| commissioner | String (1-50) | String | ✅ Match |
| season | Number (2020-2030) | Integer | ✅ Match |
| maxTeams | Number (2-32) | Integer | ✅ Match |
| currentTeams | Number (0-32) | Integer | ✅ Match |
| draftType | Enum ['snake','auction'] | String | ✅ Match |
| gameMode | Enum ['power4','sec','acc','big12','bigten'] | String | ✅ Match |
| status | Enum ['open','full','drafting','active','complete'] | String | ✅ Match |
| isPublic | Boolean | Boolean | ✅ Match |
| pickTimeSeconds | Number (30-600) | Integer | ✅ Match |
| scoringRules | String (max 2000) | String | ✅ Match |

### ❌ Fields in SSOT but MISSING from Appwrite:
| Field | SSOT Type | Required Action |
|-------|-----------|-----------------|
| draftDate | Date (optional) | Add to Appwrite or remove from SSOT |
| selectedConference | String (max 50, optional) | Add to Appwrite or remove from SSOT |
| seasonStartWeek | Number (1-20, optional) | Add to Appwrite or remove from SSOT |
| playoffTeams | Number (0-20, optional) | Add to Appwrite or remove from SSOT |
| playoffStartWeek | Number (1-20, optional) | Add to Appwrite or remove from SSOT |
| waiverType | String (max 20, optional) | Add to Appwrite or remove from SSOT |
| waiverBudget | Number (0-1000, optional) | Add to Appwrite or remove from SSOT |
| password | String (max 50, optional) | Add to Appwrite or remove from SSOT |

## Impact on Features:
1. **Commissioner Settings** - Cannot save draft dates
2. **Private Leagues** - Cannot set passwords
3. **Waiver System** - Cannot configure waiver settings
4. **Playoffs** - Cannot configure playoff settings

## Recommended Actions:
1. **Immediate:** Update API endpoints to only use existing fields
2. **Short-term:** Add missing fields to Appwrite collection
3. **Long-term:** Implement automated schema sync from SSOT

## API Files Affected:
- `/app/api/leagues/create/route.ts` - Tries to set draftDate
- `/app/api/leagues/[leagueId]/update-settings/route.ts` - Lists invalid fields
- `/app/api/leagues/[leagueId]/commissioner/route.ts` - References missing fields

## Resolution Status:
- ✅ Removed `draftDate` from update-settings valid fields list
- ⏳ Need to add missing attributes to Appwrite
- ⏳ Need to update SSOT sync scripts
