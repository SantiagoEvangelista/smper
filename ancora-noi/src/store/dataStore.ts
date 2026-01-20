import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Contact, Company, Deal, Project, Activity, ProjectTask } from '@/types'

interface DataState {
  contacts: Contact[]
  companies: Company[]
  deals: Deal[]
  projects: Project[]
  activities: Activity[]
  projectTasks: ProjectTask[]
  loading: boolean
  setContacts: (contacts: Contact[]) => void
  setCompanies: (companies: Company[]) => void
  setDeals: (deals: Deal[]) => void
  setProjects: (projects: Project[]) => void
  setActivities: (activities: Activity[]) => void
  setProjectTasks: (tasks: ProjectTask[]) => void
  setLoading: (loading: boolean) => void
  fetchContacts: () => Promise<void>
  fetchCompanies: () => Promise<void>
  fetchDeals: () => Promise<void>
  fetchProjects: () => Promise<void>
  fetchActivities: (filters?: { contact_id?: string; company_id?: string; deal_id?: string; project_id?: string }) => Promise<void>
  fetchProjectTasks: (projectId: string) => Promise<void>
  addContact: (contact: Partial<Contact>) => Promise<void>
  updateContact: (id: string, contact: Partial<Contact>) => Promise<void>
  deleteContact: (id: string) => Promise<void>
  addCompany: (company: Partial<Company>) => Promise<void>
  updateCompany: (id: string, company: Partial<Company>) => Promise<void>
  deleteCompany: (id: string) => Promise<void>
  addDeal: (deal: Partial<Deal>) => Promise<void>
  updateDeal: (id: string, deal: Partial<Deal>) => Promise<void>
  deleteDeal: (id: string) => Promise<void>
  addProject: (project: Partial<Project>) => Promise<void>
  updateProject: (id: string, project: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  addActivity: (activity: Partial<Activity>) => Promise<void>
  updateActivity: (id: string, activity: Partial<Activity>) => Promise<void>
  deleteActivity: (id: string) => Promise<void>
  addProjectTask: (task: Partial<ProjectTask>) => Promise<void>
  updateProjectTask: (id: string, task: Partial<ProjectTask>) => Promise<void>
  deleteProjectTask: (id: string) => Promise<void>
  getContact: (id: string) => Contact | undefined
  getCompany: (id: string) => Company | undefined
  getDeal: (id: string) => Deal | undefined
  getProject: (id: string) => Project | undefined
}

export const useDataStore = create<DataState>((set, get) => ({
  contacts: [],
  companies: [],
  deals: [],
  projects: [],
  activities: [],
  projectTasks: [],
  loading: false,

  setContacts: (contacts) => set({ contacts }),
  setCompanies: (companies) => set({ companies }),
  setDeals: (deals) => set({ deals }),
  setProjects: (projects) => set({ projects }),
  setActivities: (activities) => set({ activities }),
  setProjectTasks: (projectTasks) => set({ projectTasks }),
  setLoading: (loading) => set({ loading }),

  fetchContacts: async () => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('contacts')
      .select('*, company:companies(*)')
      .order('created_at', { ascending: false })
    if (!error && data) {
      set({ contacts: data as Contact[] })
    }
    set({ loading: false })
  },

  fetchCompanies: async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name', { ascending: true })
    if (!error && data) {
      set({ companies: data as Company[] })
    }
  },

  fetchDeals: async () => {
    const { data, error } = await supabase
      .from('deals')
      .select('*, contact:contacts(*), company:companies(*)')
      .order('created_at', { ascending: false })
    if (!error && data) {
      set({ deals: data as Deal[] })
    }
  },

  fetchProjects: async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*, contact:contacts(*), company:companies(*)')
      .order('created_at', { ascending: false })
    if (!error && data) {
      set({ projects: data as Project[] })
    }
  },

  fetchActivities: async (filters) => {
    let query = supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.contact_id) {
      query = query.eq('contact_id', filters.contact_id)
    }
    if (filters?.company_id) {
      query = query.eq('company_id', filters.company_id)
    }
    if (filters?.deal_id) {
      query = query.eq('deal_id', filters.deal_id)
    }
    if (filters?.project_id) {
      query = query.eq('project_id', filters.project_id)
    }

    const { data, error } = await query
    if (!error && data) {
      set({ activities: data as Activity[] })
    }
  },

  fetchProjectTasks: async (projectId) => {
    const { data, error } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
    if (!error && data) {
      set({ projectTasks: data as ProjectTask[] })
    }
  },

  addContact: async (contact) => {
    const { error } = await supabase.from('contacts').insert(contact)
    if (!error) {
      await get().fetchContacts()
    }
  },

  updateContact: async (id, contact) => {
    const { error } = await supabase.from('contacts').update(contact).eq('id', id)
    if (!error) {
      await get().fetchContacts()
    }
  },

  deleteContact: async (id) => {
    const { error } = await supabase.from('contacts').delete().eq('id', id)
    if (!error) {
      await get().fetchContacts()
    }
  },

  addCompany: async (company) => {
    const { error } = await supabase.from('companies').insert(company)
    if (!error) {
      await get().fetchCompanies()
    }
  },

  updateCompany: async (id, company) => {
    const { error } = await supabase.from('companies').update(company).eq('id', id)
    if (!error) {
      await get().fetchCompanies()
    }
  },

  deleteCompany: async (id) => {
    const { error } = await supabase.from('companies').delete().eq('id', id)
    if (!error) {
      await get().fetchCompanies()
    }
  },

  addDeal: async (deal) => {
    const { error } = await supabase.from('deals').insert(deal)
    if (!error) {
      await get().fetchDeals()
    }
  },

  updateDeal: async (id, deal) => {
    const { error } = await supabase.from('deals').update(deal).eq('id', id)
    if (!error) {
      await get().fetchDeals()
    }
  },

  deleteDeal: async (id) => {
    const { error } = await supabase.from('deals').delete().eq('id', id)
    if (!error) {
      await get().fetchDeals()
    }
  },

  addProject: async (project) => {
    const { error } = await supabase.from('projects').insert(project)
    if (!error) {
      await get().fetchProjects()
    }
  },

  updateProject: async (id, project) => {
    const { error } = await supabase.from('projects').update(project).eq('id', id)
    if (!error) {
      await get().fetchProjects()
    }
  },

  deleteProject: async (id) => {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (!error) {
      await get().fetchProjects()
    }
  },

  addActivity: async (activity) => {
    const { error } = await supabase.from('activities').insert(activity)
    if (!error) {
      const filters: { contact_id?: string; company_id?: string; deal_id?: string; project_id?: string } = {}
      if (activity.contact_id) filters.contact_id = activity.contact_id
      if (activity.company_id) filters.company_id = activity.company_id
      if (activity.deal_id) filters.deal_id = activity.deal_id
      if (activity.project_id) filters.project_id = activity.project_id
      await get().fetchActivities(filters)
    }
  },

  updateActivity: async (id, activity) => {
    const { error } = await supabase.from('activities').update(activity).eq('id', id)
    if (!error) {
      await get().fetchActivities()
    }
  },

  deleteActivity: async (id) => {
    const { error } = await supabase.from('activities').delete().eq('id', id)
    if (!error) {
      await get().fetchActivities()
    }
  },

  addProjectTask: async (task) => {
    const { error } = await supabase.from('project_tasks').insert(task)
    if (!error && task.project_id) {
      await get().fetchProjectTasks(task.project_id)
    }
  },

  updateProjectTask: async (id, task) => {
    const { error } = await supabase.from('project_tasks').update(task).eq('id', id)
    if (!error) {
      const tasks = get().projectTasks
      if (tasks.length > 0) {
        await get().fetchProjectTasks(tasks[0].project_id)
      }
    }
  },

  deleteProjectTask: async (id) => {
    const tasks = get().projectTasks
    const task = tasks.find(t => t.id === id)
    const { error } = await supabase.from('project_tasks').delete().eq('id', id)
    if (!error && task) {
      await get().fetchProjectTasks(task.project_id)
    }
  },

  getContact: (id) => get().contacts.find(c => c.id === id),
  getCompany: (id) => get().companies.find(c => c.id === id),
  getDeal: (id) => get().deals.find(d => d.id === id),
  getProject: (id) => get().projects.find(p => p.id === id),
}))
