import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import AdminBackup from '../AdminBackup'
import * as api from '../../lib/api'

vi.mock('../../lib/api',()=>({adminListBackups:vi.fn(),adminCreateBackup:vi.fn(),adminDownloadBackup:vi.fn(),errorMessage:(e:unknown)=>String(e)}))
beforeEach(()=>{vi.clearAllMocks();vi.mocked(api.adminListBackups).mockResolvedValue([])})
it('creates a real database snapshot',async()=>{vi.mocked(api.adminCreateBackup).mockResolvedValue({filename:'wakulaw-test.sqlite3',size_bytes:100,created_at:'',storage:'local'});render(<AdminBackup/>);fireEvent.click(await screen.findByRole('button',{name:'Create snapshot'}));await waitFor(()=>expect(api.adminCreateBackup).toHaveBeenCalled())})
