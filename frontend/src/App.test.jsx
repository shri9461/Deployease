import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App Component', () => {
  it('renders the title', () => {
    render(<App />)
    const titles = screen.getAllByText(/DeployEase/i)
    expect(titles.length).toBeGreaterThan(0)
  })

  it('renders the initial loading state', () => {
    render(<App />)
    expect(screen.getByText(/Initializing connection/i)).toBeInTheDocument()
  })
})
