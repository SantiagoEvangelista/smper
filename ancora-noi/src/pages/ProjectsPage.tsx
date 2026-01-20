import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Calendar, DollarSign, Users, Clock, CheckCircle, AlertCircle, PlayCircle } from 'lucide-react'
import { useDataStore } from '@/store/dataStore'
import { useAuthStore } from '@/store/authStore'
import { Card, Badge, Button, Input, Modal, Select, Textarea } from '@/components/ui'
import { formatCurrency, formatDate } from '@/lib/utils'
import { PROJECT_STATUSES, TASK_STATUSES } from '@/types'

export function ProjectsPage() {
  const { user } = useAuthStore()
  const { contacts, companies, projects, loading, fetchContacts, fetchCompanies, fetchProjects, addProject, deleteProject } = useDataStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'planning' as const,
    start_date: '',
    end_date: '',
    budget: '',
    contact_id: '',
    company_id: '',
  })

  useEffect(() => {
    fetchContacts()
    fetchCompanies()
    fetchProjects()
  }, [fetchContacts, fetchCompanies, fetchProjects])

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    const statusConfig = PROJECT_STATUSES.find(s => s.id === status)
    return statusConfig?.color || 'bg-gray-100 text-gray-700'
  }

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault()
    await addProject({
      name: newProject.name,
      description: newProject.description || null,
      status: newProject.status,
      start_date: newProject.start_date || null,
      end_date: newProject.end_date || null,
      budget: newProject.budget ? parseFloat(newProject.budget) : null,
      contact_id: newProject.contact_id || null,
      company_id: newProject.company_id || null,
      owner_id: user!.id,
    })
    setShowAddModal(false)
    setNewProject({
      name: '',
      description: '',
      status: 'planning',
      start_date: '',
      end_date: '',
      budget: '',
      contact_id: '',
      company_id: '',
    })
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      await deleteProject(id)
    }
  }

  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0)
  const activeProjects = projects.filter(p => p.status === 'in_progress')
  const planningProjects = projects.filter(p => p.status === 'planning')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600">{filteredProjects.length} projects</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Projects</p>
          <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">{activeProjects.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Planning</p>
          <p className="text-2xl font-bold text-gray-600">{planningProjects.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Budget</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalBudget)}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <Select
            options={[
              { value: 'all', label: 'All statuses' },
              ...PROJECT_STATUSES.map((s) => ({ value: s.id, label: s.label })),
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48"
          />
        </div>
      </Card>

      {/* Projects list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-6 w-48 bg-gray-200 rounded mb-4" />
              <div className="h-4 w-32 bg-gray-200 rounded" />
            </Card>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first project.</p>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`}>
              <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                  {project.description && (
                    <p className="text-gray-600 mb-4">{project.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    {project.start_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(project.start_date)}
                        {project.end_date && ` - ${formatDate(project.end_date)}`}
                      </span>
                    )}
                    {project.budget && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {formatCurrency(project.budget)}
                      </span>
                    )}
                    {project.company && (
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {project.company.name}
                      </span>
                    )}
                    {project.contact && (
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {project.contact.first_name} {project.contact.last_name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/projects/${project.id}`}>
                    <Button variant="outline" size="sm">View</Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(project.id)}>
                    Delete
                  </Button>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Add Project Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create New Project"
      >
        <form onSubmit={handleAddProject} className="space-y-4">
          <Input
            label="Project Name"
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            required
          />
          <Textarea
            label="Description"
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
          />
          <Select
            label="Status"
            options={PROJECT_STATUSES.map((s) => ({ value: s.id, label: s.label }))}
            value={newProject.status}
            onChange={(e) => setNewProject({ ...newProject, status: e.target.value as any })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={newProject.start_date}
              onChange={(e) => setNewProject({ ...newProject, start_date: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              value={newProject.end_date}
              onChange={(e) => setNewProject({ ...newProject, end_date: e.target.value })}
            />
          </div>
          <Input
            label="Budget"
            type="number"
            value={newProject.budget}
            onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
          />
          <Select
            label="Contact"
            options={[
              { value: '', label: 'No contact' },
              ...contacts.map((c) => ({
                value: c.id,
                label: `${c.first_name} ${c.last_name}`,
              })),
            ]}
            value={newProject.contact_id}
            onChange={(e) => setNewProject({ ...newProject, contact_id: e.target.value })}
          />
          <Select
            label="Company"
            options={[
              { value: '', label: 'No company' },
              ...companies.map((c) => ({ value: c.id, label: c.name })),
            ]}
            value={newProject.company_id}
            onChange={(e) => setNewProject({ ...newProject, company_id: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Project</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
