import { chai, vi } from 'vitest'
import chaidom from 'chai-dom'

chai.use(chaidom)

vi.mock('$app/env', () => ({
  browser: 'window' in globalThis,
}))
