import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['**/dist/**'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['perf/**/*.js'],
    languageOptions: {
      globals: { __ENV: 'readonly', __ITER: 'readonly' },
    },
  },
)
