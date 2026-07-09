import { describe, it, expect } from 'vitest'
import { render, screen, cleanup } from '@testing-library/preact'
import { afterEach } from 'vitest'
import Home from './Home'

afterEach(() => {
	cleanup()
})

describe('Home', () => {
	it('renders the welcome title', () => {
		render(<Home />)
		expect(screen.getByText('¡Bienvenido!')).toBeTruthy()
	})
})
