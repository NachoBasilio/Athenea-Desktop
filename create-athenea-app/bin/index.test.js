// @vitest-environment node

import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'
import { transform } from 'esbuild'
import { afterEach, describe, expect, it } from 'vitest'

const execFileAsync = promisify(execFile)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const cliPath = path.join(__dirname, 'index.js')
const tempDirs = []

function evaluateExpression(source, pattern) {
	const match = source.match(pattern)
	expect(match?.groups?.expression).toBeTypeOf('string')
	return Function(`"use strict"; return (${match.groups.expression});`)()
}

async function scaffoldApp(appName) {
	const workspaceDir = await fs.mkdtemp(
		path.join(os.tmpdir(), 'create-athenea-app-test-'),
	)
	tempDirs.push(workspaceDir)

	await execFileAsync(process.execPath, [cliPath, appName, '--no-install'], {
		cwd: workspaceDir,
	})

	const [projectDirName] = await fs.readdir(workspaceDir)
	expect(projectDirName).toBeTypeOf('string')
	return path.join(workspaceDir, projectDirName)
}

afterEach(async () => {
	await Promise.all(
		tempDirs.splice(0).map((dirPath) =>
			fs.rm(dirPath, { recursive: true, force: true }),
		),
	)
})

describe('create-athenea-app title replacement', () => {
	it('escapes HTML and JSX generation for special characters', async () => {
		const appName = `A < B & "double" 'single'`
		const projectDir = await scaffoldApp(appName)

		const html = await fs.readFile(
			path.join(projectDir, 'src', 'renderer', 'index.html'),
			'utf8',
		)
		const dom = new JSDOM(html)
		expect(dom.window.document.querySelector('title')?.textContent).toBe(appName)
		expect(html).toContain('&lt;')
		expect(html).toContain('&amp;')

		const readme = await fs.readFile(path.join(projectDir, 'README.md'), 'utf8')
		expect(readme.split('\n')[0]).toBe(`# A \\< B & "double" 'single'`)
		expect(readme).not.toContain('&lt;')
		expect(readme).not.toContain('&#39;')

		const homeRoute = await fs.readFile(
			path.join(
				projectDir,
				'src',
				'renderer',
				'src',
				'routes',
				'Home',
				'Home.jsx',
			),
			'utf8',
		)
		expect(homeRoute).not.toContain('__APP_TITLE__')
		expect(homeRoute).not.toContain('__APP_TITLE_JS_STRING__')
		expect(
			evaluateExpression(homeRoute, /¡Bienvenido a \{(?<expression>.+?)\}!/s),
		).toBe(appName)
		await expect(transform(homeRoute, { loader: 'jsx', format: 'esm' })).resolves
			.toMatchObject({ code: expect.any(String) })
	})

	it('preserves newline-heavy names without breaking generated files', async () => {
		const appName = 'Line one\nLine two <tag> "quoted"'
		const projectDir = await scaffoldApp(appName)

		const html = await fs.readFile(
			path.join(projectDir, 'src', 'renderer', 'index.html'),
			'utf8',
		)
		const dom = new JSDOM(html)
		expect(dom.window.document.querySelector('title')?.textContent).toBe(appName)
		expect(html).toContain('&#10;')

		const readme = await fs.readFile(path.join(projectDir, 'README.md'), 'utf8')
		expect(readme.split('\n')[0]).toBe('# Line one Line two \\<tag\\> "quoted"')
		expect(readme).not.toContain('&#10;')

		const mainProcessEntry = await fs.readFile(
			path.join(projectDir, 'src', 'main', 'index.js'),
			'utf8',
		)
		expect(mainProcessEntry).not.toContain('__APP_TITLE_JS_STRING__')
		expect(
			evaluateExpression(
				mainProcessEntry,
				/title:\s*(?<expression>.+?),\s*\n\s*webPreferences:/s,
			),
		).toBe(appName)
		await expect(
			transform(mainProcessEntry, { loader: 'js', format: 'esm' }),
		).resolves.toMatchObject({ code: expect.any(String) })
	})
})
