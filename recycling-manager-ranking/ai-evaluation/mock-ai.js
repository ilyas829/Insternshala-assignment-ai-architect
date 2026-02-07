class MockAIEvaluator {
  constructor() {
    this.evaluationData = {
      crisis_management: {
        strengths: [
          'Quick decision making',
          'Calm under pressure',
          'Problem solving',
          'Leadership experience',
          'Risk management skills'
        ]
      },
      sustainability: {
        knowledge_areas: [
          'Environmental compliance',
          'Waste reduction',
          'Circular economy',
          'Energy efficiency',
          'Carbon footprint management',
          'ISO standards'
        ]
      },
      team_motivation: {
        leadership_qualities: [
          'Empathy',
          'Communication',
          'Delegation',
          'Mentoring ability',
          'Conflict resolution',
          'Team building'
        ]
      }
    };
  }

  async evaluate(candidate, evaluationType) {
    // Simulate async API call
    await new Promise(resolve => setTimeout(resolve, 100));

    const data = this.evaluationData[evaluationType];
    const baseScore = Math.floor(Math.random() * 4) + 6; // 6-9

    // Adjust score based on experience
    const experienceBonus = Math.min(candidate.experience * 0.15, 1.5);
    const finalScore = Math.min(baseScore + experienceBonus, 10);

    const resultKey = Object.keys(data)[0]; // 'strengths', 'knowledge_areas', or 'leadership_qualities'

    return {
      score: parseFloat(finalScore.toFixed(1)),
      [resultKey]: data[resultKey],
      evaluation_type: evaluationType,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = MockAIEvaluator;
