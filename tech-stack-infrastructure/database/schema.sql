-- College Football Fantasy Database Schema
-- Postgres 15+ with partitioning for game_events

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- Enum types
CREATE TYPE user_role AS ENUM ('user', 'commissioner', 'admin');
CREATE TYPE draft_type AS ENUM ('snake', 'auction');
CREATE TYPE draft_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE transaction_type AS ENUM ('add', 'drop', 'trade', 'draft');
CREATE TYPE game_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'postponed');
CREATE TYPE injury_status AS ENUM ('healthy', 'questionable', 'doubtful', 'out', 'injured_reserve');

-- Teams table
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id VARCHAR(50) UNIQUE NOT NULL, -- From data provider
    name VARCHAR(100) NOT NULL,
    abbreviation VARCHAR(10) NOT NULL,
    conference VARCHAR(50) NOT NULL,
    division VARCHAR(50),
    logo_url VARCHAR(255),
    primary_color VARCHAR(7),
    secondary_color VARCHAR(7),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_teams_conference ON teams(conference);

-- Players table
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id VARCHAR(50) UNIQUE NOT NULL,
    team_id UUID REFERENCES teams(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    position VARCHAR(10) NOT NULL,
    jersey_number VARCHAR(3),
    height_inches INTEGER,
    weight_lbs INTEGER,
    year_class VARCHAR(20), -- Freshman, Sophomore, etc.
    injury_status injury_status DEFAULT 'healthy',
    injury_description TEXT,
    photo_url VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_players_team ON players(team_id);
CREATE INDEX idx_players_position ON players(position);
CREATE INDEX idx_players_name ON players USING gin ((first_name || ' ' || last_name) gin_trgm_ops);

-- Games table
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id VARCHAR(50) UNIQUE NOT NULL,
    home_team_id UUID REFERENCES teams(id),
    away_team_id UUID REFERENCES teams(id),
    season INTEGER NOT NULL,
    week INTEGER NOT NULL,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_start_time TIMESTAMP WITH TIME ZONE,
    status game_status DEFAULT 'scheduled',
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    venue VARCHAR(200),
    weather_conditions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_games_season_week ON games(season, week);
CREATE INDEX idx_games_teams ON games(home_team_id, away_team_id);
CREATE INDEX idx_games_scheduled ON games(scheduled_time);

-- Game events table (partitioned by week)
CREATE TABLE game_events (
    id UUID DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES games(id),
    event_type VARCHAR(50) NOT NULL, -- pass, run, kick, etc.
    quarter INTEGER NOT NULL,
    time_remaining VARCHAR(10),
    player_id UUID REFERENCES players(id),
    team_id UUID REFERENCES teams(id),
    event_data JSONB NOT NULL, -- Flexible schema for different event types
    points_scored INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    week INTEGER NOT NULL -- For partitioning
) PARTITION BY RANGE (week);

-- Create partitions for each week (1-17)
DO $$
BEGIN
    FOR i IN 1..17 LOOP
        EXECUTE format('CREATE TABLE game_events_week_%s PARTITION OF game_events FOR VALUES FROM (%s) TO (%s)', i, i, i+1);
    END LOOP;
END $$;

CREATE INDEX idx_game_events_game ON game_events(game_id);
CREATE INDEX idx_game_events_player ON game_events(player_id);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'user',
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    state_code VARCHAR(2), -- For compliance
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Parental consent for minors
CREATE TABLE parental_consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    parent_email VARCHAR(255) NOT NULL,
    parent_name VARCHAR(200) NOT NULL,
    consent_given BOOLEAN DEFAULT false,
    consent_date TIMESTAMP WITH TIME ZONE,
    verification_method VARCHAR(50), -- credit_card, signed_form, video_call
    verification_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fantasy leagues table
CREATE TABLE fantasy_leagues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    commissioner_id UUID REFERENCES users(id),
    season INTEGER NOT NULL,
    draft_type draft_type NOT NULL,
    max_teams INTEGER DEFAULT 12,
    scoring_settings_id UUID,
    is_public BOOLEAN DEFAULT false,
    entry_fee DECIMAL(10, 2) DEFAULT 0,
    prize_pool DECIMAL(10, 2) DEFAULT 0,
    draft_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_leagues_commissioner ON fantasy_leagues(commissioner_id);
CREATE INDEX idx_leagues_season ON fantasy_leagues(season);

-- Scoring settings table
CREATE TABLE scoring_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID REFERENCES fantasy_leagues(id) ON DELETE CASCADE,
    settings JSONB NOT NULL, -- Stores full scoring configuration
    is_custom BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fantasy rosters table
CREATE TABLE fantasy_rosters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID REFERENCES fantasy_leagues(id),
    user_id UUID REFERENCES users(id),
    team_name VARCHAR(100) NOT NULL,
    logo_url VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    draft_position INTEGER,
    waiver_priority INTEGER,
    faab_budget DECIMAL(10, 2) DEFAULT 100.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(league_id, user_id)
);

CREATE INDEX idx_rosters_league ON fantasy_rosters(league_id);
CREATE INDEX idx_rosters_user ON fantasy_rosters(user_id);

-- Roster players table
CREATE TABLE roster_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    roster_id UUID REFERENCES fantasy_rosters(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id),
    position_slot VARCHAR(10) NOT NULL, -- QB, RB1, RB2, WR1, etc.
    acquired_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    acquisition_type transaction_type NOT NULL,
    is_starter BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_roster_players_roster ON roster_players(roster_id);
CREATE INDEX idx_roster_players_player ON roster_players(player_id);

-- Matchups table
CREATE TABLE matchups_live (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID REFERENCES fantasy_leagues(id),
    week INTEGER NOT NULL,
    home_roster_id UUID REFERENCES fantasy_rosters(id),
    away_roster_id UUID REFERENCES fantasy_rosters(id),
    home_score DECIMAL(10, 2) DEFAULT 0,
    away_score DECIMAL(10, 2) DEFAULT 0,
    is_playoff BOOLEAN DEFAULT false,
    is_championship BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_matchups_league_week ON matchups_live(league_id, week);
CREATE INDEX idx_matchups_rosters ON matchups_live(home_roster_id, away_roster_id);

-- Player scores table for caching calculated fantasy points
CREATE TABLE player_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES players(id),
    game_id UUID REFERENCES games(id),
    fantasy_points DECIMAL(10, 2) NOT NULL,
    scoring_settings_id UUID REFERENCES scoring_settings(id),
    stats JSONB NOT NULL, -- Raw stats used for calculation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_id, game_id, scoring_settings_id)
);

CREATE INDEX idx_player_scores_player_game ON player_scores(player_id, game_id);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID REFERENCES fantasy_leagues(id),
    transaction_type transaction_type NOT NULL,
    initiated_by UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending',
    transaction_data JSONB NOT NULL, -- Flexible for different transaction types
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_league ON transactions(league_id);
CREATE INDEX idx_transactions_type_status ON transactions(transaction_type, status);

-- Draft picks table
CREATE TABLE draft_picks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID REFERENCES fantasy_leagues(id),
    draft_position INTEGER NOT NULL,
    round INTEGER NOT NULL,
    pick_number INTEGER NOT NULL,
    roster_id UUID REFERENCES fantasy_rosters(id),
    player_id UUID REFERENCES players(id),
    bid_amount DECIMAL(10, 2), -- For auction drafts
    pick_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(league_id, round, pick_number)
);

CREATE INDEX idx_draft_picks_league ON draft_picks(league_id);

-- Waiver claims table
CREATE TABLE waiver_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID REFERENCES fantasy_leagues(id),
    roster_id UUID REFERENCES fantasy_rosters(id),
    player_to_add UUID REFERENCES players(id),
    player_to_drop UUID REFERENCES players(id),
    priority INTEGER NOT NULL,
    faab_bid DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'pending',
    process_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_waiver_claims_league_status ON waiver_claims(league_id, status);

-- Chat messages table
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_id UUID REFERENCES fantasy_leagues(id),
    user_id UUID REFERENCES users(id),
    message TEXT NOT NULL,
    is_commissioner_announcement BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_league_created ON chat_messages(league_id, created_at DESC);

-- Audit log table
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user_created ON audit_log(user_id, created_at DESC);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);

-- Create update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update trigger to relevant tables
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leagues_updated_at BEFORE UPDATE ON fantasy_leagues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rosters_updated_at BEFORE UPDATE ON fantasy_rosters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();