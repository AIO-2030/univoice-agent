use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize)]
pub struct Workflow {
    pub client_id: String,
    pub prompt: HashMap<String, Node>,
    #[serde(default)]
    pub extra_data: ExtraData,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Node {
    pub inputs: NodeInputs,
    pub class_type: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(untagged)]
pub enum NodeInputs {
    LoadAudio {
        audio: String,
        upload: String,
    },
    ShowText {
        text: Vec<serde_json::Value>,
        show_text: String,
    },
    AnalyzeAudio {
        json: Vec<serde_json::Value>,
    },
    LoadWhisperModel {
        model_size: String,
        device: String,
        compute_type: String,
    },
    SiliconflowLLM {
        api_key: Vec<serde_json::Value>,
        prompt: Vec<serde_json::Value>,
        system_content: String,
        model: String,
        seed: i64,
        context_size: i32,
        max_tokens: i32,
    },
    KeyInput {
        key: String,
        input_key: Option<String>,
    },
    SenseVoiceNode {
        device: String,
        language: String,
        num_threads: i32,
        use_int8: bool,
        use_itn: bool,
        audio: Vec<serde_json::Value>,
    },
    SwitchByIndex {
        index: i32,
        flat: String,
        A: Vec<serde_json::Value>,
        B: Vec<serde_json::Value>,
    },
    JoinWithDelimiter {
        delimiter: String,
        text_list: Vec<serde_json::Value>,
    },
    JsonRepair {
        json_string: Vec<serde_json::Value>,
        key: String,
        json_string2: Vec<serde_json::Value>,
    },
    WhisperTranscribe {
        whisper_model: Vec<serde_json::Value>,
        audio: Vec<serde_json::Value>,
    },
}

#[derive(Debug, Default, Serialize, Deserialize)]
pub struct ExtraData {
    pub extra_pnginfo: Option<ExtraPngInfo>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExtraPngInfo {
    pub workflow: WorkflowInfo,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WorkflowInfo {
    pub last_node_id: i32,
    pub last_link_id: i32,
    pub nodes: Vec<WorkflowNode>,
    pub links: Vec<Vec<serde_json::Value>>,
    pub groups: Vec<serde_json::Value>,
    pub config: HashMap<String, serde_json::Value>,
    pub extra: WorkflowExtra,
    pub version: f32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WorkflowNode {
    pub id: i32,
    #[serde(rename = "type")]
    pub node_type: String,
    pub pos: Vec<i32>,
    pub size: HashMap<String, f32>,
    pub flags: HashMap<String, serde_json::Value>,
    pub order: i32,
    pub mode: i32,
    pub inputs: Option<Vec<NodeConnection>>,
    pub outputs: Vec<NodeConnection>,
    pub properties: HashMap<String, String>,
    pub widgets_values: Vec<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NodeConnection {
    pub name: String,
    #[serde(rename = "type")]
    pub connection_type: String,
    pub link: Option<i32>,
    pub shape: i32,
    pub slot_index: Option<i32>,
    pub widget: Option<Widget>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Widget {
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WorkflowExtra {
    pub ds: DisplaySettings,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DisplaySettings {
    pub scale: f32,
    pub offset: Vec<f32>,
}