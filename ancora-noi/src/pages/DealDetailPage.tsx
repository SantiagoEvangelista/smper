import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, DollarSign, Users, Plus, Phone, Mail, FileText } from 'lucide-react'
import { useDataStore } from '@/store/dataStore'
import { useAuthStore } from '@/store/authStore'
import { Card, Badge, Button, Input, Modal, Select, Textarea } from '@/components/ui'
import { formatDate, formatCurrency } from '@/lib/utils'
import { DEAL_STAGES, ACTIVITY_TYPES } from '@/types'

export function DealDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const { getDeal, deals, contacts, companies, activities, fetchDeals, fetchContacts, fetchCompanies, fetchActivities, updateDeal, addActivity } = useDataStore()
  
  const [showUpdateStageModal, setShowUpdateStageModal] = useState(false)
  const [showAddActivityModal, setShowAddActivityModal] = useState(false)
  const [newActivity, setNewActivity] = useState({
    type: 'call' as const,
    subject: '',
    description: '',
    due_date: '',
  })
  const [stage, setStage] = useState('')

  const deal = getDeal(id!)
  const dealActivities = activities.filter(a => a.deal_id === id)
  const allDeals = deals

  useEffect(() => {
    fetchDeals()
    fetchContacts()
    fetchCompanies()
    if (id) {
      fetchActivities({ deal_id: id })
    }
  }, [fetchDeals, fetchContacts, fetchCompanies, fetchActivities, id])

  useEffect(() => {
    if (deal) {
      setStage(deal.stage)
    }
  }, [deal])

  if (!deal) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Deal not found</p>
        <Link to="/deals">
          <Button className="mt-4">Back to Deals</Button>
        </Link>
      </div>
    )
  }

  const handleUpdateStage = async () => {
    const stageConfig = DEAL_STAGES.find(s => s.id === stage)
    await updateDeal(id!, {
      stage,
      probability: stageConfig?.probability || 0,
    })
    setShowUpdateStageModal(false)
  }

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault()
    await addActivity({
      type: newActivity.type,
      subject: newActivity.subject,
      description: newActivity.description || null,
      due_date: newActivity.due_date || null,
      deal_id: id!,
      owner_id: user!.id,
    })
    setShowAddActivityModal(false)
    setNewActivity({ type: 'call', subject: '', description: '', due_date: '' })
  }

  const getStageColor = (stageId: string) => {
    if (stageId === 'closed_won') return 'bg-green-100 text-green-700'
    if (stageId === 'closed_lost') return 'bg-red-100 text-red-700'
    return 'bg-blue-100 text-blue-700'
  }

  const weightedValue = (deal.value || 0) * (deal.probability || 0) / 100
  const pipelinePosition = allDeals
    .filter(d => !['closed_won', 'closed_lost'].includes(d.stage))
    .sort((a, b) => (b.value * b.probability) - (a.value * a.probability))
    .findIndex(d => d.id === id) + 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/deals">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{deal.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getStageColor(deal.stage)}>{deal.stage.replace('_', ' ')}</Badge>
                <span className="text-sm text-gray-500">
                  {deal.probability}% probability
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAddActivityModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Log Activity
          </Button>
          <Button onClick={() => setShowUpdateStageModal(true)}>
            Move Stage
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Deal Value</p>
          <p className="text-2xl font-bold text-primary">{formatCurrency(deal.value)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Weighted Value</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(weightedValue)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Pipeline Rank</p>
          <p className="text-2xl font-bold text-gray-900">#{pipelinePosition}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Activities</p>
          <p className="text-2xl font-bold text-gray-900">{dealActivities.length}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deal Info */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Deal Details</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Value</p>
              <p className="text-xl font-bold text-primary">{formatCurrency(deal.value)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Probability</p>
              <p className="font-medium">{deal.probability}%</p>
            </div>
            {deal.expected_close_date && (
              <div>
                <p className="text-sm text-gray-500">Expected Close</p>
                <p className="font-medium">{formatDate(deal.expected_close_date)}</p>
              </div>
            )}
            {deal.contact && (
              <div className="pt-3 border-t">
                <p className="text-sm text-gray-500 mb-2">Contact</p>
                <Link to={`/contacts/${deal.contact.id}`} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{deal.contact.first_name} {deal.contact.last_name}</span>
                </Link>
              </div>
            )}
            {deal.company && (
              <div className="pt-3 border-t">
                <p className="text-sm text-gray-500 mb-2">Company</p>
                <Link to={`/companies/${deal.company.id}`} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{deal.company.name}</span>
                </Link>
              </div>
            )}
            {deal.notes && (
              <div className="pt-3 border-t">
                <p className="text-sm text-gray-500">Notes</p>
                <p className="text-sm text-gray-700">{deal.notes}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Pipeline Progress */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Pipeline Progress</h2>
          <div className="space-y-3">
            {DEAL_STAGES.filter(s => s.id !== 'closed_lost').map((s, index) => (
              <div
                key={s.id}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  deal.stage === s.id ? 'bg-primary text-white' : 
                  ['closed_won', 'closed_lost'].includes(s.id) ? 'bg-gray-100' :
                  index < DEAL_STAGES.filter(st => st.id !== 'closed_lost').findIndex(st => st.id === deal.stage) ? 'bg-green-100' :
                  'bg-gray-50'
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${
                  deal.stage === s.id ? 'bg-white' : 'bg-gray-400'
                }`} />
                <div className="flex-1">
                  <p className={`font-medium ${deal.stage === s.id ? 'text-white' : 'text-gray-900'}`}>
                    {s.label}
                  </p>
                  <p className={`text-xs ${deal.stage === s.id ? 'text-white/70' : 'text-gray-500'}`}>
                    {s.probability}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Activities */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Activity</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowAddActivityModal(true)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {dealActivities.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No activities yet</p>
          ) : (
            <div className="space-y-3">
              {dealActivities.map((activity) => (
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

      {/* Update Stage Modal */}
      <Modal isOpen={showUpdateStageModal} onClose={() => setShowUpdateStageModal(false)} title="Update Deal Stage">
        <div className="space-y-4">
          <Select
            label="New Stage"
            options={DEAL_STAGES.map((s) => ({ value: s.id, label: `${s.label} (${s.probability}%)` }))}
            value={stage}
            onChange={(e) => setStage(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowUpdateStageModal(false)}>Cancel</Button>
            <Button onClick={handleUpdateStage}>Update Stage</Button>
          </div>
        </div>
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
