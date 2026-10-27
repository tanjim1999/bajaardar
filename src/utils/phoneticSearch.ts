// Phonetic & Banglish alias mapper for Bangladeshi grocery shoppers
export const BANGLA_PHONETIC_MAP: Record<string, string[]> = {
  // Vegetables & Kitchen Basics
  alu: ["potato", "আলু", "গোল আলু"],
  aloo: ["potato", "আলু", "গোল আলু"],
  peyaj: ["onion", "পেঁয়াজ", "পেয়াজ"],
  peaj: ["onion", "পেঁয়াজ", "পেয়াজ"],
  piyaj: ["onion", "পেঁয়াজ", "পেয়াজ"],
  pyaj: ["onion", "পেঁয়াজ", "পেয়াজ"],
  dim: ["egg", "ডিম", "লেয়ার ডিম", "ফার্মের ডিম"],
  deem: ["egg", "ডিম"],
  tel: ["oil", "তেল", "সয়াবিন", "সরিষা"],
  toil: ["oil", "তেল"],
  chal: ["rice", "চাল", "ধান", "মিনিকেট", "নাজিরশাইল"],
  chaal: ["rice", "চাল", "মিনিকেট"],
  bhat: ["rice", "চাল"],
  dal: ["lentil", "ডাল", "মসুর ডাল", "মুগ ডাল"],
  daal: ["lentil", "ডাল", "মসুর ডাল"],
  dhal: ["lentil", "ডাল"],
  murgi: ["chicken", "মুরগি", "ব্রয়লার", "সোনালি"],
  morog: ["chicken", "মুরগি", "মোরগ"],
  broiler: ["chicken", "ব্রয়লার", "মুরগি"],
  sonali: ["chicken", "সোনালি", "মুরগি"],
  mangsho: ["meat", "মাংস", "গরু", "খাসি"],
  goru: ["beef", "গরুর মাংস"],
  beef: ["গরুর মাংস", "beef", "meat"],
  khasi: ["mutton", "খাসির মাংস"],
  khashi: ["mutton", "খাসির মাংস"],
  mach: ["fish", "মাছ", "ইলিশ", "রুই"],
  maas: ["fish", "মাছ"],
  ilish: ["hilsa", "hilsha", "ইলিশ"],
  hilsa: ["ইলিশ", "ilish"],
  rui: ["rohu", "রুই মাছ"],
  katla: ["katla", "কাতলা মাছ"],
  tilapia: ["তিলাপিয়া", "tilapia"],
  pangash: ["পাঙ্গাশ", "pangash"],
  roshun: ["garlic", "রসুন"],
  roshon: ["garlic", "রসুন"],
  ada: ["ginger", "আদা"],
  morich: ["chili", "মরিচ", "কাঁচামরিচ"],
  marich: ["chili", "মরিচ", "কাঁচামরিচ"],
  chili: ["কাঁচামরিচ", "মরিচ", "chili"],
  chilli: ["কাঁচামরিচ", "মরিচ"],
  begun: ["brinjal", "eggplant", "বেগুন"],
  tomato: ["tomato", "টমেটো"],
  tamato: ["tomato", "টমেটো"],
  shosha: ["cucumber", "শসা"],
  lebu: ["lemon", "lime", "লেবু"],
  gajor: ["carrot", "গাজর"],
  pepe: ["papaya", "পেঁপে"],
  dudh: ["milk", "দুধ", "তরল দুধ"],
  dud: ["milk", "দুধ"],
  chini: ["sugar", "চিনি"],
  lobon: ["salt", "লবণ"],
  kola: ["banana", "কলা"],
  holud: ["turmeric", "হলুদ"],
  dhonia: ["coriander", "ধনে"],
  jira: ["cumin", "জিরা"],
  shorisha: ["mustard", "সরিষা"],
};

export const matchesPhoneticQuery = (
  query: string,
  nameEn: string,
  nameBn: string,
  category: string
): boolean => {
  const cleanQ = query.trim().toLowerCase();
  if (!cleanQ) return true;

  // Direct substring check
  if (nameEn.toLowerCase().includes(cleanQ) || nameBn.includes(cleanQ) || category.toLowerCase().includes(cleanQ)) {
    return true;
  }

  // Check phonetic mapped terms
  const mappedTerms = BANGLA_PHONETIC_MAP[cleanQ];
  if (mappedTerms) {
    for (const term of mappedTerms) {
      if (nameEn.toLowerCase().includes(term.toLowerCase()) || nameBn.includes(term)) {
        return true;
      }
    }
  }

  // Multi-word phonetic query
  const words = cleanQ.split(/\s+/);
  for (const w of words) {
    const terms = BANGLA_PHONETIC_MAP[w];
    if (terms) {
      for (const t of terms) {
        if (nameEn.toLowerCase().includes(t.toLowerCase()) || nameBn.includes(t)) {
          return true;
        }
      }
    }
  }

  return false;
};
