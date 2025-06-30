# LiveKit SIP Agent Example - Python版

TypeScriptからPythonに移行したLiveKit SIPエージェントの実装です。

## 必要な環境変数

以下の環境変数を`.env`ファイルに設定してください：

```bash
# LiveKit Configuration
LIVEKIT_API_KEY=your_api_key_here
LIVEKIT_API_SECRET=your_api_secret_here
LIVEKIT_URL=ws://localhost:7880

# AI Service API Keys
OPENAI_API_KEY=your_openai_api_key_here
DEEPGRAM_API_KEY=your_deepgram_api_key_here
CARTESIA_API_KEY=your_cartesia_api_key_here
```

## インストール

```bash
pip install -r requirements.txt
```

## 実行

```bash
python agent.py
```

## 主な変更点

### TypeScript → Python の対応

- `defineAgent()` → `WorkerOptions(entrypoint_fnc=...)`
- `VoicePipelineAgent` → `AgentSession`
- `cli.runApp()` → `agents.cli.run_app()`
- `ctx.waitForParticipant()` → `await ctx.wait_for_participant()`

### プラグインの初期化

- `new deepgram.STT()` → `deepgram.STT()`
- `new openai.LLM()` → `openai.LLM()`
- `new cartesia.TTS()` → `cartesia.TTS()`
- `await silero.VAD.load()` → `silero.VAD.load()`

## ファイル構成

- `agent.py` - メインのエージェント実装
- `env.py` - 環境変数検証ユーティリティ
- `requirements.txt` - Python依存関係