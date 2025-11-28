module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx,mdx}',
    './First-step-admin/src/**/*.{js,jsx,ts,tsx,mdx}'
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: ['light', 'dark'],
  },
};
