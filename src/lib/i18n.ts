import { useCallback, useEffect, useState } from "react";

export type Lang = "en" | "ar";

export const LANGS: { value: Lang; label: string }[] = [
  { value: "en", label: "English" },
  { value: "ar", label: "العربية" },
];

export function dirOf(lang: Lang): "rtl" | "ltr" {
  return lang === "ar" ? "rtl" : "ltr";
}

const en = {
  // Landing
  brand: "Lumière",
  landingTitle: "A birthday they will never forget",
  landingSub:
    "Build a cinematic birthday page with your words, photos, videos and music. It stays locked until the exact moment — then it comes alive.",
  createGift: "Create a birthday gift",
  noAccount: "No account needed",
  f1Title: "Unlocks on time",
  f1Body: "Nothing is revealed before the birthday moment you choose — not even by refreshing.",
  f2Title: "Real celebration",
  f2Body: "Balloons, confetti, sparkles, cake and music the second the countdown hits zero.",
  f3Title: "One private link",
  f3Body: "Share one link. They only ever see the birthday — never your editing tools.",

  // Editor sections
  editorTitle: "Create a birthday gift",
  editorSub: "Fill it in at your own pace, preview it, then share the link.",
  editTitle: "Edit your gift",
  secRecipient: "Recipient",
  secWhen: "Birthday",
  secMessages: "Messages",
  secMessageFrames: "Message Frames",
  secMedia: "Photos & Videos",
  secMusic: "Birthday Music",
  secSurprise: "Hidden Surprise",
  secAppearance: "Appearance",
  secPreview: "Preview",

  // Fields
  theirName: "Their name",
  nickname: "Nickname (optional)",
  date: "Date",
  time: "Time",
  timeZone: "Time zone",
  giftLanguage: "Gift language",
  giftLanguageHint: "The birthday page will be shown in this language.",
  whenHint: "Nothing is revealed before this exact moment.",
  mainMessage: "Main birthday message",
  mainMessagePh: "Happy birthday…\n\nWrite the thing you'd never say out loud. 💛",
  extraNote: "Extra note",
  addNote: "Add another note",
  finalMessage: "Final message",
  finalMessagePh: "Made with love ❤️",
  hiddenMessage: "Hidden message",
  hiddenMessagePh: "A secret they'll only find if they open the gift box 🎁",
  hiddenMedia: "Hidden photo or video (optional)",
  caption: "Caption (optional)",

  // Media
  addPhotos: "Add photos",
  addVideos: "Add videos",
  addMusic: "Add music",
  replaceMusic: "Replace music",
  addMedia: "Add photo or video",
  mediaHint: "They appear one by one, in this order.",
  musicHint: "Plays only when the celebration starts — never during the countdown.",
  playMusicInGift: "Play music in the gift",
  removeMusic: "Remove music",
  remove: "Remove",
  moveUp: "Move up",
  moveDown: "Move down",
  uploading: "Uploading…",

  // Appearance
  theme: "Theme",
  accent: "Accent colour",
  frameDesign: "Frame design",
  frameColor: "Frame colour",
  framePreviewMessage: "Your message will appear here",
  decorations: "Decorations",
  decorationsHint: "Real animated decorations on the birthday page.",

  // Actions
  previewGift: "Preview gift",
  previewCelebration: "Preview celebration",
  closePreview: "Close preview",
  restart: "Restart",
  skipCountdown: "Skip countdown",
  saveChanges: "Save changes",
  createGiftBtn: "Create gift",
  saving: "Saving…",
  copyLink: "Copy link",
  copied: "Copied",
  publicLink: "Public gift link",
  publicLinkHint: "Send this to the birthday person.",
  privateLink: "Your private edit link",
  privateLinkHint: "Keep this for yourself — it is the only way back to edit this gift.",
  openGift: "Open the gift",
  back: "Back",

  // Errors
  errName: "Please add the birthday person's name",
  errMessage: "Please write the main birthday message",
  errUpload: "Upload failed. Please try again.",
  errFormat: "That file type isn't supported.",
  errTooBig: "That file is too large (max 25 MB).",
  errSave: "Could not save the gift.",
  errLoad: "Could not load this gift.",
  savedDraft: "Draft restored",
  giftSaved: "Your birthday gift is ready 🎁",
  giftUpdated: "Gift updated",
  mediaAdded: "Added",

  // Experience
  expIntroTitle: "Something has been prepared for you",
  expIntroSub: "Take a quiet moment. Turn the sound on if you can.",
  begin: "Begin",
  waitingTitle: "Something special is waiting…",
  waitingSub: "This surprise unlocks itself at exactly the right moment.",
  days: "days",
  hours: "hours",
  mins: "mins",
  secs: "secs",
  happyBirthday: "Happy Birthday",
  readMessage: "Read your message",
  dear: "Dear",
  seeMemories: "See our memories",
  memories: "Memories",
  continueBtn: "Continue",
  surpriseTitle: "A little surprise for you",
  tapToOpen: "Tap the gift box",
  lastMoment: "One last moment",
  watchAgain: "Watch it again",
  playMusic: "Play birthday music",
  musicOn: "Music on",
  musicOff: "Music off",
  exit: "Exit",
  next: "Next",
  previous: "Previous",
  notFound: "This gift link doesn't exist.",
  loadError: "This surprise couldn't be opened right now.",
  preview: "Preview",

  // My gifts
  myGifts: "My Gifts",
  myGiftsSub: "Every gift you created, saved in the cloud.",
  myGiftsEmpty: "You haven't created a gift yet.",
  editGift: "Edit",
  loadingTxt: "Loading…",
  birthdayOn: "Birthday",
};

type Dict = typeof en;

const ar: Dict = {
  brand: "لوميير",
  landingTitle: "عيد ميلاد لن ينسوه أبدًا",
  landingSub:
    "اصنع صفحة عيد ميلاد سينمائية بكلماتك وصورك وفيديوهاتك وموسيقاك. تبقى مقفلة حتى اللحظة المحددة، ثم تنبض بالحياة.",
  createGift: "أنشئ هدية عيد ميلاد",
  noAccount: "بدون حساب",
  f1Title: "تُفتح في وقتها",
  f1Body: "لا يظهر أي شيء قبل لحظة عيد الميلاد التي تختارها، حتى مع إعادة تحميل الصفحة.",
  f2Title: "احتفال حقيقي",
  f2Body: "بالونات وقصاصات ملونة وبريق وكعكة وموسيقى في اللحظة التي ينتهي فيها العد التنازلي.",
  f3Title: "رابط خاص واحد",
  f3Body: "شارك رابطًا واحدًا. لن يرى سوى الاحتفال، ولن يرى أدوات التعديل أبدًا.",

  editorTitle: "أنشئ هدية عيد ميلاد",
  editorSub: "املأ التفاصيل على راحتك، شاهد المعاينة، ثم شارك الرابط.",
  editTitle: "تعديل هديتك",
  secRecipient: "صاحب العيد",
  secWhen: "موعد عيد الميلاد",
  secMessages: "الرسائل",
  secMessageFrames: "إطارات الرسائل",
  secMedia: "الصور والفيديوهات",
  secMusic: "موسيقى عيد الميلاد",
  secSurprise: "المفاجأة المخفية",
  secAppearance: "المظهر",
  secPreview: "المعاينة",

  theirName: "الاسم",
  nickname: "اسم الدلع (اختياري)",
  date: "التاريخ",
  time: "الوقت",
  timeZone: "المنطقة الزمنية",
  giftLanguage: "لغة الهدية",
  giftLanguageHint: "ستظهر صفحة عيد الميلاد بهذه اللغة.",
  whenHint: "لن يظهر أي شيء قبل هذه اللحظة بالضبط.",
  mainMessage: "رسالة عيد الميلاد الأساسية",
  mainMessagePh: "كل عام وأنت بخير…\n\nاكتب ما لا تستطيع قوله بصوت عالٍ. 💛",
  extraNote: "ملاحظة إضافية",
  addNote: "أضف ملاحظة أخرى",
  finalMessage: "الرسالة الأخيرة",
  finalMessagePh: "صُنعت بحب ❤️",
  hiddenMessage: "الرسالة المخفية",
  hiddenMessagePh: "سرٌّ لن يجده إلا إذا فتح صندوق الهدية 🎁",
  hiddenMedia: "صورة أو فيديو مخفي (اختياري)",
  caption: "تعليق (اختياري)",

  addPhotos: "أضف صورًا",
  addVideos: "أضف فيديوهات",
  addMusic: "أضف موسيقى",
  replaceMusic: "استبدل الموسيقى",
  addMedia: "أضف صورة أو فيديو",
  mediaHint: "تظهر واحدة تلو الأخرى بهذا الترتيب.",
  musicHint: "تبدأ عند الاحتفال فقط، ولا تعمل أثناء العد التنازلي.",
  playMusicInGift: "تشغيل الموسيقى في الهدية",
  removeMusic: "حذف الموسيقى",
  remove: "حذف",
  moveUp: "تحريك لأعلى",
  moveDown: "تحريك لأسفل",
  uploading: "جارٍ الرفع…",

  theme: "النمط",
  accent: "اللون المميز",
  frameDesign: "تصميم الإطار",
  frameColor: "لون الإطار",
  framePreviewMessage: "ستظهر رسالتك هنا",
  decorations: "الزينة",
  decorationsHint: "زينة متحركة حقيقية في صفحة عيد الميلاد.",

  previewGift: "معاينة الهدية",
  previewCelebration: "معاينة الاحتفال",
  closePreview: "إغلاق المعاينة",
  restart: "إعادة",
  skipCountdown: "تخطي العد التنازلي",
  saveChanges: "حفظ التعديلات",
  createGiftBtn: "إنشاء الهدية",
  saving: "جارٍ الحفظ…",
  copyLink: "نسخ الرابط",
  copied: "تم النسخ",
  publicLink: "رابط الهدية العام",
  publicLinkHint: "أرسل هذا الرابط لصاحب عيد الميلاد.",
  privateLink: "رابط التعديل الخاص بك",
  privateLinkHint: "احتفظ به لنفسك، فهو الطريقة الوحيدة للعودة وتعديل الهدية.",
  openGift: "افتح الهدية",
  back: "رجوع",

  errName: "من فضلك أضف اسم صاحب عيد الميلاد",
  errMessage: "من فضلك اكتب رسالة عيد الميلاد الأساسية",
  errUpload: "فشل الرفع. حاول مرة أخرى.",
  errFormat: "نوع الملف غير مدعوم.",
  errTooBig: "الملف كبير جدًا (الحد ٢٥ ميغابايت).",
  errSave: "تعذر حفظ الهدية.",
  errLoad: "تعذر تحميل هذه الهدية.",
  savedDraft: "تمت استعادة المسودة",
  giftSaved: "هدية عيد الميلاد جاهزة 🎁",
  giftUpdated: "تم تحديث الهدية",
  mediaAdded: "تمت الإضافة",

  expIntroTitle: "هناك شيء حُضِّر من أجلك",
  expIntroSub: "خذ لحظة هادئة، وشغّل الصوت إن أمكن.",
  begin: "ابدأ",
  waitingTitle: "شيء مميز في انتظارك…",
  waitingSub: "ستُفتح هذه المفاجأة تلقائيًا في اللحظة المناسبة تمامًا.",
  days: "يوم",
  hours: "ساعة",
  mins: "دقيقة",
  secs: "ثانية",
  happyBirthday: "عيد ميلاد سعيد",
  readMessage: "اقرأ رسالتك",
  dear: "عزيزي",
  seeMemories: "شاهد ذكرياتنا",
  memories: "ذكريات",
  continueBtn: "متابعة",
  surpriseTitle: "مفاجأة صغيرة لك",
  tapToOpen: "اضغط على صندوق الهدية",
  lastMoment: "لحظة أخيرة",
  watchAgain: "شاهدها مرة أخرى",
  playMusic: "تشغيل موسيقى عيد الميلاد",
  musicOn: "الموسيقى تعمل",
  musicOff: "الموسيقى متوقفة",
  exit: "خروج",
  next: "التالي",
  previous: "السابق",
  notFound: "هذا الرابط غير موجود.",
  loadError: "تعذر فتح هذه المفاجأة الآن.",
  preview: "معاينة",

  myGifts: "هداياي",
  myGiftsSub: "كل الهدايا التي أنشأتها، محفوظة في السحابة.",
  myGiftsEmpty: "لم تنشئ أي هدية بعد.",
  editGift: "تعديل",
  loadingTxt: "جارٍ التحميل…",
  birthdayOn: "عيد الميلاد",
};

const DICTS: Record<Lang, Dict> = { en, ar };

export type TKey = keyof Dict;

export function translator(lang: Lang) {
  const dict = DICTS[lang] ?? en;
  return (key: TKey) => dict[key] ?? en[key];
}

const STORAGE_KEY = "lumiere.lang";

/** UI language for the creator side, remembered in the browser. */
export function useAppLanguage() {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "ar" || stored === "en") setLangState(stored);
    } catch {
      /* ignore */
    }
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  return { lang, setLang, t: translator(lang), dir: dirOf(lang) };
}
