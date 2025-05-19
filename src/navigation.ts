import { getPermalink, getBlogPermalink, getAsset } from './utils/permalinks';

export const siteTitle = {
  'zh-TW': '台灣神明介紹',
  'en': 'Taiwanese Deities',
  'ja': '台湾の神様紹介'
};

export const headerData = {
  links: [
    {
      text: {
        'zh-TW': '神明介紹',
        'en': 'Deities',
        'ja': '神様紹介'
      },
      links: [
        {
          text: {
            'zh-TW': '道教神明',
            'en': 'Taoist Deities',
            'ja': '道教の神様'
          },
          href: getPermalink('/gods/taoism'),
        },
        {
          text: {
            'zh-TW': '佛教神明',
            'en': 'Buddhist Deities',
            'ja': '仏教の神様'
          },
          href: getPermalink('/gods/buddhism'),
        },
        {
          text: {
            'zh-TW': '民間信仰',
            'en': 'Folk Beliefs',
            'ja': '民間信仰'
          },
          href: getPermalink('/gods/folk'),
        },
        {
          text: {
            'zh-TW': '神明故事',
            'en': 'Deity Stories',
            'ja': '神様の物語'
          },
          href: getPermalink('/gods/stories'),
        },
      ],
    },
    {
      text: {
        'zh-TW': '廟宇巡禮',
        'en': 'Temples',
        'ja': '寺院巡り'
      },
      links: [
        {
          text: {
            'zh-TW': '北部廟宇',
            'en': 'North Taiwan',
            'ja': '北部の寺院'
          },
          href: getPermalink('/temples/north'),
        },
        {
          text: {
            'zh-TW': '中部廟宇',
            'en': 'Central Taiwan',
            'ja': '中部の寺院'
          },
          href: getPermalink('/temples/central'),
        },
        {
          text: {
            'zh-TW': '南部廟宇',
            'en': 'South Taiwan',
            'ja': '南部の寺院'
          },
          href: getPermalink('/temples/south'),
        },
        {
          text: {
            'zh-TW': '東部廟宇',
            'en': 'East Taiwan',
            'ja': '東部の寺院'
          },
          href: getPermalink('/temples/east'),
        },
      ],
        },
        {
      text: {
        'zh-TW': '信仰文化',
        'en': 'Culture',
        'ja': '信仰文化'
      },
      links: [
        {
          text: {
            'zh-TW': '祭祀禮儀',
            'en': 'Rituals',
            'ja': '祭祀儀式'
          },
          href: getPermalink('/culture/rituals'),
        },
        {
          text: {
            'zh-TW': '節慶活動',
            'en': 'Festivals',
            'ja': '祭り'
          },
          href: getPermalink('/culture/festivals'),
        },
        {
          text: {
            'zh-TW': '民間習俗',
            'en': 'Customs',
            'ja': '民間習俗'
          },
          href: getPermalink('/culture/customs'),
        },
        {
          text: {
            'zh-TW': '文化傳承',
            'en': 'Heritage',
            'ja': '文化継承'
          },
          href: getPermalink('/culture/heritage'),
        },
      ],
    },
    {
      text: {
        'zh-TW': '關於我們',
        'en': 'About',
        'ja': '私たちについて'
      },
      links: [
        {
          text: {
            'zh-TW': '網站介紹',
            'en': 'About Site',
            'ja': 'サイトについて'
          },
          href: getPermalink('/about'),
        },
        {
          text: {
            'zh-TW': '聯絡我們',
            'en': 'Contact',
            'ja': 'お問い合わせ'
          },
          href: getPermalink('/contact'),
        },
        {
          text: {
            'zh-TW': '常見問題',
            'en': 'FAQ',
            'ja': 'よくある質問'
          },
          href: getPermalink('/faq'),
        },
        {
          text: {
            'zh-TW': '隱私政策',
            'en': 'Privacy Policy',
            'ja': 'プライバシーポリシー'
          },
          href: getPermalink('/privacy'),
        }
      ]
    },
  ],
  actions: [{
    text: {
      'zh-TW': '聯絡我們',
      'en': 'Contact',
      'ja': 'お問い合わせ'
    },
    href: getPermalink('/contact')
  }],
};

export const footerData = {
  links: [
    {
      title: {
        'zh-TW': '神明介紹',
        'en': 'Deities',
        'ja': '神様紹介'
      },
      links: [
        {
          text: {
            'zh-TW': '道教神明',
            'en': 'Taoist Deities',
            'ja': '道教の神様'
          },
          href: getPermalink('/gods/taoism'),
        },
        {
          text: {
            'zh-TW': '佛教神明',
            'en': 'Buddhist Deities',
            'ja': '仏教の神様'
          },
          href: getPermalink('/gods/buddhism'),
        },
        {
          text: {
            'zh-TW': '民間信仰',
            'en': 'Folk Beliefs',
            'ja': '民間信仰'
          },
          href: getPermalink('/gods/folk'),
        },
        {
          text: {
            'zh-TW': '神明故事',
            'en': 'Deity Stories',
            'ja': '神様の物語'
          },
          href: getPermalink('/gods/stories'),
        },
      ],
        },
        {
      title: {
        'zh-TW': '廟宇巡禮',
        'en': 'Temples',
        'ja': '寺院巡り'
      },
      links: [
        {
          text: {
            'zh-TW': '北部廟宇',
            'en': 'North Taiwan',
            'ja': '北部の寺院'
          },
          href: getPermalink('/temples/north'),
        },
        {
          text: {
            'zh-TW': '中部廟宇',
            'en': 'Central Taiwan',
            'ja': '中部の寺院'
          },
          href: getPermalink('/temples/central'),
        },
        {
          text: {
            'zh-TW': '南部廟宇',
            'en': 'South Taiwan',
            'ja': '南部の寺院'
          },
          href: getPermalink('/temples/south'),
        },
        {
          text: {
            'zh-TW': '東部廟宇',
            'en': 'East Taiwan',
            'ja': '東部の寺院'
          },
          href: getPermalink('/temples/east'),
        },
      ],
    },
    {
      title: {
        'zh-TW': '信仰文化',
        'en': 'Culture',
        'ja': '信仰文化'
      },
      links: [
        {
          text: {
            'zh-TW': '祭祀禮儀',
            'en': 'Rituals',
            'ja': '祭祀儀式'
          },
          href: getPermalink('/culture/rituals'),
        },
        {
          text: {
            'zh-TW': '節慶活動',
            'en': 'Festivals',
            'ja': '祭り'
          },
          href: getPermalink('/culture/festivals'),
        },
        {
          text: {
            'zh-TW': '民間習俗',
            'en': 'Customs',
            'ja': '民間習俗'
          },
          href: getPermalink('/culture/customs'),
        },
        {
          text: {
            'zh-TW': '文化傳承',
            'en': 'Heritage',
            'ja': '文化継承'
          },
          href: getPermalink('/culture/heritage'),
        },
      ],
    },
    {
      title: {
        'zh-TW': '關於我們',
        'en': 'About',
        'ja': '私たちについて'
      },
      links: [
        {
          text: {
            'zh-TW': '網站介紹',
            'en': 'About Site',
            'ja': 'サイトについて'
          },
          href: getPermalink('/about'),
        },
        {
          text: {
            'zh-TW': '聯絡我們',
            'en': 'Contact',
            'ja': 'お問い合わせ'
          },
          href: getPermalink('/contact'),
        },
        {
          text: {
            'zh-TW': '常見問題',
            'en': 'FAQ',
            'ja': 'よくある質問'
          },
          href: getPermalink('/faq'),
        },
        {
          text: {
            'zh-TW': '隱私政策',
            'en': 'Privacy Policy',
            'ja': 'プライバシーポリシー'
          },
          href: getPermalink('/privacy'),
        },
      ],
    },
  ],
  secondaryLinks: [
    {
      text: {
        'zh-TW': '使用條款',
        'en': 'Terms of Use',
        'ja': '利用規約'
      },
      href: getPermalink('/terms'),
    },
    {
      text: {
        'zh-TW': '隱私政策',
        'en': 'Privacy Policy',
        'ja': 'プライバシーポリシー'
      },
      href: getPermalink('/privacy'),
    },
  ],
  socialLinks: [
    // { ariaLabel: 'Facebook', icon: 'tabler:brand-facebook', href: '#' },
    // { ariaLabel: 'Instagram', icon: 'tabler:brand-instagram', href: '#' },
    // { ariaLabel: 'Line', icon: 'tabler:brand-line', href: '#' },
    // { ariaLabel: 'RSS', icon: 'tabler:rss', href: getAsset('/rss.xml') },
  ],
  footNote: {
    'zh-TW': '台灣神明介紹網站 · 傳承台灣信仰文化',
    'en': 'Taiwanese Deities · Preserving Taiwan\'s Religious Heritage',
    'ja': '台湾の神様紹介サイト · 台湾の信仰文化を継承'
  },
};
