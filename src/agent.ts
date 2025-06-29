import {
  type JobContext,
  WorkerOptions,
  cli,
  defineAgent,
  llm,
  multimodal,
} from '@livekit/agents';
import * as openai from '@livekit/agents-plugin-openai';
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
  entry: async (ctx: JobContext) => {
    await ctx.connect();
    console.log('waiting for participant');
    const participant = await ctx.waitForParticipant();
    console.log(`starting assistant example agent for ${participant.identity}`);
    let callerPoints = 0;
    let agentPoints = 0;

    const model = new openai.realtime.RealtimeModel({
      instructions: `あなたは市民と電話をしている選挙期間中の参議院選挙比例候補/新党「チームみらい」の党首です。質問を受けた場合は回答してください。質問がない場合は、普段の生活における困りごと・不満・要望を聞いてください。
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

    const fncCtx: llm.FunctionContext = {
      gameEnd: {
        description: 'End the game and delete the room',
        parameters: {},
        execute: async () => {
          console.log('Waiting for 20 seconds before deleting room...');

          // Schedule disconnection
          setTimeout(async () => {
            console.log('Deleting room...');
            await roomServiceClient.deleteRoom(ctx.room.name!);
          }, 20000);

          return 'Game over, thank you for playing. Goodbye!';
        },
      },
      userPoints: {
        description: 'When the caller gets a point, call this function',
        parameters: {},
        execute: async () => {
          callerPoints++;
          console.log(
            `callerPoints: ${callerPoints}, agentPoints: ${agentPoints}`,
          );
          return `That is correct. You currently have ${callerPoints} points.`;
        },
      },
      systemPoints: {
        description: 'When the system gets a point, call this function',
        parameters: {},
        execute: async () => {
          agentPoints++;
          console.log(
            `callerPoints: ${callerPoints}, agentPoints: ${agentPoints}`,
          );
          return `That is incorrect. I currently have ${agentPoints} points.`;
        },
      },
      pointsStatus: {
        description: 'When a caller asks about the points, call this function',
        parameters: {},
        execute: async () => {
          console.log('The user asked about the points.');
          return `You currently have ${callerPoints} points and I currently have ${agentPoints} points.`;
        },
      },
    };

    const agent = new multimodal.MultimodalAgent({ model, fncCtx });
    const session = await agent
      .start(ctx.room, participant)
      .then(session => session as openai.realtime.RealtimeSession);

    session.conversation.item.create(
      new llm.ChatMessage({
        role: llm.ChatRole.ASSISTANT,
        content:
          'Greet the caller as Tike Mrapp, host of Um, Actually, and explain the rules of the game.',
      }),
    );
    session.response.create();
  },
});

cli.runApp(new WorkerOptions({ agent: fileURLToPath(import.meta.url) }));
