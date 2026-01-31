import js from '@eslint/js'
import tsParser from '@typescript-eslint/parser'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import prettier from 'eslint-plugin-prettier'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
	js.configs.recommended,
	{
		files: ['electron.js', 'preload.cjs', 'vite.config.js'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				console: 'readonly',
				process: 'readonly',
				__dirname: 'readonly',
				require: 'readonly',
				Buffer: 'readonly',
			},
		},
		rules: {
			'no-undef': 'off',
		},
	},
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			parser: tsParser,
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				window: 'readonly',
				document: 'readonly',
				fetch: 'readonly',
				console: 'readonly',
				setInterval: 'readonly',
				clearInterval: 'readonly',
			},
			parserOptions: {
				project: './tsconfig.json',
			},
		},
		plugins: {
			'@typescript-eslint': typescriptEslint,
			prettier,
			'react-hooks': reactHooks,
		},
		rules: {
			...typescriptEslint.configs.recommended.rules,
			...typescriptEslint.configs['recommended-type-checked'].rules,

			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',

			'prettier/prettier': [
				'error',
				{
					singleQuote: true,
					semi: false,
					useTabs: true,
					tabWidth: 2,
				},
			],
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
				},
			],
			'no-undef': 'off',
		},
	},
	{
		ignores: ['**/dist/', '**/node_modules/', '**/release/'],
	},
]
