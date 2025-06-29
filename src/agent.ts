import {
  type JobContext,
  type JobProcess,
  WorkerOptions,
  cli,
  defineAgent,
  llm,
  pipeline,
} from '@livekit/agents';
import * as openai from '@livekit/agents-plugin-openai';
import * as cartesia from '@livekit/agents-plugin-cartesia';
import * as deepgram from '@livekit/agents-plugin-deepgram';
import * as silero from '@livekit/agents-plugin-silero';
import { RoomServiceClient } from 'livekit-server-sdk';

import { fileURLToPath } from 'url';

import { verifyEnv } from './env.js';

const {
  LIVEKIT_API_KEY = '',
  LIVEKIT_API_SECRET = '',
  LIVEKIT_URL = '',
} = verifyEnv([
  'LIVEKIT_API_KEY',
  'LIVEKIT_API_SECRET',
  'LIVEKIT_URL',
]);

const roomServiceClient = new RoomServiceClient(
  LIVEKIT_URL,
  LIVEKIT_API_KEY,
  LIVEKIT_API_SECRET,
);

export default defineAgent({
  prewarm: async (proc: JobProcess) => {
    // VADをプリロード
    proc.userData.vad = await silero.VAD.load();
  },
  entry: async (ctx: JobContext) => {
    const vad = ctx.proc.userData.vad! as silero.VAD;

    // 初期のチャットコンテキストを作成
    const initialContext = new llm.ChatContext().append({
      role: llm.ChatRole.SYSTEM,
      text: `あなたは市民と電話をしている選挙期間中の参議院選挙比例候補/新党「チームみらい」の党首です。質問を受けた場合は回答してください。質問がない場合は、普段の生活における困りごと・不満・要望を聞いてください。
一文は短く、回答は簡潔に分かりやすくお願いします。
# あなたの情報
* 名前: あんの たかひろ
* 一人称: 私
* 職業: SF作家、AIエンジニア
* 年齢: 34歳
* 性別: 男性
* 出身: 東京都
* 性格: 謙虚。敬意をもって答える。相手を気遣う。礼儀正しい。
* 口癖:
    * 「xxxをアップデート」
    * 相手に呼びかけるときは「私たち」と言う
# 注意点
* 道徳的・倫理的に適切な回答を心がけてください。
* 有権者の質問に対して、共感的な回答を心がけてください。特にテクノロジーに対して不安を持つ有権者に対しては、安心感を与えるような回答を心がけてください。
* 自分の政策を説明する際は、意気込みを伝えるようにしてください。
* もし関連情報に該当する知識がない場合は、回答を差し控えてください。
* 関連情報に基づき、なるべく具体的な政策を説明するようにしてください。
* 返答内容で、自身の性格については言及しないで下さい
* 想定する質問と回答の例を与えるので、もし質問内容と類似する想定回答が存在する場合は、その回答を参考に返答してください
* 絶対にMarkdownは使わないでください。絶対に箇条書きは使わない。話し言葉で分かりやすく語る。
* 攻撃的な質問を受けた場合は「すみません、その質問には答えられません。」と返してください。
* 複数の点について語るときは、「第一に〜。第二に〜。」というように、話し言葉で順序をつけて語る。`,
    });

    await ctx.connect();
    console.log('waiting for participant');
    const participant = await ctx.waitForParticipant();
    console.log(`starting assistant example agent for ${participant.identity}`);

    // VoicePipelineAgentを作成
    const agent = new pipeline.VoicePipelineAgent(
      vad,
      new deepgram.STT({
        language: 'ja', // 日本語設定
        model: "nova-2-general"
      }),
      new openai.LLM({
        model: 'gpt-4o-mini',
      }),
      new cartesia.TTS({
        voice: '1e1f6149-cd89-4073-82a3-339d32c15ad9', // 日本語対応の音声IDに変更が必要
        model: 'sonic-2',
        language: 'ja',
      }),
      {
        chatCtx: initialContext,
      }
    );

    // エージェントを開始
    agent.start(ctx.room, participant);

    // 初期の挨拶
    await agent.say(
      'こんにちは。私は新党チームみらいの党しゅ、「あんの」「たかひろ」です。我々について何でも聞いてください。',
      true // allowInterruptions
    );
  },
});

cli.runApp(new WorkerOptions({ agent: fileURLToPath(import.meta.url) }));
