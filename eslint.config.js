import js from '@eslint/js'
import tsParser from '@typescript-eslint/parser'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import prettier from 'eslint-plugin-prettier'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
	js.configs.recommended,
	{
		files: [
			'electron.vite.config.js',
			'vitest.config.js',
			'scripts/**/*.cjs',
			'src/main/**/*.js',
			'src/preload/**/*.js',
			'create-athenea-app/bin/**/*.js',
			'create-athenea-app/template/electron.vite.config.js',
			'create-athenea-app/template/vitest.config.js',
			'create-athenea-app/template/src/main/**/*.js',
			'create-athenea-app/template/src/preload/**/*.js',
		],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				console: 'readonly',
				process: 'readonly',
				__dirname: 'readonly',
				require: 'readonly',
				Buffer: 'readonly',
				__APP_TITLE_JS_STRING__: 'readonly',
				__APP_APP_ID__: 'readonly',
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
		files: ['**/*.jsx'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
			globals: {
				window: 'readonly',
				document: 'readonly',
				console: 'readonly',
				fetch: 'readonly',
				setInterval: 'readonly',
				clearInterval: 'readonly',
				location: 'readonly',
				URLSearchParams: 'readonly',
				__APP_TITLE_JS_STRING__: 'readonly',
			},
		},
		plugins: {
			'react-hooks': reactHooks,
			prettier,
		},
		rules: {
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
			'no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					// Component imports (PascalCase) are only referenced through JSX tags,
					// which the base parser's scope analysis does not track as a usage.
					varsIgnorePattern: '^[A-Z_]',
				},
			],
		},
	},
	{
		ignores: ['**/dist/', '**/node_modules/', '**/out/', '**/release/'],
	},
]
