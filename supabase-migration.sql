-- WalkBuddy Database Migration
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES TABLE
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  first_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  trust_score INTEGER DEFAULT 100 CHECK (trust_score >= 0 AND trust_score <= 100),
  is_banned BOOLEAN DEFAULT FALSE
);

-- WALK_REQUESTS TABLE
CREATE TABLE walk_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_lat DOUBLE PRECISION NOT NULL,
  start_lng DOUBLE PRECISION NOT NULL,
  dest_lat DOUBLE PRECISION NOT NULL,
  dest_lng DOUBLE PRECISION NOT NULL,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'matched', 'expired', 'cancelled')),
  matched_with UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '10 minutes')
);

-- MATCHES TABLE
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_1 UUID NOT NULL REFERENCES walk_requests(id) ON DELETE CASCADE,
  request_2 UUID NOT NULL REFERENCES walk_requests(id) ON DELETE CASCADE,
  meetup_lat DOUBLE PRECISION NOT NULL,
  meetup_lng DOUBLE PRECISION NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- REPORTS TABLE
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CREATE INDEXES
CREATE INDEX idx_walk_requests_status ON walk_requests(status);
CREATE INDEX idx_walk_requests_created_at ON walk_requests(created_at);
CREATE INDEX idx_walk_requests_user_id ON walk_requests(user_id);
CREATE INDEX idx_reports_reported_user_id ON reports(reported_user_id);
CREATE INDEX idx_matches_requests ON matches(request_1, request_2);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE walk_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR PROFILES
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS POLICIES FOR WALK_REQUESTS
CREATE POLICY "Users can view their own walk requests"
  ON walk_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view matched walk requests"
  ON walk_requests FOR SELECT
  USING (auth.uid() = matched_with);

CREATE POLICY "Users can insert their own walk requests"
  ON walk_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own walk requests"
  ON walk_requests FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS POLICIES FOR MATCHES
CREATE POLICY "Users can view their own matches"
  ON matches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM walk_requests
      WHERE (walk_requests.id = matches.request_1 OR walk_requests.id = matches.request_2)
      AND walk_requests.user_id = auth.uid()
    )
  );

-- RLS POLICIES FOR REPORTS
CREATE POLICY "Users can view their own reports"
  ON reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Users can insert reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- FUNCTION: Calculate distance between two points in miles using Haversine formula
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DOUBLE PRECISION,
  lng1 DOUBLE PRECISION,
  lat2 DOUBLE PRECISION,
  lng2 DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION AS $$
DECLARE
  r DOUBLE PRECISION := 3959; -- Earth radius in miles
  dlat DOUBLE PRECISION;
  dlng DOUBLE PRECISION;
  a DOUBLE PRECISION;
  c DOUBLE PRECISION;
BEGIN
  dlat := radians(lat2 - lat1);
  dlng := radians(lng2 - lng1);
  a := sin(dlat/2) * sin(dlat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng/2) * sin(dlng/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  RETURN r * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- FUNCTION: Find walk buddy and create match
CREATE OR REPLACE FUNCTION find_walk_buddy(
  p_request_id UUID,
  p_start_lat DOUBLE PRECISION,
  p_start_lng DOUBLE PRECISION,
  p_dest_lat DOUBLE PRECISION,
  p_dest_lng DOUBLE PRECISION
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_matched_request_id UUID;
  v_matched_user_id UUID;
  v_meetup_lat DOUBLE PRECISION;
  v_meetup_lng DOUBLE PRECISION;
  v_match_id UUID;
BEGIN
  -- Get the user_id for the requesting user
  SELECT user_id INTO v_user_id
  FROM walk_requests
  WHERE id = p_request_id;

  -- Find the closest waiting request within distance thresholds
  SELECT wr.id, wr.user_id
  INTO v_matched_request_id, v_matched_user_id
  FROM walk_requests wr
  JOIN profiles p ON p.id = wr.user_id
  WHERE wr.status = 'waiting'
    AND wr.id != p_request_id
    AND wr.user_id != v_user_id
    AND p.trust_score > 50
    AND p.is_banned = FALSE
    AND calculate_distance(p_start_lat, p_start_lng, wr.start_lat, wr.start_lng) <= 0.3
    AND calculate_distance(p_dest_lat, p_dest_lng, wr.dest_lat, wr.dest_lng) <= 0.2
    AND wr.expires_at > NOW()
  ORDER BY calculate_distance(p_start_lat, p_start_lng, wr.start_lat, wr.start_lng)
  LIMIT 1;

  -- If no match found, return NULL
  IF v_matched_request_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Calculate midpoint for meetup location
  SELECT
    (p_start_lat + (SELECT start_lat FROM walk_requests WHERE id = v_matched_request_id)) / 2,
    (p_start_lng + (SELECT start_lng FROM walk_requests WHERE id = v_matched_request_id)) / 2
  INTO v_meetup_lat, v_meetup_lng;

  -- Update both requests to matched status
  UPDATE walk_requests
  SET status = 'matched', matched_with = v_matched_user_id
  WHERE id = p_request_id;

  UPDATE walk_requests
  SET status = 'matched', matched_with = v_user_id
  WHERE id = v_matched_request_id;

  -- Create match record
  INSERT INTO matches (request_1, request_2, meetup_lat, meetup_lng)
  VALUES (p_request_id, v_matched_request_id, v_meetup_lat, v_meetup_lng)
  RETURNING id INTO v_match_id;

  RETURN v_matched_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION find_walk_buddy TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_distance TO authenticated;

-- Create a trigger to automatically create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create a function to clean up expired walk requests
CREATE OR REPLACE FUNCTION cleanup_expired_requests()
RETURNS void AS $$
BEGIN
  UPDATE walk_requests
  SET status = 'expired'
  WHERE status = 'waiting'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
