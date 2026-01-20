import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Phone, Mail, MapPin, Calendar, Briefcase, Plus, Clock } from 'lucide-react'
import { useDataStore } from '@/store/dataStore'
import { useAuthStore } from '@/store/authStore'
import { Card, Badge, Button, Input, Modal, Select, Textarea } from '@/components/ui'
import { formatDate, formatCurrency } from '@/lib/utils'
import { CONTACT_STATUSES, ACTIVITY_TYPES, DEAL_STAGES } from '@/types'

export function ContactDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const { getContact, contacts, companies, deals, projects, activities, fetchContacts, fetchCompanies, fetchDeals, fetchProjects, fetchActivities, addDeal, addActivity } = useDataStore()
  
  const [showAddDealModal, setShowAddDealModal] = useState(false)
  const [showAddActivityModal, setShowAddActivityModal] = useState(false)
  
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

  const contact = getContact(id!)
  const contactDeals = deals.filter(d => d.contact_id === id)
  const contactProjects = projects.filter(p => p.contact_id === id)
  const contactActivities = activities.filter(a => a.contact_id === id)

  useEffect(() => {
    fetchContacts()
    fetchCompanies()
    fetchDeals()
    fetchProjects()
    if (id) {
      fetchActivities({ contact_id: id })
    }
  }, [fetchContacts, fetchCompanies, fetchDeals, fetchProjects, fetchActivities, id])

  if (!contact) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Contact not found</p>
        <Link to="/contacts">
          <Button className="mt-4">Back to Contacts</Button>
        </Link>
      </div>
    )
  }

  const handleAddDeal = async (e: React.FormEvent) => {
    e.preventDefault()
    const stageConfig = DEAL_STAGES.find(s => s.id === newDeal.stage)
    await addDeal({
      title: newDeal.title,
      value: parseFloat(newDeal.value) || 0,
      stage: newDeal.stage,
      probability: stageConfig?.probability || 0,
      contact_id: id!,
      company_id: contact.organization_id || null,
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
      contact_id: id!,
      owner_id: user!.id,
    })
    setShowAddActivityModal(false)
    setNewActivity({ type: 'call', subject: '', description: '', due_date: '' })
  }

  const getStatusColor = (status: string) => {
    const statusConfig = CONTACT_STATUSES.find(s => s.id === status)
    return statusConfig?.color || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/contacts">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {contact.first_name?.charAt(0)}{contact.last_name?.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {contact.first_name} {contact.last_name}
              </h1>
              {contact.job_title && (
                <p className="text-gray-600">{contact.job_title}</p>
              )}
            </div>
            <Badge className={getStatusColor(contact.status)}>
              {contact.status}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAddActivityModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Log Activity
          </Button>
          <Button onClick={() => setShowAddDealModal(true)}>
            <Briefcase className="w-4 h-4 mr-2" />
            New Deal
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
          <div className="space-y-3">
            {contact.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                  {contact.email}
                </a>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <a href={`tel:${contact.phone}`} className="text-primary hover:underline">
                  {contact.phone}
                </a>
              </div>
            )}
            {contact.company && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-gray-400" />
                <Link to={`/companies/${contact.company.id}`} className="text-primary hover:underline">
                  {contact.company.name}
                </Link>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Added {formatDate(contact.created_at)}</span>
            </div>
            {contact.lead_source && (
              <div className="pt-3 border-t">
                <p className="text-sm text-gray-500">Lead Source</p>
                <p className="font-medium">{contact.lead_source}</p>
              </div>
            )}
            {contact.notes && (
              <div className="pt-3 border-t">
                <p className="text-sm text-gray-500">Notes</p>
                <p className="text-sm text-gray-700">{contact.notes}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Deals */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Deals</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowAddDealModal(true)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {contactDeals.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No deals yet</p>
          ) : (
            <div className="space-y-3">
              {contactDeals.map((deal) => (
                <Link key={deal.id} to={`/deals/${deal.id}`} className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">{deal.title}</p>
                    <span className="text-sm font-bold text-primary">
                      {formatCurrency(deal.value)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="info">{deal.stage}</Badge>
                    {deal.company && (
                      <span className="text-xs text-gray-500">{deal.company.name}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Activities */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Activity</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowAddActivityModal(true)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {contactActivities.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No activities yet</p>
          ) : (
            <div className="space-y-3">
              {contactActivities.map((activity) => (
                <div key={activity.id} className="p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge>{activity.type}</Badge>
                    <span className="text-xs text-gray-500">{formatDate(activity.created_at)}</span>
                  </div>
                  <p className="font-medium text-gray-900">{activity.subject}</p>
                  {activity.description && (
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Add Deal Modal */}
      <Modal isOpen={showAddDealModal} onClose={() => setShowAddDealModal(false)} title="Create Deal">
        <form onSubmit={handleAddDeal} className="space-y-4">
          <Input
            label="Deal Title"
            value={newDeal.title}
            onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })}
            required
          />
          <Input
            label="Value"
            type="number"
            value={newDeal.value}
            onChange={(e) => setNewDeal({ ...newDeal, value: e.target.value })}
            required
          />
          <Select
            label="Stage"
            options={DEAL_STAGES.map((s) => ({ value: s.id, label: s.label }))}
            value={newDeal.stage}
            onChange={(e) => setNewDeal({ ...newDeal, stage: e.target.value as any })}
          />
          <Input
            label="Expected Close Date"
            type="date"
            value={newDeal.expected_close_date}
            onChange={(e) => setNewDeal({ ...newDeal, expected_close_date: e.target.value })}
          />
          <Textarea
            label="Notes"
            value={newDeal.notes}
            onChange={(e) => setNewDeal({ ...newDeal, notes: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowAddDealModal(false)}>Cancel</Button>
            <Button type="submit">Create Deal</Button>
          </div>
        </form>
      </Modal>

      {/* Add Activity Modal */}
      <Modal isOpen={showAddActivityModal} onClose={() => setShowAddActivityModal(false)} title="Log Activity">
        <form onSubmit={handleAddActivity} className="space-y-4">
          <Select
            label="Type"
            options={ACTIVITY_TYPES.map((t) => ({ value: t.id, label: t.label }))}
            value={newActivity.type}
            onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value as any })}
          />
          <Input
            label="Subject"
            value={newActivity.subject}
            onChange={(e) => setNewActivity({ ...newActivity, subject: e.target.value })}
            required
          />
          <Textarea
            label="Description"
            value={newActivity.description}
            onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
          />
          <Input
            label="Due Date"
            type="date"
            value={newActivity.due_date}
            onChange={(e) => setNewActivity({ ...newActivity, due_date: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowAddActivityModal(false)}>Cancel</Button>
            <Button type="submit">Log Activity</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
