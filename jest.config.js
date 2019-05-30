module.exports =  {
  'testURL': 'http://localhost:8080',
  'moduleFileExtensions': [
    'js',
    'jsx',
    'json',
  ],
  'moduleDirectories': [
    'node_modules',
  ],
  'moduleNameMapper': {
    // '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
    '\\.(css|less)$': 'identity-obj-proxy',
    '\\.(svg)$': '<rootDir>/svgTransform.js',
  },
  'collectCoverageFrom': [
    'src/**/*.{js,jsx}',
  ],

  modulePathIgnorePatterns: ['__data__'],
  'setupTestFrameworkScriptFile': './setupTestFrameworkScriptFile.js',
};
