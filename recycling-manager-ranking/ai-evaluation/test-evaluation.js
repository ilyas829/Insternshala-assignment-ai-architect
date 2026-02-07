// test-evaluation.js - Test both mock and real AI

const MockAIEvaluator = require('./mock-ai.js');
// For real API: const RealAIEvaluator = require('./real-api.js');

async function testEvaluation() {
  console.log('🧪 Testing AI Evaluation System\n');
  
  // Create mock AI evaluator
  const mockAI = new MockAIEvaluator();
  
  // Sample candidate from our generator
  const candidate = {
    id: 1,
    name: "Alex Chen",
    experience: 8,
    skills: "Lean Manufacturing, Six Sigma, ERP Systems, Team Leadership",
    industry: "Manufacturing",
    education: "Master's Degree",
    management_experience: 4
  };
  
  console.log('📋 Candidate Profile:');
  console.log(`Name: ${candidate.name}`);
  console.log(`Experience: ${candidate.experience} years`);
  console.log(`Skills: ${candidate.skills}`);
  console.log('---\n');
  
  // Test crisis management
  console.log('🚨 Testing Crisis Management Evaluation...');
  const crisisResult = await mockAI.evaluate(candidate, 'crisis_management');
  console.log(`Score: ${crisisResult.score}/10`);
  console.log('Strengths:', crisisResult.strengths.join(', '));
  console.log('---\n');
  
  // Test sustainability
  console.log('🌱 Testing Sustainability Evaluation...');
  const sustainabilityResult = await mockAI.evaluate(candidate, 'sustainability');
  console.log(`Score: ${sustainabilityResult.score}/10`);
  console.log('Knowledge Areas:', sustainabilityResult.knowledge_areas.join(', '));
  console.log('---\n');
  
  // Test team motivation
  console.log('👥 Testing Team Motivation Evaluation...');
  const teamResult = await mockAI.evaluate(candidate, 'team_motivation');
  console.log(`Score: ${teamResult.score}/10`);
  console.log('Leadership Qualities:', teamResult.leadership_qualities.join(', '));
  console.log('---\n');
  
  // Calculate total score (weighted)
  const totalScore = (
    crisisResult.score * 0.4 +
    sustainabilityResult.score * 0.35 +
    teamResult.score * 0.25
  ).toFixed(2);
  
  console.log('🎯 Overall Weighted Score:');
  console.log(`Crisis Management (40%): ${crisisResult.score}`);
  console.log(`Sustainability (35%): ${sustainabilityResult.score}`);
  console.log(`Team Motivation (25%): ${teamResult.score}`);
  console.log(`Total: ${totalScore}/10`);
  console.log(`Grade: ${totalScore >= 8 ? 'Excellent' : totalScore >= 7 ? 'Good' : 'Needs Improvement'}`);
  
  // Save results to file
  const fs = require('fs');
  const results = {
    candidate,
    evaluations: {
      crisis_management: crisisResult,
      sustainability: sustainabilityResult,
      team_motivation: teamResult
    },
    total_score: parseFloat(totalScore),
    evaluated_at: new Date().toISOString()
  };
  
  fs.writeFileSync(
    'test-results.json',
    JSON.stringify(results, null, 2)
  );
  
  console.log('\n✅ Test completed. Results saved to test-results.json');
}

// Run test
testEvaluation().catch(console.error);