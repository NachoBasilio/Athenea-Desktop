import { defineConfig } from 'vitest/config'
import preact from '@preact/preset-vite'
import { resolve } from 'path'

export default defineConfig({
	plugins: [preact()],
	resolve: {
		alias: {
			'@': resolve(__dirname, 'src/renderer/src'),
		},
	},
	test: {
		environment: 'jsdom',
		include: ['src/renderer/**/*.{test,spec}.{js,jsx}'],
	},
})
