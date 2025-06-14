const i18n = {
  t: (key: string) => key,
  changeLanguage: jest.fn(),
  language: 'en',
  languages: ['en', 'ru'],
  exists: jest.fn(),
  use: jest.fn().mockReturnThis(),
  init: jest.fn().mockResolvedValue(undefined),
};

export default i18n; 