-- Create evidence_audio_derivation_outputs table
CREATE TABLE IF NOT EXISTS evidence_audio_derivation_outputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id TEXT NOT NULL,
    evidence_id TEXT NOT NULL,
    evidence_name TEXT,
    output_source TEXT DEFAULT 'demo_json_injector',
    schema_version TEXT DEFAULT 'audio_derivation_v1',
    mapping_version TEXT DEFAULT 'audio_derivation_panel_v1',
    investigation_metadata JSONB DEFAULT '{}',
    dialogue_map JSONB NOT NULL,
    raw_json JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_demo_override BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indices
CREATE INDEX IF NOT EXISTS idx_audio_derivation_lookup ON evidence_audio_derivation_outputs (case_id, evidence_id, is_active);
