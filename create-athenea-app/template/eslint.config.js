import js from '@eslint/js'
import prettier from 'eslint-plugin-prettier'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
	js.configs.recommended,
	{
		files: [
			'electron.vite.config.js',
			'vitest.config.js',
			'tailwind.config.js',
			'postcss.config.js',
			'src/main/**/*.js',
			'src/preload/**/*.js',
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
			},
		},
		rules: {
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
			},
		},
		plugins: {
			'react-hooks': reactHooks,
			prettier,
		},
		rules: {
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',
			// Style options live in .prettierrc so JSX files checked by
			// `npm run lint` use the same formatting rules as `npm run format`.
			'prettier/prettier': 'error',
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
