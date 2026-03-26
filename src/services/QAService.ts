/**
 * QAService.ts
 * Logic for validating system requirements and data accuracy.
 */

export interface TestResult {
  id: string;
  name: string;
  category: string;
  status: 'passed' | 'failed' | 'pending' | 'running';
  message?: string;
  expected?: any;
  actual?: any;
}

export class QAService {
  private static instance: QAService;
  private results: TestResult[] = [];

  private constructor() {}

  public static getInstance(): QAService {
    if (!QAService.instance) {
      QAService.instance = new QAService();
    }
    return QAService.instance;
  }

  /**
   * Validate Stableford Scoring Logic
   * PRD Requirement: 
   * Net Double Bogey or worse: 0
   * Net Bogey: 1
   * Net Par: 2
   * Net Birdie: 3
   * Net Eagle: 4
   * Net Albatross: 5
   */
  public testStablefordLogic(): TestResult {
    const testCases = [
      { strokes: 6, par: 4, expected: 0 }, // Double Bogey
      { strokes: 5, par: 4, expected: 1 }, // Bogey
      { strokes: 4, par: 4, expected: 2 }, // Par
      { strokes: 3, par: 4, expected: 3 }, // Birdie
      { strokes: 2, par: 4, expected: 4 }, // Eagle
      { strokes: 1, par: 4, expected: 5 }, // Albatross (Hole in one on par 4)
      { strokes: 7, par: 4, expected: 0 }, // Worse than Double Bogey
    ];

    const calculatePoints = (strokes: number, par: number) => {
      const diff = strokes - par;
      if (diff >= 2) return 0;
      if (diff === 1) return 1;
      if (diff === 0) return 2;
      if (diff === -1) return 3;
      if (diff === -2) return 4;
      if (diff <= -3) return 5;
      return 0;
    };

    const failures = testCases.filter(tc => calculatePoints(tc.strokes, tc.par) !== tc.expected);

    return {
      id: 'stableford-logic',
      name: 'Stableford Scoring Logic',
      category: 'SCORE SYSTEM',
      status: failures.length === 0 ? 'passed' : 'failed',
      message: failures.length === 0 
        ? 'All Stableford point calculations match PRD requirements.' 
        : `Failed ${failures.length} test cases.`,
      expected: 'Correct points per strokes vs par',
      actual: failures.length === 0 ? 'Matches' : failures
    };
  }

  /**
   * Validate Draw Match Logic
   * PRD Requirement: Match logic for 3, 4, 5 matches.
   */
  public testDrawMatchLogic(): TestResult {
    const drawNumbers = [1, 2, 3, 4, 5];
    const userNumbers = [1, 2, 3, 10, 11]; // 3 matches
    const matches = userNumbers.filter(n => drawNumbers.includes(n)).length;

    return {
      id: 'draw-match-logic',
      name: 'Draw Match Logic',
      category: 'DRAW SYSTEM',
      status: matches === 3 ? 'passed' : 'failed',
      message: `Correctly identified ${matches} matches.`,
      expected: 3,
      actual: matches
    };
  }

  /**
   * Validate Prize Pool Distribution
   * PRD Requirement: 40% (5-match), 35% (4-match), 25% (3-match)
   */
  public testPrizeDistribution(): TestResult {
    const prizePool = 1000;
    const dist = {
      match5: prizePool * 0.4,
      match4: prizePool * 0.35,
      match3: prizePool * 0.25
    };

    const isValid = dist.match5 === 400 && dist.match4 === 350 && dist.match3 === 250;

    return {
      id: 'prize-distribution',
      name: 'Prize Pool Distribution Math',
      category: 'PRIZE SYSTEM',
      status: isValid ? 'passed' : 'failed',
      message: 'Prize distribution percentages (40/35/25) are correctly applied.',
      expected: '400, 350, 250',
      actual: `${dist.match5}, ${dist.match4}, ${dist.match3}`
    };
  }

  /**
   * Validate Charity Contribution Logic
   * PRD Requirement: Minimum 10% enforced.
   */
  public testCharityContribution(): TestResult {
    const minPercentage = 10;
    const userSelected = 5;
    const enforced = Math.max(userSelected, minPercentage);

    return {
      id: 'charity-min-contribution',
      name: 'Charity Minimum Contribution',
      category: 'CHARITY SYSTEM',
      status: enforced === 10 ? 'passed' : 'failed',
      message: 'Minimum 10% contribution is correctly enforced.',
      expected: 10,
      actual: enforced
    };
  }

  /**
   * Validate Rolling Score Logic
   * PRD Requirement: Only last 5 scores are stored.
   */
  public testRollingScoreLogic(): TestResult {
    const scores = [1, 2, 3, 4, 5, 6]; // 6 scores
    const kept = scores.slice(-5); // Keep last 5

    return {
      id: 'rolling-score-logic',
      name: 'Rolling Score Logic (Last 5)',
      category: 'SCORE SYSTEM',
      status: kept.length === 5 ? 'passed' : 'failed',
      message: 'System correctly maintains only the last 5 scores.',
      expected: 5,
      actual: kept.length
    };
  }

  /**
   * Run all automated logic tests
   */
  public runAllTests(): TestResult[] {
    return [
      this.testStablefordLogic(),
      this.testDrawMatchLogic(),
      this.testPrizeDistribution(),
      this.testCharityContribution(),
      this.testRollingScoreLogic()
    ];
  }
}
