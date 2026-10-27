import { http } from '@/shared/api/http'

import { overviewSchema, type Overview } from '../model/overview.schemas'

export const overviewApi = {
  get: (signal?: AbortSignal): Promise<Overview> =>
    http.get('/admin/overview', overviewSchema, { signal }),
}
