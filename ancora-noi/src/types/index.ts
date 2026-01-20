export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'admin' | 'manager' | 'member' | 'viewer'
  created_at: string
}

export interface Organization {
  id: string
  name: string
  type: 'holding' | 'company' | 'department'
  parent_id: string | null
  owner_id: string
  created_at: string
}

export interface Contact {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  job_title: string | null
  owner_id: string
  organization_id: string | null
  status: 'lead' | 'prospect' | 'customer' | 'inactive'
  lead_source: string | null
  notes: string | null
  created_at: string
  updated_at: string
  company?: Company
}

export interface Company {
  id: string
  name: string
  industry: string | null
  size: string | null
  website: string | null
  phone: string | null
  address: string | null
  owner_id: string
  organization_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Deal {
  id: string
  title: string
  value: number
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  probability: number
  contact_id: string | null
  company_id: string | null
  owner_id: string
  expected_close_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
  contact?: Contact
  company?: Company
}

export interface Project {
  id: string
  name: string
  description: string | null
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled'
  start_date: string | null
  end_date: string | null
  budget: number | null
  contact_id: string | null
  company_id: string | null
  owner_id: string
  created_at: string
  updated_at: string
  contact?: Contact
  company?: Company
  tasks?: ProjectTask[]
}

export interface ProjectTask {
  id: string
  project_id: string
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignee_id: string | null
  due_date: string | null
  estimated_hours: number | null
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  type: 'call' | 'email' | 'meeting' | 'task' | 'note'
  subject: string
  description: string | null
  due_date: string | null
  completed_at: string | null
  contact_id: string | null
  company_id: string | null
  deal_id: string | null
  project_id: string | null
  owner_id: string
  created_at: string
}

export const DEAL_STAGES = [
  { id: 'prospecting', label: 'Prospecting', probability: 10 },
  { id: 'qualification', label: 'Qualification', probability: 25 },
  { id: 'proposal', label: 'Proposal', probability: 50 },
  { id: 'negotiation', label: 'Negotiation', probability: 75 },
  { id: 'closed_won', label: 'Closed Won', probability: 100 },
  { id: 'closed_lost', label: 'Closed Lost', probability: 0 },
] as const

export const PROJECT_STATUSES = [
  { id: 'planning', label: 'Planning', color: 'bg-gray-100 text-gray-700' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  { id: 'on_hold', label: 'On Hold', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'completed', label: 'Completed', color: 'bg-green-100 text-green-700' },
  { id: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700' },
] as const

export const TASK_STATUSES = [
  { id: 'todo', label: 'To Do', color: 'bg-gray-100 text-gray-700' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  { id: 'review', label: 'Review', color: 'bg-purple-100 text-purple-700' },
  { id: 'done', label: 'Done', color: 'bg-green-100 text-green-700' },
] as const

export const TASK_PRIORITIES = [
  { id: 'low', label: 'Low', color: 'text-gray-500' },
  { id: 'medium', label: 'Medium', color: 'text-blue-500' },
  { id: 'high', label: 'High', color: 'text-orange-500' },
  { id: 'urgent', label: 'Urgent', color: 'text-red-500' },
] as const

export const CONTACT_STATUSES = [
  { id: 'lead', label: 'Lead', color: 'bg-blue-100 text-blue-700' },
  { id: 'prospect', label: 'Prospect', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'customer', label: 'Customer', color: 'bg-green-100 text-green-700' },
  { id: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-700' },
] as const

export const TASK_TYPES = [
  { id: 'todo', label: 'To Do', icon: 'check' },
  { id: 'call', label: 'Call', icon: 'phone' },
  { id: 'email', label: 'Email', icon: 'mail' },
  { id: 'meeting', label: 'Meeting', icon: 'users' },
  { id: 'note', label: 'Note', icon: 'file-text' },
] as const

export const ACTIVITY_TYPES = [
  { id: 'call', label: 'Call', icon: 'phone' },
  { id: 'email', label: 'Email', icon: 'mail' },
  { id: 'meeting', label: 'Meeting', icon: 'users' },
  { id: 'task', label: 'Task', icon: 'check' },
  { id: 'note', label: 'Note', icon: 'file-text' },
] as const
