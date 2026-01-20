-- Ancora Noi CRM Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES TABLE (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'manager', 'member', 'viewer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORGANIZATIONS TABLE (holding company structure)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT DEFAULT 'company' CHECK (type IN ('holding', 'company', 'department')),
    parent_id UUID REFERENCES organizations(id),
    owner_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- COMPANIES TABLE
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    industry TEXT,
    size TEXT,
    website TEXT,
    phone TEXT,
    address TEXT,
    owner_id UUID REFERENCES auth.users(id) NOT NULL,
    organization_id UUID REFERENCES organizations(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CONTACTS TABLE
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    job_title TEXT,
    owner_id UUID REFERENCES auth.users(id) NOT NULL,
    organization_id UUID REFERENCES companies(id),
    status TEXT DEFAULT 'lead' CHECK (status IN ('lead', 'prospect', 'customer', 'inactive')),
    lead_source TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DEALS TABLE
CREATE TABLE IF NOT EXISTS deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    value NUMERIC(15, 2) DEFAULT 0,
    stage TEXT DEFAULT 'prospecting' CHECK (stage IN ('prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
    probability INTEGER DEFAULT 10 CHECK (probability >= 0 AND probability <= 100),
    contact_id UUID REFERENCES contacts(id),
    company_id UUID REFERENCES companies(id),
    owner_id UUID REFERENCES auth.users(id) NOT NULL,
    expected_close_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'on_hold', 'completed', 'cancelled')),
    start_date DATE,
    end_date DATE,
    budget NUMERIC(15, 2),
    contact_id UUID REFERENCES contacts(id),
    company_id UUID REFERENCES companies(id),
    owner_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECT TASKS TABLE
CREATE TABLE IF NOT EXISTS project_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assignee_id UUID REFERENCES auth.users(id),
    due_date DATE,
    estimated_hours NUMERIC(6, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'task', 'note')),
    subject TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    contact_id UUID REFERENCES contacts(id),
    company_id UUID REFERENCES companies(id),
    deal_id UUID REFERENCES deals(id),
    project_id UUID REFERENCES projects(id),
    owner_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY POLICIES

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- ORGANIZATIONS policies
CREATE POLICY "Users can view organizations" ON organizations
    FOR SELECT USING (auth.uid() = owner_id OR EXISTS (
        SELECT 1 FROM organizations o2 WHERE o2.parent_id = organizations.id AND o2.owner_id = auth.uid()
    ));

CREATE POLICY "Users can insert organizations" ON organizations
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update organizations" ON organizations
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete organizations" ON organizations
    FOR DELETE USING (auth.uid() = owner_id);

-- COMPANIES policies
CREATE POLICY "Users can view companies" ON companies
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert companies" ON companies
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update companies" ON companies
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete companies" ON companies
    FOR DELETE USING (auth.uid() = owner_id);

-- CONTACTS policies
CREATE POLICY "Users can view contacts" ON contacts
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert contacts" ON contacts
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update contacts" ON contacts
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete contacts" ON contacts
    FOR DELETE USING (auth.uid() = owner_id);

-- DEALS policies
CREATE POLICY "Users can view deals" ON deals
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert deals" ON deals
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update deals" ON deals
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete deals" ON deals
    FOR DELETE USING (auth.uid() = owner_id);

-- PROJECTS policies
CREATE POLICY "Users can view projects" ON projects
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update projects" ON projects
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete projects" ON projects
    FOR DELETE USING (auth.uid() = owner_id);

-- PROJECT TASKS policies
CREATE POLICY "Users can view project tasks" ON project_tasks
    FOR SELECT USING (auth.uid() = assignee_id OR EXISTS (
        SELECT 1 FROM projects WHERE id = project_tasks.project_id AND owner_id = auth.uid()
    ));

CREATE POLICY "Users can insert project tasks" ON project_tasks
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM projects WHERE id = project_tasks.project_id AND owner_id = auth.uid()
    ));

CREATE POLICY "Users can update project tasks" ON project_tasks
    FOR UPDATE USING (auth.uid() = assignee_id OR EXISTS (
        SELECT 1 FROM projects WHERE id = project_tasks.project_id AND owner_id = auth.uid()
    ));

CREATE POLICY "Users can delete project tasks" ON project_tasks
    FOR DELETE USING (auth.uid() = assignee_id OR EXISTS (
        SELECT 1 FROM projects WHERE id = project_tasks.project_id AND owner_id = auth.uid()
    ));

-- ACTIVITIES policies
CREATE POLICY "Users can view activities" ON activities
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert activities" ON activities
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update activities" ON activities
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete activities" ON activities
    FOR DELETE USING (auth.uid() = owner_id);

-- FUNCTIONS

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to tables with this column
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deals_updated_at
    BEFORE UPDATE ON deals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_tasks_updated_at
    BEFORE UPDATE ON project_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- INDEXES for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_owner ON contacts(owner_id);
CREATE INDEX IF NOT EXISTS idx_contacts_organization ON contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_companies_owner ON companies(owner_id);
CREATE INDEX IF NOT EXISTS idx_deals_owner ON deals(owner_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_activities_owner ON activities(owner_id);
CREATE INDEX IF NOT EXISTS idx_activities_contact ON activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_activities_company ON activities(company_id);

-- STORAGE BUCKETS (run in Supabase Dashboard > Storage)
-- Create a 'user-files' bucket with RLS enabled for file uploads

-- TASKS TABLE (standalone tasks not tied to projects)
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'todo' CHECK (type IN ('todo', 'call', 'email', 'meeting', 'note')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date DATE,
    contact_id UUID REFERENCES contacts(id),
    company_id UUID REFERENCES companies(id),
    deal_id UUID REFERENCES deals(id),
    project_id UUID REFERENCES projects(id),
    owner_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- TASKS policies
CREATE POLICY "Users can view tasks" ON tasks
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert tasks" ON tasks
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update tasks" ON tasks
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete tasks" ON tasks
    FOR DELETE USING (auth.uid() = owner_id);

-- Updated_at trigger for tasks
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- INDEXES for tasks
CREATE INDEX IF NOT EXISTS idx_tasks_owner ON tasks(owner_id);
CREATE INDEX IF NOT EXISTS idx_tasks_contact ON tasks(contact_id);
CREATE INDEX IF NOT EXISTS idx_tasks_company ON tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_tasks_deal ON tasks(deal_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
