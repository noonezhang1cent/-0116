
import { GoogleGenAI, Type } from "@google/genai";
import { Car, NPC, BattleTurn } from './types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateBattleTurn = async (car: Car, npc: NPC, currentFace: number): Promise<BattleTurn> => {
  const prompt = `
    你正在为一款叫《过年吃席模拟器》的游戏编写对话。
    玩家当前开的车是：${car.name} (${car.description})。
    当前说话的NPC是：${npc.name} (${npc.role})。
    玩家目前的“排面值”是：${currentFace}/100。
    
    请生成该NPC对玩家车辆的一句“言语攻击”或“阴阳怪气”的询问，以及三个玩家的回应选项。
    回应选项应体现懂车帝二手车“好车不贵”、“深度检测”、“有排面”的特点。
    
    选项1：得体回应（+5~10排面）
    选项2：犀利反击（+15~20排面，但要符合过年气氛）
    选项3：谦虚（-5~0排面）
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          attack: { type: Type.STRING, description: 'NPC的挑衅话语' },
          options: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING, description: '回应文本' },
                faceChange: { type: Type.INTEGER, description: '排面值变化' },
                feedback: { type: Type.STRING, description: '选完后的NPC反应' }
              },
              required: ['text', 'faceChange', 'feedback']
            }
          }
        },
        required: ['attack', 'options']
      }
    }
  });

  try {
    return JSON.parse(response.text.trim()) as BattleTurn;
  } catch (e) {
    // Fallback if AI fails
    return {
      npc,
      attack: "哎哟，这车二手的吧？看着挺旧啊。",
      options: [
        { text: "二叔，这可是懂车帝认证的，跟新的一样！", faceChange: 10, feedback: "哟，还挺讲究。" },
        { text: "旧不旧不重要，关键是开着比您那车稳多了。", faceChange: 20, feedback: "嘿，你这孩子..." },
        { text: "是啊，随便开开。", faceChange: -5, feedback: "我就说嘛。" }
      ]
    };
  }
};
