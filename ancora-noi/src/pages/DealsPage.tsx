import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, DollarSign, Calendar, Users, MoreHorizontal } from 'lucide-react'
import { useDataStore } from '@/store/dataStore'
import { useAuthStore } from '@/store/authStore'
import { Card, Badge, Button, Input, Modal, Select, Textarea } from '@/components/ui'
import { formatCurrency, formatDate } from '@/lib/utils'
import { DEAL_STAGES } from '@/types'

export function DealsPage() {
  const { user } = useAuthStore()
  const { contacts, companies, deals, loading, fetchContacts, fetchCompanies, fetchDeals, addDeal, updateDeal, deleteDeal } = useDataStore()
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newDeal, setNewDeal] = useState({
    title: '',
    value: '',
    stage: 'prospecting' as const,
    contact_id: '',
    company_id: '',
    expected_close_date: '',
    notes: '',
  })

  useEffect(() => {
    fetchContacts()
    fetchCompanies()
    fetchDeals()
  }, [fetchContacts, fetchCompanies, fetchDeals])

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch = deal.title.toLowerCase().includes(search.toLowerCase())
    const matchesStage = stageFilter === 'all' || deal.stage === stageFilter
    return matchesSearch && matchesStage
  })

  const dealsByStage = DEAL_STAGES.filter(s => s.id !== 'closed_won' && s.id !== 'closed_lost').map(stage => ({
    ...stage,
    deals: filteredDeals.filter(d => d.stage === stage.id),
    value: filteredDeals.filter(d => d.stage === stage.id).reduce((sum, d) => sum + (d.value || 0), 0),
  }))

  const handleAddDeal = async (e: React.FormEvent) => {
    e.preventDefault()
    const stageConfig = DEAL_STAGES.find(s => s.id === newDeal.stage)
    await addDeal({
      title: newDeal.title,
      value: parseFloat(newDeal.value) || 0,
      stage: newDeal.stage,
      probability: stageConfig?.probability || 0,
      contact_id: newDeal.contact_id || null,
      company_id: newDeal.company_id || null,
      expected_close_date: newDeal.expected_close_date || null,
      notes: newDeal.notes,
      owner_id: user!.id,
    })
    setShowAddModal(false)
    setNewDeal({
      title: '',
      value: '',
      stage: 'prospecting',
      contact_id: '',
      company_id: '',
      expected_close_date: '',
      notes: '',
    })
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this deal?')) {
      await deleteDeal(id)
    }
  }

  const totalValue = filteredDeals.reduce((sum, d) => sum + (d.value || 0), 0)
  const weightedPipeline = filteredDeals.reduce((sum, d) => sum + ((d.value || 0) * (d.probability || 0) / 100), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deals Pipeline</h1>
          <p className="text-gray-600">
            {filteredDeals.length} deals · {formatCurrency(totalValue)} total
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Deal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Pipeline</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Weighted Value</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(weightedPipeline)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Avg Deal Size</p>
          <p className="text-2xl font-bold text-gray-900">
            {filteredDeals.length > 0 ? formatCurrency(totalValue / filteredDeals.length) : '-'}
          </p>
        </Card>
      </div>

      {/* Pipeline View */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto">
        {dealsByStage.map((stage) => (
          <div key={stage.id} className="bg-gray-50 rounded-xl p-4 min-w-[280px]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">{stage.label}</h3>
                <p className="text-sm text-gray-600">{stage.deals.length} deals</p>
              </div>
              <Badge variant="info">{formatCurrency(stage.value)}</Badge>
            </div>
            <div className="space-y-3">
              {stage.deals.length === 0 ? (
                <div className="text-center py-4 text-sm text-gray-400">
                  No deals
                </div>
              ) : (
                stage.deals.map((deal) => (
                  <Link key={deal.id} to={`/deals/${deal.id}`}>
                    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">{deal.title}</h4>
                        <Button variant="ghost" size="sm" onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(deal.id)
                        }}>
                          ×
                        </Button>
                      </div>
                      <p className="text-lg font-bold text-primary-600 mb-2">
                        {formatCurrency(deal.value)}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {deal.contact && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {deal.contact.first_name}
                          </span>
                        )}
                      {deal.expected_close_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(deal.expected_close_date)}
                        </span>
                      )}
                    </div>
                  </Card>
                </Link>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Deal Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Deal"
      >
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
          <Select
            label="Contact"
            options={[
              { value: '', label: 'No contact' },
              ...contacts.map((c) => ({
                value: c.id,
                label: `${c.first_name} ${c.last_name}`,
              })),
            ]}
            value={newDeal.contact_id}
            onChange={(e) => setNewDeal({ ...newDeal, contact_id: e.target.value })}
          />
          <Select
            label="Company"
            options={[
              { value: '', label: 'No company' },
              ...companies.map((c) => ({ value: c.id, label: c.name })),
            ]}
            value={newDeal.company_id}
            onChange={(e) => setNewDeal({ ...newDeal, company_id: e.target.value })}
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
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Deal</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
