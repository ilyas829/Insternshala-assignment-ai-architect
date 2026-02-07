// generate-candidates.js
(async () => {
    const { faker } = await import('@faker-js/faker');

// Skills database for recycling/production managers
const SKILLS_DATABASE = {
    technical: [
        'Lean Manufacturing', 'Six Sigma', 'ERP Systems', 'Process Optimization',
        'Quality Control', 'Automation', 'PLC Programming', 'Robotics',
        'Maintenance Management', 'Equipment Operation', 'Troubleshooting',
        'Data Analysis', 'Python', 'Statistics', 'Inventory Control',
        'Supply Chain Management', 'Logistics', 'Warehouse Management',
        'Safety Protocols', 'OSHA Compliance', 'ISO 14001', 'ISO 9001'
    ],
    management: [
        'Team Leadership', 'Project Management', 'Strategic Planning',
        'Budget Management', 'Performance Management', 'Conflict Resolution',
        'Training & Development', 'Communication Skills', 'Decision Making',
        'Time Management', 'Resource Allocation', 'Risk Management',
        'Change Management', 'Stakeholder Management', 'Reporting'
    ],
    sustainability: [
        'Environmental Compliance', 'Waste Reduction', 'Circular Economy',
        'Sustainability Reporting', 'Energy Efficiency', 'Carbon Footprint',
        'Recycling Technologies', 'Green Manufacturing', 'Life Cycle Assessment',
        'Environmental Auditing', 'Regulatory Compliance', 'Renewable Energy'
    ],
    softSkills: [
        'Problem Solving', 'Critical Thinking', 'Adaptability', 'Creativity',
        'Attention to Detail', 'Multitasking', 'Negotiation', 'Team Building',
        'Mentoring', 'Presentation Skills', 'Customer Service', 'Cross-functional Collaboration'
    ]
};

// Industries for experience
const INDUSTRIES = [
    'Waste Management', 'Recycling', 'Manufacturing', 'Logistics',
    'Environmental Services', 'Chemical Processing', 'Plastics',
    'Paper & Pulp', 'Metals', 'Electronics Recycling', 'Automotive',
    'Food Processing', 'Pharmaceutical', 'Textile', 'Construction'
];

// Education levels
const EDUCATION = [
    'High School Diploma', 'Associate Degree', 'Bachelor\'s Degree',
    'Master\'s Degree', 'MBA', 'PhD'
];

// Certifications
const CERTIFICATIONS = [
    'Six Sigma Green Belt', 'Six Sigma Black Belt', 'PMP', 'LEED Green Associate',
    'ISO 14001 Lead Auditor', 'OSHA 30-hour', 'Certified Recycling Professional',
    'Professional Engineer (PE)', 'Certified Manager (CM)', 'Certified Safety Professional'
];

function generateRandomSkills() {
    const skills = [];
    const skillCount = faker.number.int({ min: 5, max: 10 });
    
    // Ensure at least one skill from each category
    skills.push(faker.helpers.arrayElement(SKILLS_DATABASE.technical));
    skills.push(faker.helpers.arrayElement(SKILLS_DATABASE.management));
    skills.push(faker.helpers.arrayElement(SKILLS_DATABASE.sustainability));
    skills.push(faker.helpers.arrayElement(SKILLS_DATABASE.softSkills));
    
    // Add remaining random skills
    const allSkills = [
        ...SKILLS_DATABASE.technical,
        ...SKILLS_DATABASE.management,
        ...SKILLS_DATABASE.sustainability,
        ...SKILLS_DATABASE.softSkills
    ];
    
    while (skills.length < skillCount) {
        const skill = faker.helpers.arrayElement(allSkills);
        if (!skills.includes(skill)) {
            skills.push(skill);
        }
    }
    
    return skills.join(', ');
}

function generateCandidate(id) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const experience = faker.number.int({ min: 3, max: 25 });
    const age = experience + 22; // Start career around age 22
    
    // Generate industries experience
    const industries = faker.helpers.arrayElements(INDUSTRIES, faker.number.int({ min: 1, max: 4 }));
    const industryExperience = {};
    industries.forEach(industry => {
        industryExperience[industry] = faker.number.int({ min: 1, max: experience });
    });
    
    return {
        id: id,
        name: `${firstName} ${lastName}`,
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        phone: faker.phone.number(),
        age: age,
        location: `${faker.location.city()}, ${faker.location.state({ abbreviated: true })}`,
        experience: experience,
        skills: generateRandomSkills(),
        education: faker.helpers.arrayElement(EDUCATION),
        certifications: faker.helpers.arrayElements(CERTIFICATIONS, faker.number.int({ min: 0, max: 3 })),
        industries: industries,
        industry_experience: industryExperience,
        languages: faker.helpers.arrayElements(['English', 'Spanish', 'French', 'German', 'Mandarin'], 
                    faker.number.int({ min: 1, max: 3 })),
        salary_expectation: `$${faker.number.int({ min: 65000, max: 145000 })}`,
        availability: faker.helpers.arrayElement(['Immediate', '2 weeks', '1 month', '3 months']),
        current_role: `${faker.person.jobTitle()} at ${faker.company.name()}`,
        achievements: [
            `Reduced waste by ${faker.number.int({ min: 10, max: 40 })}% in previous role`,
            `Improved team productivity by ${faker.number.int({ min: 15, max: 35 })}%`,
            `Implemented cost-saving measures saving $${faker.number.int({ min: 50000, max: 250000 })} annually`
        ],
        // For SQLite insertion (simplified version)
        sql_insert: {
            name: `${firstName} ${lastName}`,
            experience: experience,
            skills: generateRandomSkills()
        }
    };
}

function generateEvaluationScores(candidate) {
    // Base scores based on experience
    const baseCrisis = Math.min(5 + (candidate.experience * 0.2), 9.5);
    const baseSustainability = Math.min(5 + (candidate.experience * 0.18), 9.3);
    const baseTeam = Math.min(5 + (candidate.experience * 0.22), 9.7);
    
    // Add variation
    return {
        crisis_management_score: faker.number.float({
            min: Math.max(baseCrisis - 1.5, 4),
            max: Math.min(baseCrisis + 1.5, 10),
            precision: 0.1
        }),
        sustainability_score: faker.number.float({
            min: Math.max(baseSustainability - 1.5, 4),
            max: Math.min(baseSustainability + 1.5, 10),
            precision: 0.1
        }),
        team_motivation_score: faker.number.float({
            min: Math.max(baseTeam - 1.5, 4),
            max: Math.min(baseTeam + 1.5, 10),
            precision: 0.1
        })
    };
}

function generateSQLInsertStatements(candidates) {
    let sql = "-- Generated by Faker.js Candidate Generator\n\n";
    
    // Candidates SQL
    sql += "-- INSERT INTO candidates (name, experience, skills)\n";
    sql += "INSERT INTO candidates (name, experience, skills) VALUES\n";
    
    const candidateValues = candidates.map(c => 
        `  ('${c.sql_insert.name.replace(/'/g, "''")}', ${c.sql_insert.experience}, '${c.sql_insert.skills.replace(/'/g, "''")}')`
    ).join(',\n');
    
    sql += candidateValues + ";\n\n";
    
    // Evaluations SQL
    sql += "-- INSERT INTO evaluations (candidate_id, crisis_management_score, sustainability_score, team_motivation_score)\n";
    sql += "INSERT INTO evaluations (candidate_id, crisis_management_score, sustainability_score, team_motivation_score) VALUES\n";
    
    const evaluationValues = candidates.map((c, index) => {
        const scores = generateEvaluationScores(c);
        return `  (${index + 1}, ${scores.crisis_management_score.toFixed(1)}, ${scores.sustainability_score.toFixed(1)}, ${scores.team_motivation_score.toFixed(1)})`;
    }).join(',\n');
    
    sql += evaluationValues + ";\n";
    
    return sql;
}

// Generate 40 candidates
const candidates = Array.from({ length: 40 }, (_, i) => generateCandidate(i + 1));

// Output JSON file
const fs = require('fs');
const path = require('path');

const outputDir = './output';
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Save as JSON
fs.writeFileSync(
    path.join(outputDir, 'candidates.json'),
    JSON.stringify(candidates, null, 2),
    'utf-8'
);

// Generate SQL for database insertion
const sqlContent = generateSQLInsertStatements(candidates);
fs.writeFileSync(
    path.join(outputDir, 'candidates_data.sql'),
    sqlContent,
    'utf-8'
);

console.log('✅ 40 candidates generated successfully!');
console.log('📁 Files saved in:', outputDir);
console.log('   - candidates.json (full details)');
console.log('   - candidates_data.sql (SQL insert statements)');
console.log('\n📊 Sample candidate:');
console.log(JSON.stringify(candidates[0], null, 2));

// Display summary statistics
console.log('\n📈 Generation Statistics:');
console.log('Total candidates:', candidates.length);
console.log('Average experience:', (candidates.reduce((sum, c) => sum + c.experience, 0) / candidates.length).toFixed(1), 'years');
console.log('Most common skills:', 
    candidates.flatMap(c => c.skills.split(', '))
        .reduce((acc, skill) => {
            acc[skill] = (acc[skill] || 0) + 1;
            return acc;
        }, {})
);

})();