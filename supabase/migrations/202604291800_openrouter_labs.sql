-- Create model_gateway_profiles table
CREATE TABLE IF NOT EXISTS model_gateway_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gateway TEXT NOT NULL,
    profile_name TEXT NOT NULL UNIQUE,
    secret_ref TEXT NOT NULL,
    status TEXT DEFAULT 'Not Tested',
    last_tested_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create labs_agent_runs table
CREATE TABLE IF NOT EXISTS labs_agent_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gateway TEXT NOT NULL,
    credential_profile TEXT NOT NULL,
    model_slug TEXT NOT NULL,
    provider_policy_json JSONB DEFAULT '{}',
    uploaded_audio_name TEXT,
    uploaded_audio_format TEXT,
    uploaded_audio_size BIGINT,
    prompt_payload_json JSONB DEFAULT '{}',
    openrouter_response_json JSONB DEFAULT '{}',
    parsed_output_json JSONB DEFAULT '{}',
    validation_result_json JSONB DEFAULT '{}',
    latency_ms INTEGER,
    usage_json JSONB DEFAULT '{}',
    estimated_cost DECIMAL(10, 6),
    status TEXT NOT NULL,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed model_gateway_profiles
INSERT INTO model_gateway_profiles (gateway, profile_name, secret_ref)
VALUES ('openrouter', 'OPENROUTER_MAIN', 'env:OPENROUTER_API_KEY')
ON CONFLICT (profile_name) DO NOTHING;
