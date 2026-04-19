import { createClockActions } from './main'
import type { AppModule } from '../_shared/app-types'

export const app: AppModule = {
  id: 'clock',
  name: 'ER Clock',
  connectLabel: 'Connect',
  actionLabel: 'Update Time',
  initialStatus: 'Clock ready',
  createActions: createClockActions,
}

export default app