# 📞 LiveKit SIP Agent Example 🤖

This project demonstrates how to create a LiveKit Agent that can answer SIP calls using Twilio as the SIP provider.
The agent uses OpenAI's capabilities to process and respond to voice calls and hosts a game of ["Um, Actually"](https://www.dropout.tv/um-actually) with the caller.

## Prerequisites 📋

- Python 3.8 or higher 🐍
- Node.js (v18 or higher) for setup scripts 💻
- A LiveKit server instance 📡
- A Twilio account with SIP trunking capabilities 🌐
- API keys for AI services 🔑

## Project Structure 📂

```txt
.
├── agent.py             # Main agent implementation (Python)
├── requirements.txt     # Python dependencies
├── src/
│   ├── setup-livekit.ts # LiveKit setup script
│   └── setup-twilio.ts  # Twilio setup script
├── .env.example         # Example environment variables
```

## Setup 🛠️

1. Clone the repository:

   ```bash
   git clone https://github.com/livekit-examples/livekit-sip-agent-example.git
   cd livekit-sip-agent-example
   ```

2. Install Node.js dependencies (for setup scripts):

   ```bash
   npm install
   ```

3. Install Python dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Create your environment file:

   ```bash
   cp .env.example .env
   ```

5. Configure your environment variables in `.env`:
   - `LIVEKIT_API_KEY`: Your LiveKit API key
   - `LIVEKIT_API_SECRET`: Your LiveKit API secret
   - `LIVEKIT_URL`: Your LiveKit server URL
   - `LIVEKIT_SIP_URI`: Your LiveKit SIP URI
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `DEEPGRAM_API_KEY`: Your Deepgram API key
   - `CARTESIA_API_KEY`: Your Cartesia API key
   - `TWILIO_PHONE_NUMBER`: Your Twilio phone number
   - `TWILIO_ACCOUNT_SID`: Your Twilio account SID
   - `TWILIO_AUTH_TOKEN`: Your Twilio auth token
   - `TWILIO_SIP_USERNAME`: Your Twilio SIP username (You may end up generating this after running the setup script)
   - `TWILIO_SIP_PASSWORD`: Your Twilio SIP password (You may end up generating this after running the setup script)

6. Set up Twilio:

   ```bash
   npm run setup:twilio
   ```

   This will follow the steps outlined in the LiveKit [Create and configure a Twilio SIP trunk](https://docs.livekit.io/sip/quickstarts/configuring-twilio-trunk/) guide. You will need to have a Twilio account and a phone number. Be sure to follow the steps in the [Inbound calls with Twilio Voice](https://docs.livekit.io/sip/accepting-calls-twilio-voice/) guide after running the setup script.

7. Set up LiveKit:

   ```bash
   npm run setup:livekit
   ```

   This will follow the steps outlined in the LiveKit [SIP inbound trunk](https://docs.livekit.io/sip/trunk-inbound/) guide.

## Running the Agent 🚀

To start the agent:

```bash
python agent.py
```

The agent will now be ready to receive SIP calls through your Twilio phone number.

## How It Works 🤔

1. When a call comes in through your Twilio phone number, it's routed to your LiveKit SIP URI
2. The LiveKit agent receives the call and establishes a connection to a room
3. A LiveKit Agent is automatically dispatched to join the room
4. The agent uses OpenAI's capabilities to process the call audio, transcribe it using Deepgram, and generate responses

## Python Implementation Details 🐍

The Python version uses the LiveKit Python SDK with the following key components:

- `WorkerOptions(entrypoint_fnc=...)` for agent definition
- `AgentSession` for voice pipeline management
- Integration with Deepgram (STT), OpenAI (LLM), and Cartesia (TTS)
- Silero VAD for voice activity detection

## License 📝

[Apache-2.0](LICENSE.md)