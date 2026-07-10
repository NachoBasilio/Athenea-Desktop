import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/preact'
import { Counter } from './Counter'

afterEach(() => {
	cleanup()
})

describe('Counter', () => {
	it('renders the initial count', () => {
		render(<Counter />)
		expect(screen.getByText('0')).toBeTruthy()
	})

	it('increments and decrements the count', () => {
		render(<Counter />)
		fireEvent.click(screen.getByText('+'))
		expect(screen.getByText('1')).toBeTruthy()
		fireEvent.click(screen.getByText('-'))
		expect(screen.getByText('0')).toBeTruthy()
	})
})
