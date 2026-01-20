import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          type: 'holding' | 'company' | 'department'
          parent_id: string | null
          owner_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'holding' | 'company' | 'department'
          parent_id?: string | null
          owner_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'holding' | 'company' | 'department'
          parent_id?: string | null
          owner_id?: string
          created_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          job_title: string | null
          owner_id: string
          organization_id: string | null
          status: string
          lead_source: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          job_title?: string | null
          owner_id: string
          organization_id?: string | null
          status?: string
          lead_source?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          job_title?: string | null
          owner_id?: string
          organization_id?: string | null
          status?: string
          lead_source?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      companies: {
        Row: {
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
        Insert: {
          id?: string
          name: string
          industry?: string | null
          size?: string | null
          website?: string | null
          phone?: string | null
          address?: string | null
          owner_id: string
          organization_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          industry?: string | null
          size?: string | null
          website?: string | null
          phone?: string | null
          address?: string | null
          owner_id?: string
          organization_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      deals: {
        Row: {
          id: string
          title: string
          value: number
          stage: string
          probability: number
          contact_id: string | null
          company_id: string | null
          owner_id: string
          expected_close_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          value: number
          stage: string
          probability?: number
          contact_id?: string | null
          company_id?: string | null
          owner_id: string
          expected_close_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          value?: number
          stage?: string
          probability?: number
          contact_id?: string | null
          company_id?: string | null
          owner_id?: string
          expected_close_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          status: string
          start_date: string | null
          end_date: string | null
          budget: number | null
          contact_id: string | null
          company_id: string | null
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          status?: string
          start_date?: string | null
          end_date?: string | null
          budget?: number | null
          contact_id?: string | null
          company_id?: string | null
          owner_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          status?: string
          start_date?: string | null
          end_date?: string | null
          budget?: number | null
          contact_id?: string | null
          company_id?: string | null
          owner_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      project_tasks: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          status: string
          priority: string
          assignee_id: string | null
          due_date: string | null
          estimated_hours: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          status?: string
          priority?: string
          assignee_id?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          status?: string
          priority?: string
          assignee_id?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      activities: {
        Row: {
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
        Insert: {
          id?: string
          type: 'call' | 'email' | 'meeting' | 'task' | 'note'
          subject: string
          description?: string | null
          due_date?: string | null
          completed_at?: string | null
          contact_id?: string | null
          company_id?: string | null
          deal_id?: string | null
          project_id?: string | null
          owner_id: string
          created_at?: string
        }
        Update: {
          id?: string
          type?: 'call' | 'email' | 'meeting' | 'task' | 'note'
          subject?: string
          description?: string | null
          due_date?: string | null
          completed_at?: string | null
          contact_id?: string | null
          company_id?: string | null
          deal_id?: string | null
          project_id?: string | null
          owner_id?: string
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          type: 'todo' | 'call' | 'email' | 'meeting' | 'note'
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          due_date: string | null
          contact_id: string | null
          company_id: string | null
          deal_id: string | null
          project_id: string | null
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          type?: 'todo' | 'call' | 'email' | 'meeting' | 'note'
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          due_date?: string | null
          contact_id?: string | null
          company_id?: string | null
          deal_id?: string | null
          project_id?: string | null
          owner_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          type?: 'todo' | 'call' | 'email' | 'meeting' | 'note'
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          due_date?: string | null
          contact_id?: string | null
          company_id?: string | null
          deal_id?: string | null
          project_id?: string | null
          owner_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
