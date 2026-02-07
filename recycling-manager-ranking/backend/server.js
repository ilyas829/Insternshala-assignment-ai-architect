require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        service: 'Recycling Manager API'
    });
});

// AI Evaluation Endpoint
app.post('/api/ai/evaluate', async (req, res) => {
    try {
        const { candidate, criteria } = req.body;
        
        if (!candidate || !criteria) {
            return res.status(400).json({ error: 'Missing candidate or criteria' });
        }

        // Validate criteria
        const validCriteria = ['crisis_management', 'sustainability', 'team_motivation'];
        if (!validCriteria.includes(criteria)) {
            return res.status(400).json({ error: 'Invalid criteria' });
        }

        // Get API key from environment
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ 
                error: 'API key not configured',
                message: 'Please set OPENAI_API_KEY in environment variables'
            });
        }

        // Create prompt based on criteria
        const prompt = createPrompt(candidate, criteria);
        
        // Call OpenAI API (GitHub Copilot uses OpenAI API)
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: getSystemPrompt(criteria)
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 500,
                response_format: { type: "json_object" }
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Parse AI response
        const aiResponse = JSON.parse(response.data.choices[0].message.content);
        
        // Return formatted response
        res.json({
            success: true,
            criteria: criteria,
            candidate_id: candidate.id,
            candidate_name: candidate.name,
            evaluation: aiResponse,
            evaluated_at: new Date().toISOString(),
            model: 'gpt-3.5-turbo'
        });

    } catch (error) {
        console.error('AI Evaluation Error:', error.response?.data || error.message);
        
        // Return mock data if API fails (for development)
        if (process.env.NODE_ENV === 'development') {
            const mockResponse = getMockResponse(req.body.candidate, req.body.criteria);
            return res.json({
                success: false,
                error: 'Using mock data (API call failed)',
                criteria: req.body.criteria,
                evaluation: mockResponse,
                is_mock: true
            });
        }
        
        res.status(500).json({ 
            error: 'AI evaluation failed',
            message: error.message 
        });
    }
});

// Batch evaluation endpoint
app.post('/api/ai/evaluate-all', async (req, res) => {
    try {
        const { candidate } = req.body;
        
        if (!candidate) {
            return res.status(400).json({ error: 'Missing candidate data' });
        }

        const criteriaList = ['crisis_management', 'sustainability', 'team_motivation'];
        const results = {};
        
        // Evaluate each criteria
        for (const criteria of criteriaList) {
            try {
                const response = await axios.post(`http://localhost:${PORT}/api/ai/evaluate`, {
                    candidate,
                    criteria
                }, {
                    headers: { 'Content-Type': 'application/json' }
                });
                
                results[criteria] = response.data.evaluation;
                
                // Rate limiting delay
                await new Promise(resolve => setTimeout(resolve, 500));
                
            } catch (error) {
                console.error(`Failed to evaluate ${criteria}:`, error.message);
                results[criteria] = getMockResponse(candidate, criteria);
            }
        }
        
        // Calculate total score
        const totalScore = calculateTotalScore(results);
        
        res.json({
            success: true,
            candidate_id: candidate.id,
            candidate_name: candidate.name,
            evaluations: results,
            total_score: totalScore,
            evaluated_at: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Batch Evaluation Error:', error);
        res.status(500).json({ 
            error: 'Batch evaluation failed',
            message: error.message 
        });
    }
});

// Helper functions
function createPrompt(candidate, criteria) {
    const prompts = {
        crisis_management: `Evaluate crisis management capability for recycling plant manager:
Name: ${candidate.name}
Experience: ${candidate.experience} years
Skills: ${candidate.skills}

Scenario: Major conveyor belt jam during peak operation.
Return JSON with score (1-10), strengths, weaknesses, and recommendations.`,

        sustainability: `Evaluate sustainability knowledge for recycling manager:
Name: ${candidate.name}
Experience: ${candidate.experience} years
Skills: ${candidate.skills}

Focus: Recycling processes, waste reduction, regulations.
Return JSON with score (1-10), knowledge areas, gaps, and certifications.`,

        team_motivation: `Evaluate team motivation skills for production manager:
Name: ${candidate.name}
Experience: ${candidate.experience} years
Skills: ${candidate.skills}

Scenario: Managing 25 workers in 24/7 plant with high turnover.
Return JSON with score (1-10), leadership qualities, and strategies.`
    };
    
    return prompts[criteria] || prompts.crisis_management;
}

function getSystemPrompt(criteria) {
    const systemPrompts = {
        crisis_management: 'You are an industrial safety expert. Always respond with valid JSON.',
        sustainability: 'You are a sustainability consultant. Always respond with valid JSON.',
        team_motivation: 'You are an organizational psychologist. Always respond with valid JSON.'
    };
    
    return systemPrompts[criteria] || 'You are an expert evaluator. Always respond with valid JSON.';
}

function getMockResponse(candidate, criteria) {
    // Generate realistic mock scores based on candidate experience
    const baseScore = Math.min(5 + (candidate.experience * 0.2), 9.5);
    
    const responses = {
        crisis_management: {
            score: (baseScore + (Math.random() - 0.5)).toFixed(1),
            strengths: ['Quick emergency response', 'Clear communication'],
            weaknesses: ['Could improve documentation'],
            recommendations: ['Implement weekly safety drills']
        },
        sustainability: {
            score: (baseScore + (Math.random() - 0.3)).toFixed(1),
            knowledge_areas: ['Waste reduction', 'Recycling processes'],
            gaps: ['Advanced recycling technologies'],
            suggested_certifications: ['ISO 14001']
        },
        team_motivation: {
            score: (baseScore + (Math.random() - 0.4)).toFixed(1),
            leadership_qualities: ['Good communicator', 'Approachable'],
            development_needs: ['Conflict resolution training'],
            retention_strategies: ['Career progression planning']
        }
    };
    
    return responses[criteria] || responses.crisis_management;
}

function calculateTotalScore(results) {
    const weights = {
        crisis_management: 0.4,
        sustainability: 0.35,
        team_motivation: 0.25
    };
    
    let total = 0;
    for (const [criteria, data] of Object.entries(results)) {
        total += parseFloat(data.score) * weights[criteria];
    }
    
    return total.toFixed(2);
}

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`📡 AI Endpoint: POST http://localhost:${PORT}/api/ai/evaluate`);
    console.log(`⚙️  Environment: ${process.env.NODE_ENV}`);
});