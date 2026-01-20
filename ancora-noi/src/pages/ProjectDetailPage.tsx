import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, DollarSign, Users, Plus, CheckCircle, Clock, AlertTriangle, ListTodo } from 'lucide-react'
import { useDataStore } from '@/store/dataStore'
import { useAuthStore } from '@/store/authStore'
import { Card, Badge, Button, Input, Modal, Select, Textarea } from '@/components/ui'
import { formatDate, formatCurrency } from '@/lib/utils'
import { PROJECT_STATUSES, TASK_STATUSES, TASK_PRIORITIES } from '@/types'

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const { getProject, projects, contacts, companies, projectTasks, fetchProjects, fetchContacts, fetchCompanies, fetchProjectTasks, updateProject, addProjectTask, updateProjectTask, deleteProjectTask } = useDataStore()
  
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddTaskModal, setShowAddTaskModal] = useState(false)
  
  const [editProject, setEditProject] = useState({
    name: '',
    description: '',
    status: 'planning' as const,
    start_date: '',
    end_date: '',
    budget: '',
  })
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'todo' as const,
    priority: 'medium' as const,
    due_date: '',
    estimated_hours: '',
  })

  const project = getProject(id!)
  const projectContacts = contacts.filter(c => c.id === project?.contact_id)
  const projectCompanies = companies.filter(c => c.id === project?.company_id)

  useEffect(() => {
    fetchProjects()
    fetchContacts()
    fetchCompanies()
    if (id) {
      fetchProjectTasks(id)
    }
  }, [fetchProjects, fetchContacts, fetchCompanies, fetchProjectTasks, id])

  useEffect(() => {
    if (project) {
      setEditProject({
        name: project.name,
        description: project.description || '',
        status: project.status,
        start_date: project.start_date || '',
        end_date: project.end_date || '',
        budget: project.budget?.toString() || '',
      })
    }
  }, [project])

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Project not found</p>
        <Link to="/projects">
          <Button className="mt-4">Back to Projects</Button>
        </Link>
      </div>
    )
  }

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateProject(id!, {
      name: editProject.name,
      description: editProject.description || null,
      status: editProject.status,
      start_date: editProject.start_date || null,
      end_date: editProject.end_date || null,
      budget: editProject.budget ? parseFloat(editProject.budget) : null,
    })
    setShowEditModal(false)
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    await addProjectTask({
      project_id: id!,
      title: newTask.title,
      description: newTask.description || null,
      status: newTask.status,
      priority: newTask.priority,
      due_date: newTask.due_date || null,
      estimated_hours: newTask.estimated_hours ? parseFloat(newTask.estimated_hours) : null,
      assignee_id: user!.id,
    })
    setShowAddTaskModal(false)
    setNewTask({ title: '', description: '', status: 'todo', priority: 'medium', due_date: '', estimated_hours: '' })
  }

  const handleToggleTaskStatus = async (task: typeof projectTasks[0]) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done'
    await updateProjectTask(task.id, { status: newStatus })
  }

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Delete this task?')) {
      await deleteProjectTask(taskId)
    }
  }

  const getStatusColor = (status: string) => {
    const statusConfig = PROJECT_STATUSES.find(s => s.id === status)
    return statusConfig?.color || 'bg-gray-100 text-gray-700'
  }

  const getPriorityColor = (priority: string) => {
    const config = TASK_PRIORITIES.find(p => p.id === priority)
    return config?.color || 'text-gray-500'
  }

  const completedTasks = projectTasks.filter(t => t.status === 'done').length
  const progress = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/projects">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
              <ListTodo className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getStatusColor(project.status)}>
                  {project.status.replace('_', ' ')}
                </Badge>
                <span className="text-sm text-gray-500">
                  {completedTasks}/{projectTasks.length} tasks completed
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowEditModal(true)}>
            Edit Project
          </Button>
          <Button onClick={() => setShowAddTaskModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-medium text-gray-700">{progress}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Info */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Project Details</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <Badge className={getStatusColor(project.status)}>
                {project.status.replace('_', ' ')}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Budget</p>
              <p className="text-xl font-bold text-primary">
                {project.budget ? formatCurrency(project.budget) : '-'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Start Date</p>
                <p className="font-medium">{formatDate(project.start_date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">End Date</p>
                <p className="font-medium">{formatDate(project.end_date)}</p>
              </div>
            </div>
            {project.description && (
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-sm text-gray-700">{project.description}</p>
              </div>
            )}
            {projectContacts.length > 0 && (
              <div className="pt-3 border-t">
                <p className="text-sm text-gray-500 mb-2">Contact</p>
                {projectContacts.map((contact) => (
                  <Link key={contact.id} to={`/contacts/${contact.id}`} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{contact.first_name} {contact.last_name}</span>
                  </Link>
                ))}
              </div>
            )}
            {projectCompanies.length > 0 && (
              <div className="pt-3 border-t">
                <p className="text-sm text-gray-500 mb-2">Company</p>
                {projectCompanies.map((company) => (
                  <Link key={company.id} to={`/companies/${company.id}`} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{company.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Tasks */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Tasks</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowAddTaskModal(true)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {projectTasks.length === 0 ? (
            <div className="text-center py-8">
              <ListTodo className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-gray-500">No tasks yet</p>
              <Button className="mt-4" onClick={() => setShowAddTaskModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Task
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {projectTasks.map((task) => (
                <div key={task.id} className={`p-4 rounded-lg border ${
                  task.status === 'done' ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleTaskStatus(task)}
                      className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        task.status === 'done' 
                          ? 'bg-primary border-primary text-white' 
                          : 'border-gray-300 hover:border-primary'
                      }`}
                    >
                      {task.status === 'done' && <CheckCircle className="w-3 h-3" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`font-medium ${task.status === 'done' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {task.title}
                        </p>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {task.due_date && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(task.due_date)}
                          </span>
                        )}
                        {task.estimated_hours && (
                          <span>{task.estimated_hours}h estimated</span>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task.id)}>
                      ×
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Edit Project Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Project">
        <form onSubmit={handleUpdateProject} className="space-y-4">
          <Input label="Project Name" value={editProject.name} onChange={(e) => setEditProject({ ...editProject, name: e.target.value })} required />
          <Textarea label="Description" value={editProject.description} onChange={(e) => setEditProject({ ...editProject, description: e.target.value })} />
          <Select label="Status" options={PROJECT_STATUSES.map((s) => ({ value: s.id, label: s.label }))} value={editProject.status} onChange={(e) => setEditProject({ ...editProject, status: e.target.value as any })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" value={editProject.start_date} onChange={(e) => setEditProject({ ...editProject, start_date: e.target.value })} />
            <Input label="End Date" type="date" value={editProject.end_date} onChange={(e) => setEditProject({ ...editProject, end_date: e.target.value })} />
          </div>
          <Input label="Budget" type="number" value={editProject.budget} onChange={(e) => setEditProject({ ...editProject, budget: e.target.value })} />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Add Task Modal */}
      <Modal isOpen={showAddTaskModal} onClose={() => setShowAddTaskModal(false)} title="Add Task">
        <form onSubmit={handleAddTask} className="space-y-4">
          <Input label="Task Title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} required />
          <Textarea label="Description" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Priority" options={TASK_PRIORITIES.map((p) => ({ value: p.id, label: p.label }))} value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })} />
            <Input label="Due Date" type="date" value={newTask.due_date} onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })} />
          </div>
          <Input label="Estimated Hours" type="number" value={newTask.estimated_hours} onChange={(e) => setNewTask({ ...newTask, estimated_hours: e.target.value })} />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowAddTaskModal(false)}>Cancel</Button>
            <Button type="submit">Add Task</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
