import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Globe, Phone, MapPin, Users, Calendar, Plus, Mail, Briefcase, FolderKanban } from 'lucide-react'
import { useDataStore } from '@/store/dataStore'
import { useAuthStore } from '@/store/authStore'
import { Card, Badge, Button, Input, Modal, Select, Textarea } from '@/components/ui'
import { formatDate, formatCurrency } from '@/lib/utils'
import { DEAL_STAGES, ACTIVITY_TYPES } from '@/types'

export function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const { getCompany, companies, contacts, deals, projects, activities, fetchCompanies, fetchContacts, fetchDeals, fetchProjects, fetchActivities, addContact, addDeal, addActivity } = useDataStore()
  
  const [showAddContactModal, setShowAddContactModal] = useState(false)
  const [showAddDealModal, setShowAddDealModal] = useState(false)
  const [showAddActivityModal, setShowAddActivityModal] = useState(false)
  
  const [newContact, setNewContact] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    job_title: '',
    status: 'lead' as const,
  })
  
  const [newDeal, setNewDeal] = useState({
    title: '',
    value: '',
    stage: 'prospecting' as const,
    expected_close_date: '',
    notes: '',
  })
  
  const [newActivity, setNewActivity] = useState({
    type: 'call' as const,
    subject: '',
    description: '',
    due_date: '',
  })

  const company = getCompany(id!)
  const companyContacts = contacts.filter(c => c.organization_id === id)
  const companyDeals = deals.filter(d => d.company_id === id)
  const companyProjects = projects.filter(p => p.company_id === id)
  const companyActivities = activities.filter(a => a.company_id === id)

  useEffect(() => {
    fetchCompanies()
    fetchContacts()
    fetchDeals()
    fetchProjects()
    if (id) {
      fetchActivities({ company_id: id })
    }
  }, [fetchCompanies, fetchContacts, fetchDeals, fetchProjects, fetchActivities, id])

  if (!company) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Company not found</p>
        <Link to="/companies">
          <Button className="mt-4">Back to Companies</Button>
        </Link>
      </div>
    )
  }

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault()
    await addContact({
      first_name: newContact.first_name,
      last_name: newContact.last_name,
      email: newContact.email || null,
      phone: newContact.phone || null,
      job_title: newContact.job_title || null,
      status: newContact.status,
      organization_id: id!,
      owner_id: user!.id,
    })
    setShowAddContactModal(false)
    setNewContact({ first_name: '', last_name: '', email: '', phone: '', job_title: '', status: 'lead' })
  }

  const handleAddDeal = async (e: React.FormEvent) => {
    e.preventDefault()
    const stageConfig = DEAL_STAGES.find(s => s.id === newDeal.stage)
    await addDeal({
      title: newDeal.title,
      value: parseFloat(newDeal.value) || 0,
      stage: newDeal.stage,
      probability: stageConfig?.probability || 0,
      company_id: id!,
      expected_close_date: newDeal.expected_close_date || null,
      notes: newDeal.notes,
      owner_id: user!.id,
    })
    setShowAddDealModal(false)
    setNewDeal({ title: '', value: '', stage: 'prospecting', expected_close_date: '', notes: '' })
  }

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault()
    await addActivity({
      type: newActivity.type,
      subject: newActivity.subject,
      description: newActivity.description || null,
      due_date: newActivity.due_date || null,
      company_id: id!,
      owner_id: user!.id,
    })
    setShowAddActivityModal(false)
    setNewActivity({ type: 'call', subject: '', description: '', due_date: '' })
  }

  const totalDealValue = companyDeals.reduce((sum, d) => sum + (d.value || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/companies">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-xl bg-accent flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {company.name.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
              {company.industry && (
                <p className="text-gray-600">{company.industry}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAddActivityModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Log Activity
          </Button>
          <Button variant="outline" onClick={() => setShowAddContactModal(true)}>
            <Users className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
          <Button onClick={() => setShowAddDealModal(true)}>
            <Briefcase className="w-4 h-4 mr-2" />
            New Deal
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Contacts</p>
          <p className="text-2xl font-bold text-gray-900">{companyContacts.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Deals</p>
          <p className="text-2xl font-bold text-gray-900">{companyDeals.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Deal Value</p>
          <p className="text-2xl font-bold text-primary">{formatCurrency(totalDealValue)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Projects</p>
          <p className="text-2xl font-bold text-gray-900">{companyProjects.length}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Info */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Company Information</h2>
          <div className="space-y-3">
            {company.website && (
              <div className="flex items-center gap-3 text-sm">
                <Globe className="w-4 h-4 text-gray-400" />
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {company.website}
                </a>
              </div>
            )}
            {company.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <a href={`tel:${company.phone}`} className="text-primary hover:underline">
                  {company.phone}
                </a>
              </div>
            )}
            {company.address && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{company.address}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Added {formatDate(company.created_at)}</span>
            </div>
            {company.size && (
              <div className="pt-3 border-t">
                <p className="text-sm text-gray-500">Size</p>
                <p className="font-medium">{company.size} employees</p>
              </div>
            )}
          </div>
        </Card>

        {/* Contacts */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Contacts</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowAddContactModal(true)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {companyContacts.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No contacts yet</p>
          ) : (
            <div className="space-y-2">
              {companyContacts.map((contact) => (
                <Link key={contact.id} to={`/contacts/${contact.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {contact.first_name?.charAt(0)}{contact.last_name?.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {contact.first_name} {contact.last_name}
                    </p>
                    {contact.job_title && (
                      <p className="text-sm text-gray-500 truncate">{contact.job_title}</p>
                    )}
                  </div>
                  <Badge>{contact.status}</Badge>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Deals */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Deals</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowAddDealModal(true)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {companyDeals.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No deals yet</p>
          ) : (
            <div className="space-y-2">
              {companyDeals.map((deal) => (
                <Link key={deal.id} to={`/deals/${deal.id}`} className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">{deal.title}</p>
                    <span className="text-sm font-bold text-primary">{formatCurrency(deal.value)}</span>
                  </div>
                  <Badge variant="info">{deal.stage}</Badge>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Projects */}
      {companyProjects.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {companyProjects.map((project) => (
              <Link key={project.id} to={`/projects/${project.id}`} className="p-4 rounded-lg border border-gray-200 hover:border-primary hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900">{project.name}</p>
                  <Badge variant="info">{project.status.replace('_', ' ')}</Badge>
                </div>
                {project.budget && (
                  <p className="text-sm text-primary">{formatCurrency(project.budget)}</p>
                )}
              </Link>
            ))}
          </div>
        </Card>
      )}

      {/* Add Contact Modal */}
      <Modal isOpen={showAddContactModal} onClose={() => setShowAddContactModal(false)} title="Add Contact">
        <form onSubmit={handleAddContact} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" value={newContact.first_name} onChange={(e) => setNewContact({ ...newContact, first_name: e.target.value })} required />
            <Input label="Last Name" value={newContact.last_name} onChange={(e) => setNewContact({ ...newContact, last_name: e.target.value })} required />
          </div>
          <Input label="Email" type="email" value={newContact.email} onChange={(e) => setNewContact({ ...newContact, email: e.target.value })} />
          <Input label="Phone" value={newContact.phone} onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} />
          <Input label="Job Title" value={newContact.job_title} onChange={(e) => setNewContact({ ...newContact, job_title: e.target.value })} />
          <Select label="Status" options={[{ value: 'lead', label: 'Lead' }, { value: 'prospect', label: 'Prospect' }, { value: 'customer', label: 'Customer' }]} value={newContact.status} onChange={(e) => setNewContact({ ...newContact, status: e.target.value as any })} />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowAddContactModal(false)}>Cancel</Button>
            <Button type="submit">Add Contact</Button>
          </div>
        </form>
      </Modal>

      {/* Add Deal Modal */}
      <Modal isOpen={showAddDealModal} onClose={() => setShowAddDealModal(false)} title="Create Deal">
        <form onSubmit={handleAddDeal} className="space-y-4">
          <Input label="Deal Title" value={newDeal.title} onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })} required />
          <Input label="Value" type="number" value={newDeal.value} onChange={(e) => setNewDeal({ ...newDeal, value: e.target.value })} required />
          <Select label="Stage" options={DEAL_STAGES.map((s) => ({ value: s.id, label: s.label }))} value={newDeal.stage} onChange={(e) => setNewDeal({ ...newDeal, stage: e.target.value as any })} />
          <Input label="Expected Close Date" type="date" value={newDeal.expected_close_date} onChange={(e) => setNewDeal({ ...newDeal, expected_close_date: e.target.value })} />
          <Textarea label="Notes" value={newDeal.notes} onChange={(e) => setNewDeal({ ...newDeal, notes: e.target.value })} />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowAddDealModal(false)}>Cancel</Button>
            <Button type="submit">Create Deal</Button>
          </div>
        </form>
      </Modal>

      {/* Add Activity Modal */}
      <Modal isOpen={showAddActivityModal} onClose={() => setShowAddActivityModal(false)} title="Log Activity">
        <form onSubmit={handleAddActivity} className="space-y-4">
          <Select label="Type" options={ACTIVITY_TYPES.map((t) => ({ value: t.id, label: t.label }))} value={newActivity.type} onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value as any })} />
          <Input label="Subject" value={newActivity.subject} onChange={(e) => setNewActivity({ ...newActivity, subject: e.target.value })} required />
          <Textarea label="Description" value={newActivity.description} onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })} />
          <Input label="Due Date" type="date" value={newActivity.due_date} onChange={(e) => setNewActivity({ ...newActivity, due_date: e.target.value })} />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowAddActivityModal(false)}>Cancel</Button>
            <Button type="submit">Log Activity</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
