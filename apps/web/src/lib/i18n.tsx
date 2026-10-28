import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type Language = 'en' | 'ur'

const STORAGE_KEY = 'wukalaw-language'

const urdu: Record<string, string> = {
  'English': 'English',
  'Urdu': 'اردو',
  'Switch to English': 'انگریزی میں تبدیل کریں',
  'Switch to Urdu': 'اردو میں تبدیل کریں',
  'AI Legal Intelligence': 'اے آئی قانونی ذہانت',
  'Main': 'مرکزی',
  'Overview': 'جائزہ',
  'Dashboard': 'ڈیش بورڈ',
  'Clients': 'مؤکلین',
  'Calendar': 'کیلنڈر',
  'Task Board': 'ٹاسک بورڈ',
  'Case Work': 'مقدمے کا کام',
  'Case Management': 'مقدمات کا انتظام',
  'Case Workspace': 'مقدمے کی ورک اسپیس',
  'Hearings': 'سماعتیں',
  'Documents': 'دستاویزات',
  'Evidence': 'ثبوت',
  'AI Intelligence': 'اے آئی ذہانت',
  'Legal Research': 'قانونی تحقیق',
  'Court Prediction': 'عدالتی جائزہ',
  'Similar Cases': 'ملتے جلتے مقدمات',
  'AI Assistant': 'اے آئی معاون',
  'Strategy Builder': 'حکمتِ عملی تیار کریں',
  'Insights': 'تجزیات',
  'Timeline': 'ٹائم لائن',
  'Reports': 'رپورٹس',
  'Report Generator': 'رپورٹ بنائیں',
  'Analytics': 'تجزیات',
  'Team & Comms': 'ٹیم اور رابطہ',
  'Messages': 'پیغامات',
  'Team': 'ٹیم',
  'Notifications': 'اطلاعات',
  'Account': 'اکاؤنٹ',
  'Billing': 'بلنگ',
  'Profile': 'پروفائل',
  'Settings': 'ترتیبات',
  'My Cases': 'میرے مقدمات',
  'Request a Case': 'مقدمے کی درخواست',
  'Search': 'تلاش',
  'Case': 'مقدمہ',
  'Upload Documents': 'دستاویزات اپ لوڈ کریں',
  'My Documents': 'میری دستاویزات',
  'AI Summary': 'اے آئی خلاصہ',
  'Explainable AI': 'قابلِ وضاحت اے آئی',
  'Downloads': 'ڈاؤن لوڈز',
  'Communication': 'رابطہ',
  'System Analytics': 'سسٹم تجزیات',
  'System Health': 'سسٹم کی حالت',
  'Audit Logs': 'آڈٹ لاگز',
  'Users': 'صارفین',
  'All Users': 'تمام صارفین',
  'Lawyers': 'وکلاء',
  'Roles & Permissions': 'کردار اور اجازتیں',
  'AI Platform': 'اے آئی پلیٹ فارم',
  'AI Models': 'اے آئی ماڈلز',
  'Datasets': 'ڈیٹا سیٹس',
  'Knowledge Base': 'علمی ذخیرہ',
  'Operations': 'آپریشنز',
  'Backup & Recovery': 'بیک اپ اور بحالی',
  'Business': 'کاروبار',
  'Billing & Plans': 'بلنگ اور منصوبے',
  'Support Tickets': 'سپورٹ ٹکٹس',
  'Blog & CMS': 'بلاگ اور سی ایم ایس',
  'Config': 'کنفیگریشن',
  'Platform Settings': 'پلیٹ فارم ترتیبات',
  'Client portal': 'کلائنٹ پورٹل',
  'Lawyer portal': 'وکیل پورٹل',
  'Admin portal': 'ایڈمن پورٹل',
  'System Administrator': 'سسٹم ایڈمنسٹریٹر',
  'Client Portal': 'کلائنٹ پورٹل',
  'Legal Professional': 'قانونی ماہر',
  'Collapse': 'سکیڑیں',
  'Sign out': 'سائن آؤٹ',
  'Case Detail': 'مقدمے کی تفصیل',
  'Document Detail': 'دستاویز کی تفصیل',
  'Search cases, docs, AI...': 'مقدمات، دستاویزات اور اے آئی تلاش کریں۔۔۔',
  'Toggle color theme': 'رنگوں کی تھیم تبدیل کریں',
  'Features': 'خصوصیات',
  'Solutions': 'حل',
  'Practice Areas': 'قانونی شعبے',
  'Pricing': 'قیمتیں',
  'About': 'تعارف',
  'Sign in': 'سائن اِن',
  'Sign in as': 'بطور سائن اِن کریں',
  'Get Started': 'شروع کریں',
  'Platform': 'پلیٹ فارم',
  'Company': 'کمپنی',
  'Legal': 'قانونی',
  'Blog': 'بلاگ',
  'Careers': 'ملازمتیں',
  'Contact': 'رابطہ',
  'Privacy Policy': 'رازداری کی پالیسی',
  'Terms of Service': 'استعمال کی شرائط',
  'Security': 'سیکیورٹی',
  'FAQ': 'عمومی سوالات',
  'All systems operational': 'تمام نظام درست کام کر رہے ہیں',
  'Welcome back': 'خوش آمدید',
  'Choose your portal, then sign in to your account.': 'اپنا پورٹل منتخب کریں، پھر اپنے اکاؤنٹ میں سائن اِن کریں۔',
  'Email address': 'ای میل ایڈریس',
  'Password': 'پاس ورڈ',
  'Show password': 'پاس ورڈ دکھائیں',
  'Hide password': 'پاس ورڈ چھپائیں',
  'Choose a portal to continue': 'جاری رکھنے کے لیے پورٹل منتخب کریں',
  'Signing in…': 'سائن اِن ہو رہا ہے۔۔۔',
  'No account?': 'اکاؤنٹ نہیں ہے؟',
  'Create one': 'نیا اکاؤنٹ بنائیں',
  'Create your account': 'اپنا اکاؤنٹ بنائیں',
  "Start using wukaLAW's explainable AI legal intelligence.": 'wukaLAW کی قابلِ وضاحت اے آئی قانونی ذہانت استعمال کرنا شروع کریں۔',
  'Full name': 'پورا نام',
  'At least 8 characters': 'کم از کم 8 حروف',
  'Creating account…': 'اکاؤنٹ بنایا جا رہا ہے۔۔۔',
  'Create Account': 'اکاؤنٹ بنائیں',
  'Already have an account?': 'پہلے سے اکاؤنٹ موجود ہے؟',
  'Client': 'کلائنٹ',
  'Lawyer': 'وکیل',
  'Admin': 'ایڈمن',
  'Choose your portal': 'اپنا پورٹل منتخب کریں',
  'wukaLAW AI Assistant': 'wukaLAW اے آئی معاون',
  'Answers from your case documents only': 'جوابات صرف آپ کے مقدمے کی دستاویزات سے',
  'Answers from your document library': 'جوابات آپ کی دستاویزات کی لائبریری سے',
  'What is my case about?': 'میرا مقدمہ کس بارے میں ہے؟',
  'What documents have been added to my case?': 'میرے مقدمے میں کون سی دستاویزات شامل کی گئی ہیں؟',
  'What happens next in my case?': 'میرے مقدمے میں اگلا مرحلہ کیا ہے؟',
  'Are there any upcoming deadlines?': 'کیا کوئی آنے والی آخری تاریخ ہے؟',
  'What is the main issue in my uploaded documents?': 'میری اپ لوڈ کردہ دستاویزات میں بنیادی مسئلہ کیا ہے؟',
  'Summarize the key facts across my case files': 'میرے مقدمے کی فائلوں کے اہم حقائق کا خلاصہ دیں',
  'What legal points appear in my documents?': 'میری دستاویزات میں کون سے قانونی نکات موجود ہیں؟',
  'What was the outcome described in my documents?': 'میری دستاویزات میں کیا نتیجہ بیان کیا گیا ہے؟',
  'Questions are answered from your uploaded documents, with sources and confidence.': 'سوالات کے جواب آپ کی اپ لوڈ کردہ دستاویزات، حوالوں اور اعتماد کی سطح کے ساتھ دیے جاتے ہیں۔',
}

type I18nContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  toggleLanguage: () => void
  t: (text: string) => string
  isRtl: boolean
}

const DEFAULT_I18N: I18nContextValue = {
  language: 'en',
  setLanguage: () => undefined,
  toggleLanguage: () => undefined,
  t: (text) => text,
  isRtl: false,
}

const I18nContext = createContext<I18nContextValue>(DEFAULT_I18N)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    return saved === 'ur' ? 'ur' : 'en'
  })

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language)
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr'
  }, [language])

  const value = useMemo<I18nContextValue>(() => ({
    language,
    setLanguage,
    toggleLanguage: () => setLanguage((current) => current === 'en' ? 'ur' : 'en'),
    t: (text) => language === 'ur' ? (urdu[text] ?? text) : text,
    isRtl: language === 'ur',
  }), [language])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}

