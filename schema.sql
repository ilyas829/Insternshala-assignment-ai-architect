-- Recycling Manager Ranking System - SQLite Schema
-- SQLite doesn't support all MySQL features, so we need to adapt

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS rankings;
DROP TABLE IF EXISTS evaluations;
DROP TABLE IF EXISTS candidates;

-- 1. Candidates Table (Exactly as required)
CREATE TABLE candidates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    experience INTEGER NOT NULL,
    skills TEXT NOT NULL
);

-- 2. Evaluations Table (Exactly as required)
CREATE TABLE evaluations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_id INTEGER NOT NULL,
    crisis_management_score REAL CHECK (crisis_management_score >= 0 AND crisis_management_score <= 10),
    sustainability_score REAL CHECK (sustainability_score >= 0 AND sustainability_score <= 10),
    team_motivation_score REAL CHECK (team_motivation_score >= 0 AND team_motivation_score <= 10),
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
);

-- 3. Rankings Table (Will be auto-updated via triggers)
CREATE TABLE rankings (
    candidate_id INTEGER PRIMARY KEY,
    total_score REAL,
    rank_position INTEGER,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_candidates_name ON candidates(name);
CREATE INDEX idx_evaluations_scores ON evaluations(crisis_management_score, sustainability_score, team_motivation_score);
CREATE INDEX idx_rankings_score ON rankings(total_score DESC);

-- Create a view for easy ranking queries (SQLite alternative to generated columns)
CREATE VIEW candidate_rankings AS
SELECT 
    c.id,
    c.name,
    c.experience,
    c.skills,
    e.crisis_management_score,
    e.sustainability_score,
    e.team_motivation_score,
    ROUND((
        COALESCE(e.crisis_management_score, 0) * 0.4 + 
        COALESCE(e.sustainability_score, 0) * 0.35 + 
        COALESCE(e.team_motivation_score, 0) * 0.25
    ), 2) as total_score,
    r.rank_position,
    e.evaluated_at
FROM candidates c
LEFT JOIN evaluations e ON c.id = e.candidate_id
LEFT JOIN rankings r ON c.id = r.candidate_id;

-- Trigger to update rankings when evaluations are inserted/updated
-- SQLite doesn't support complex triggers like MySQL, so we create a simpler version
CREATE TRIGGER update_rankings_after_eval 
AFTER INSERT ON evaluations
BEGIN
    -- Update or insert ranking with calculated total score
    INSERT OR REPLACE INTO rankings (candidate_id, total_score)
    VALUES (
        NEW.candidate_id,
        ROUND((
            NEW.crisis_management_score * 0.4 + 
            NEW.sustainability_score * 0.35 + 
            NEW.team_motivation_score * 0.25
        ), 2)
    );
    
    -- Update all ranks based on total score
    UPDATE rankings
    SET rank_position = (
        SELECT COUNT(*) + 1 
        FROM rankings r2 
        WHERE r2.total_score > rankings.total_score
    );
END;

-- Another trigger for when evaluations are updated
CREATE TRIGGER update_rankings_after_update 
AFTER UPDATE ON evaluations
BEGIN
    -- Update ranking with new calculated total score
    UPDATE rankings 
    SET total_score = ROUND((
            NEW.crisis_management_score * 0.4 + 
            NEW.sustainability_score * 0.35 + 
            NEW.team_motivation_score * 0.25
        ), 2),
        last_updated = CURRENT_TIMESTAMP
    WHERE candidate_id = NEW.candidate_id;
    
    -- Recalculate all ranks
    UPDATE rankings
    SET rank_position = (
        SELECT COUNT(*) + 1 
        FROM rankings r2 
        WHERE r2.total_score > rankings.total_score
    );
END;