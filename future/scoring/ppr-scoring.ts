export interface ScoringSettings {
  passing: PassingScoring;
  rushing: RushingScoring;
  receiving: ReceivingScoring;
  kicking: KickingScoring;
  defense: DefenseScoring;
  bonuses: BonusScoring;
  customRules: CustomRule[];
}

export interface PassingScoring {
  yardsPerPoint: number;
  touchdownPoints: number;
  interceptionPoints: number;
  twoPointConversionPoints: number;
  fumbleLostPoints: number;
}

export interface RushingScoring {
  yardsPerPoint: number;
  touchdownPoints: number;
  twoPointConversionPoints: number;
  fumbleLostPoints: number;
}

export interface ReceivingScoring {
  yardsPerPoint: number;
  receptionPoints: number; // PPR
  touchdownPoints: number;
  twoPointConversionPoints: number;
  fumbleLostPoints: number;
}

export interface KickingScoring {
  patMadePoints: number;
  patMissedPoints: number;
  fg0to19Points: number;
  fg20to29Points: number;
  fg30to39Points: number;
  fg40to49Points: number;
  fg50PlusPoints: number;
  fgMissedPoints: number;
}

export interface DefenseScoring {
  sackPoints: number;
  interceptionPoints: number;
  fumbleRecoveryPoints: number;
  touchdownPoints: number;
  safetyPoints: number;
  blockKickPoints: number;
  pointsAllowed: PointsAllowedScoring;
  yardsAllowed: YardsAllowedScoring;
}

export interface PointsAllowedScoring {
  points0: number;
  points1to6: number;
  points7to13: number;
  points14to20: number;
  points21to27: number;
  points28to34: number;
  points35Plus: number;
}

export interface YardsAllowedScoring {
  yardsUnder100: number;
  yards100to199: number;
  yards200to299: number;
  yards300to399: number;
  yards400to499: number;
  yards500Plus: number;
}

export interface BonusScoring {
  passing300YardBonus: number;
  passing400YardBonus: number;
  rushing100YardBonus: number;
  rushing200YardBonus: number;
  receiving100YardBonus: number;
  receiving200YardBonus: number;
}

export interface CustomRule {
  id: string;
  name: string;
  description: string;
  statType: string;
  condition: 'equals' | 'greater_than' | 'less_than' | 'between';
  value: number | [number, number];
  points: number;
  enabled: boolean;
}

export const NFL_PPR_SCORING: ScoringSettings = {
  passing: {
    yardsPerPoint: 25,
    touchdownPoints: 4,
    interceptionPoints: -2,
    twoPointConversionPoints: 2,
    fumbleLostPoints: -2
  },
  rushing: {
    yardsPerPoint: 10,
    touchdownPoints: 6,
    twoPointConversionPoints: 2,
    fumbleLostPoints: -2
  },
  receiving: {
    yardsPerPoint: 10,
    receptionPoints: 1, // Full PPR
    touchdownPoints: 6,
    twoPointConversionPoints: 2,
    fumbleLostPoints: -2
  },
  kicking: {
    patMadePoints: 1,
    patMissedPoints: -1,
    fg0to19Points: 3,
    fg20to29Points: 3,
    fg30to39Points: 3,
    fg40to49Points: 4,
    fg50PlusPoints: 5,
    fgMissedPoints: -1
  },
  defense: {
    sackPoints: 1,
    interceptionPoints: 2,
    fumbleRecoveryPoints: 2,
    touchdownPoints: 6,
    safetyPoints: 2,
    blockKickPoints: 2,
    pointsAllowed: {
      points0: 10,
      points1to6: 7,
      points7to13: 4,
      points14to20: 1,
      points21to27: 0,
      points28to34: -1,
      points35Plus: -4
    },
    yardsAllowed: {
      yardsUnder100: 10,
      yards100to199: 5,
      yards200to299: 2,
      yards300to399: 0,
      yards400to499: -2,
      yards500Plus: -5
    }
  },
  bonuses: {
    passing300YardBonus: 3,
    passing400YardBonus: 5,
    rushing100YardBonus: 3,
    rushing200YardBonus: 5,
    receiving100YardBonus: 3,
    receiving200YardBonus: 5
  },
  customRules: []
};

export class ScoringCalculator {
  constructor(private settings: ScoringSettings) {}

  calculatePlayerScore(playerStats: any): number {
    let totalScore = 0;

    // Passing
    if (playerStats.passing) {
      totalScore += playerStats.passing.yards / this.settings.passing.yardsPerPoint;
      totalScore += playerStats.passing.touchdowns * this.settings.passing.touchdownPoints;
      totalScore += playerStats.passing.interceptions * this.settings.passing.interceptionPoints;
      totalScore += playerStats.passing.twoPointConversions * this.settings.passing.twoPointConversionPoints;
      totalScore += playerStats.passing.fumblesLost * this.settings.passing.fumbleLostPoints;

      // Passing bonuses
      if (playerStats.passing.yards >= 400) {
        totalScore += this.settings.bonuses.passing400YardBonus;
      } else if (playerStats.passing.yards >= 300) {
        totalScore += this.settings.bonuses.passing300YardBonus;
      }
    }

    // Rushing
    if (playerStats.rushing) {
      totalScore += playerStats.rushing.yards / this.settings.rushing.yardsPerPoint;
      totalScore += playerStats.rushing.touchdowns * this.settings.rushing.touchdownPoints;
      totalScore += playerStats.rushing.twoPointConversions * this.settings.rushing.twoPointConversionPoints;
      totalScore += playerStats.rushing.fumblesLost * this.settings.rushing.fumbleLostPoints;

      // Rushing bonuses
      if (playerStats.rushing.yards >= 200) {
        totalScore += this.settings.bonuses.rushing200YardBonus;
      } else if (playerStats.rushing.yards >= 100) {
        totalScore += this.settings.bonuses.rushing100YardBonus;
      }
    }

    // Receiving
    if (playerStats.receiving) {
      totalScore += playerStats.receiving.receptions * this.settings.receiving.receptionPoints;
      totalScore += playerStats.receiving.yards / this.settings.receiving.yardsPerPoint;
      totalScore += playerStats.receiving.touchdowns * this.settings.receiving.touchdownPoints;
      totalScore += playerStats.receiving.twoPointConversions * this.settings.receiving.twoPointConversionPoints;
      totalScore += playerStats.receiving.fumblesLost * this.settings.receiving.fumbleLostPoints;

      // Receiving bonuses
      if (playerStats.receiving.yards >= 200) {
        totalScore += this.settings.bonuses.receiving200YardBonus;
      } else if (playerStats.receiving.yards >= 100) {
        totalScore += this.settings.bonuses.receiving100YardBonus;
      }
    }

    // Apply custom rules
    this.settings.customRules.forEach(rule => {
      if (rule.enabled && this.evaluateCustomRule(rule, playerStats)) {
        totalScore += rule.points;
      }
    });

    return Math.round(totalScore * 100) / 100; // Round to 2 decimal places
  }

  private evaluateCustomRule(rule: CustomRule, playerStats: any): boolean {
    const statValue = this.getStatValue(rule.statType, playerStats);
    
    switch (rule.condition) {
      case 'equals':
        return statValue === rule.value;
      case 'greater_than':
        return statValue > rule.value;
      case 'less_than':
        return statValue < rule.value;
      case 'between':
        const [min, max] = rule.value as [number, number];
        return statValue >= min && statValue <= max;
      default:
        return false;
    }
  }

  private getStatValue(statType: string, playerStats: any): number {
    const keys = statType.split('.');
    let value = playerStats;
    
    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) return 0;
    }
    
    return Number(value) || 0;
  }
}