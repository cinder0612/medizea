-- Create meditations table
CREATE TABLE meditations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    meditation_prompt TEXT NOT NULL,
    music_prompt TEXT NOT NULL,
    duration INTEGER NOT NULL,
    audio_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT GENERATED ALWAYS AS (
        CASE 
            WHEN length(meditation_prompt) > 50 
            THEN substring(meditation_prompt from 1 for 47) || '...'
            ELSE meditation_prompt
        END
    ) STORED
);

-- Create index for faster user-specific queries
CREATE INDEX meditations_user_id_idx ON meditations(user_id);

-- Set up RLS policies
ALTER TABLE meditations ENABLE ROW LEVEL SECURITY;

-- Users can only read their own meditations
CREATE POLICY "Users can view own meditations" ON meditations
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can only insert their own meditations
CREATE POLICY "Users can insert own meditations" ON meditations
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own meditations
CREATE POLICY "Users can delete own meditations" ON meditations
    FOR DELETE
    USING (auth.uid() = user_id);
