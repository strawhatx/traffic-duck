/*
  # Create Keywords and Search Results Tables

  1. New Tables
    - `keywords` - Stores user's tracked keywords/search terms
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `keyword` (text) - The search term to track
      - `platform` (text) - Platform filter: 'reddit', 'instagram', 'twitter', or 'all'
      - `active` (boolean) - Whether this keyword is actively being scanned
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `search_results` - Stores posts/comments found from daily scans
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `keyword_id` (uuid, foreign key to keywords)
      - `platform` (text) - Platform source: 'reddit', 'instagram', 'twitter'
      - `title` (text) - Post/thread title
      - `content` (text) - Post/comment content preview
      - `author` (text) - Creator/author name
      - `url` (text) - Link to original post
      - `engagement` (jsonb) - Metrics like upvotes, likes, comments
      - `why_matters` (text) - Analysis of why this conversation matters
      - `engagement_path` (text) - Suggested way to engage
      - `discovered_at` (timestamp) - When this was found during scan
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Users can only read/write their own keywords and search results
*/

CREATE TABLE IF NOT EXISTS keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  keyword text NOT NULL,
  platform text DEFAULT 'all' CHECK (platform IN ('reddit', 'instagram', 'twitter', 'all')),
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, keyword, platform)
);

CREATE TABLE IF NOT EXISTS search_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  keyword_id uuid NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('reddit', 'instagram', 'twitter')),
  title text NOT NULL,
  content text,
  author text NOT NULL,
  url text NOT NULL,
  engagement jsonb DEFAULT '{}'::jsonb,
  why_matters text,
  engagement_path text,
  discovered_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own keywords"
  ON keywords
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own search results"
  ON search_results
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own search results"
  ON search_results
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS keywords_user_id_idx ON keywords(user_id);
CREATE INDEX IF NOT EXISTS keywords_active_idx ON keywords(user_id, active);
CREATE INDEX IF NOT EXISTS search_results_user_id_idx ON search_results(user_id);
CREATE INDEX IF NOT EXISTS search_results_keyword_id_idx ON search_results(keyword_id);
CREATE INDEX IF NOT EXISTS search_results_discovered_at_idx ON search_results(discovered_at DESC);
