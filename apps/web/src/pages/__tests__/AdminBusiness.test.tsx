import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AdminBusiness from '../AdminBusiness'
import * as api from '../../lib/api'

vi.mock('../../lib/api',()=>({
 adminListBillingPlans:vi.fn(),adminSaveBillingPlan:vi.fn(),adminListSupportTickets:vi.fn(),adminSaveSupportTicket:vi.fn(),adminListCmsPosts:vi.fn(),adminSaveCmsPost:vi.fn(),errorMessage:(e:unknown)=>String(e),
}))
beforeEach(()=>{vi.clearAllMocks();vi.mocked(api.adminListBillingPlans).mockResolvedValue([]);vi.mocked(api.adminListSupportTickets).mockResolvedValue([]);vi.mocked(api.adminListCmsPosts).mockResolvedValue([])})

describe('admin business operations',()=>{
 it('creates a persisted billing plan',async()=>{vi.mocked(api.adminSaveBillingPlan).mockResolvedValue({id:1,name:'Chambers',monthly_price:12000,currency:'PKR',features:['10 cases'],active:true,created_at:''});render(<MemoryRouter initialEntries={['/admin/billing']}><AdminBusiness/></MemoryRouter>);fireEvent.click(await screen.findByRole('button',{name:'New plan'}));fireEvent.change(screen.getByLabelText('Plan name'),{target:{value:'Chambers'}});fireEvent.change(screen.getByLabelText('Monthly price'),{target:{value:'12000'}});fireEvent.click(screen.getByRole('button',{name:'Save'}));await waitFor(()=>expect(api.adminSaveBillingPlan).toHaveBeenCalled())})
 it('shows saved support tickets',async()=>{vi.mocked(api.adminListSupportTickets).mockResolvedValue([{id:2,requester_email:'client@example.com',subject:'Upload help',description:'Image failed',priority:'High',status:'Open',created_at:'2026-10-05T00:00:00Z'}]);render(<MemoryRouter initialEntries={['/admin/support']}><AdminBusiness/></MemoryRouter>);expect(await screen.findByText('Upload help')).toBeInTheDocument()})
 it('shows saved CMS posts',async()=>{vi.mocked(api.adminListCmsPosts).mockResolvedValue([{id:3,title:'Court guide',slug:'court-guide',excerpt:'Guide',body:'Body',status:'Draft',created_at:'',updated_at:'2026-10-05T00:00:00Z'}]);render(<MemoryRouter initialEntries={['/admin/cms']}><AdminBusiness/></MemoryRouter>);expect(await screen.findByText('Court guide')).toBeInTheDocument()})
})
