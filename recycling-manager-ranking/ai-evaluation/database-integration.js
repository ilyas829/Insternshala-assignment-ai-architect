// database-integration.js - Save AI evaluations to database

const sqlite3 = require('sqlite3').verbose();
const MockAIEvaluator = require('./mock-ai.js');

class DatabaseIntegration {
  constructor(dbPath = './database.sqlite') {
    this.db = new sqlite3.Database(dbPath);
    this.aiEvaluator = new MockAIEvaluator();
  }

  /**
   * Initialize database schema
   */
  initializeDatabase() {
    return new Promise((resolve, reject) => {
      const schema = `
        CREATE TABLE IF NOT EXISTS candidates (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          experience INTEGER NOT NULL,
          skills TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS evaluations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          candidate_id INTEGER NOT NULL,
          crisis_management_score REAL CHECK (crisis_management_score >= 0 AND crisis_management_score <= 10),
          sustainability_score REAL CHECK (sustainability_score >= 0 AND sustainability_score <= 10),
          team_motivation_score REAL CHECK (team_motivation_score >= 0 AND team_motivation_score <= 10),
          evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS rankings (
          candidate_id INTEGER PRIMARY KEY,
          total_score REAL,
          rank_position INTEGER,
          last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_candidates_name ON candidates(name);
        CREATE INDEX IF NOT EXISTS idx_evaluations_scores ON evaluations(crisis_management_score, sustainability_score, team_motivation_score);
        CREATE INDEX IF NOT EXISTS idx_rankings_score ON rankings(total_score DESC);
      `;

      this.db.exec(schema, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('✅ Database schema initialized');
          resolve();
        }
      });
    });
  }

  /**
   * Load sample data if no candidates exist
   */
  loadSampleData() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT COUNT(*) as count FROM candidates', (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        if (rows[0].count === 0) {
          console.log('Loading sample candidate data...');
          const sampleData = `
            INSERT INTO candidates (name, experience, skills) VALUES
            ('Alex Chen', 8, 'Lean Manufacturing, Six Sigma, ERP Systems'),
            ('Maria Rodriguez', 12, 'Team Leadership, Process Optimization, ISO 14001'),
            ('James Wilson', 5, 'Data Analysis, Automation, Python'),
            ('Sarah Johnson', 15, 'Strategic Planning, Budget Management, Compliance'),
            ('Robert Kim', 7, 'Quality Control, Supply Chain, Spanish'),
            ('Lisa Wang', 9, 'Project Management, Sustainability Reporting'),
            ('David Miller', 11, 'Crisis Management, OSHA, Training'),
            ('Emma Thompson', 6, 'Inventory Control, Safety Protocols'),
            ('Michael Brown', 14, 'Operations Management, Lean Six Sigma'),
            ('Jennifer Lee', 8, 'ERP Systems, Team Training, Auditing'),
            ('Carlos Garcia', 10, 'Spanish, Process Improvement, Logistics'),
            ('Amanda White', 7, 'Quality Assurance, Compliance, Documentation'),
            ('Thomas Clark', 13, 'Maintenance Management, Robotics, PLC'),
            ('Olivia Martin', 5, 'Data Visualization, Python, Statistics'),
            ('William Taylor', 9, 'Supply Chain, German, Negotiation'),
            ('Sophia Anderson', 11, 'Environmental Science, Auditing, Reporting'),
            ('Daniel Moore', 8, 'Equipment Maintenance, Safety, Repair'),
            ('Isabella Jackson', 6, 'Communication, Waste Reduction, Training'),
            ('Matthew Harris', 12, 'Budgeting, Team Building, Scheduling'),
            ('Emily Lewis', 7, 'Reporting, MS Office, Data Entry'),
            ('Christopher Walker', 10, 'Logistics, Planning, Coordination'),
            ('Abigail Hall', 8, 'Training, Documentation, SOPs'),
            ('Joshua Allen', 9, 'Automation, PLC Programming, Robotics'),
            ('Mia Young', 6, 'Quality Control, Statistics, Testing'),
            ('Andrew King', 13, 'Strategic Planning, Leadership, Decision Making'),
            ('Charlotte Wright', 8, 'Process Mapping, Optimization, Lean'),
            ('Ethan Scott', 7, 'Troubleshooting, Repair, Maintenance'),
            ('Harper Green', 10, 'Sustainability, Recycling Tech, Innovation'),
            ('Benjamin Adams', 11, 'Crisis Response, Safety, Emergency Planning'),
            ('Victoria Nelson', 9, 'Team Management, Scheduling, Performance'),
            ('Samuel Carter', 8, 'Inventory, Warehouse, Logistics'),
            ('Grace Mitchell', 6, 'Data Entry, Reporting, Analysis'),
            ('Jackson Perez', 12, 'Operations, Supervision, Leadership'),
            ('Lily Roberts', 7, 'Communication, Conflict Resolution, Mediation'),
            ('Aiden Turner', 8, 'Equipment Operation, Maintenance, Safety'),
            ('Chloe Phillips', 10, 'Compliance, Regulations, Legal'),
            ('Lucas Campbell', 9, 'Project Coordination, Planning, Execution'),
            ('Zoe Parker', 6, 'Quality Inspection, Testing, Standards'),
            ('Caleb Evans', 11, 'Production Planning, ERP, MRP'),
            ('Hannah Edwards', 8, 'Team Leadership, Training, Development');
          `;

          this.db.exec(sampleData, (err) => {
            if (err) {
              reject(err);
            } else {
              console.log('✅ Sample data loaded');
              resolve();
            }
          });
        } else {
          console.log(`ℹ️  Database already has ${rows[0].count} candidates`);
          resolve();
        }
      });
    });
  }

  /**
   * Evaluate all unevaluated candidates
   */
  async evaluateAllCandidates() {
    return new Promise((resolve, reject) => {
      // Get candidates without evaluations
      this.db.all(`
        SELECT c.* 
        FROM candidates c
        LEFT JOIN evaluations e ON c.id = e.candidate_id
        WHERE e.id IS NULL
      `, async (err, candidates) => {
        if (err) {
          reject(err);
          return;
        }

        console.log(`Evaluating ${candidates.length} candidates...`);
        
        for (const candidate of candidates) {
          await this.evaluateCandidate(candidate);
          // Delay to avoid rate limiting (for mock, not needed)
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        resolve(candidates.length);
      });
    });
  }

  /**
   * Evaluate single candidate and save to database
   */
  async evaluateCandidate(candidate) {
    try {
      console.log(`Evaluating ${candidate.name}...`);
      
      // Get all three evaluations
      const [crisis, sustainability, team] = await Promise.all([
        this.aiEvaluator.evaluate(candidate, 'crisis_management'),
        this.aiEvaluator.evaluate(candidate, 'sustainability'),
        this.aiEvaluator.evaluate(candidate, 'team_motivation')
      ]);
      
      // Calculate total score
      const totalScore = (
        crisis.score * 0.4 +
        sustainability.score * 0.35 +
        team.score * 0.25
      ).toFixed(2);
      
      // Save to evaluations table
      await this.saveEvaluation(candidate.id, crisis, sustainability, team, totalScore);
      
      console.log(`✅ ${candidate.name}: ${totalScore}/10`);
      
      return {
        candidate_id: candidate.id,
        scores: {
          crisis: crisis.score,
          sustainability: sustainability.score,
          team: team.score,
          total: totalScore
        }
      };
      
    } catch (error) {
      console.error(`Failed to evaluate ${candidate.name}:`, error);
      throw error;
    }
  }

  /**
   * Save evaluation to database
   */
  saveEvaluation(candidateId, crisisResult, sustainabilityResult, teamResult, totalScore) {
    return new Promise((resolve, reject) => {
      this.db.run(`
        INSERT INTO evaluations 
        (candidate_id, crisis_management_score, sustainability_score, team_motivation_score)
        VALUES (?, ?, ?, ?)
      `, [
        candidateId,
        crisisResult.score,
        sustainabilityResult.score,
        teamResult.score
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  /**
   * Close database connection
   */
  close() {
    this.db.close();
  }
}

// Run if called directly
if (require.main === module) {
  const integrator = new DatabaseIntegration();
  
  integrator.initializeDatabase()
    .then(() => integrator.loadSampleData())
    .then(() => integrator.evaluateAllCandidates())
    .then(count => {
      console.log(`\n🎉 Successfully evaluated ${count} candidates!`);
      console.log('\n📊 Top 5 Candidates:');
      
      // Display top 5
      integrator.db.all(`
        SELECT c.name, c.experience, 
               ROUND((e.crisis_management_score * 0.4 + 
                      e.sustainability_score * 0.35 + 
                      e.team_motivation_score * 0.25), 2) as total_score
        FROM candidates c
        JOIN evaluations e ON c.id = e.candidate_id
        ORDER BY total_score DESC
        LIMIT 5
      `, (err, rows) => {
        if (err) {
          console.error(err);
        } else {
          rows.forEach((row, index) => {
            console.log(`#${index + 1}: ${row.name} - ${row.total_score}/10 (${row.experience}y)`);
          });
        }
        integrator.close();
      });
    })
    .catch(error => {
      console.error('Error:', error);
      integrator.close();
    });
}

module.exports = DatabaseIntegration;