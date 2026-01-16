
import { Car, NPC } from './types';

export const CARS: Car[] = [
  {
    id: 'porsche',
    name: '保时捷 Panamera',
    tag: '二手超豪华',
    image: 'https://picsum.photos/seed/porsche/400/300',
    description: '懂车帝认证，不仅是车，更是你这十年的军功章。',
    initialFace: 50,
  },
  {
    id: 'li7',
    name: '理想 L7',
    tag: '奶爸神车',
    image: 'https://picsum.photos/seed/ideal/400/300',
    description: '带全家回老家，智能配置让二叔三婶惊掉下巴。',
    initialFace: 40,
  },
  {
    id: 'bmw5',
    name: '宝马 5系',
    tag: '商务排面',
    image: 'https://picsum.photos/seed/bmw/400/300',
    description: '经典的代名词，在村口一停，支书都得递根烟。',
    initialFace: 45,
  }
];

export const NPCS: NPC[] = [
  {
    id: 'auntie',
    name: '二婶',
    role: '爱攀比的亲戚',
    position: 'left',
    avatar: '👩‍🦱'
  },
  {
    id: 'uncle',
    name: '三叔',
    role: '自诩懂车的长辈',
    position: 'top',
    avatar: '👴'
  },
  {
    id: 'cousin',
    name: '表哥',
    role: '刚提新车的竞争者',
    position: 'right',
    avatar: '👦'
  }
];
