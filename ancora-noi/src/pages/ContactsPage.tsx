import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter, Mail, Phone, MapPin } from 'lucide-react'
import { useDataStore } from '@/store/dataStore'
import { useAuthStore } from '@/store/authStore'
import { Card, Badge, Button, Input, Modal, Select } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import type { Contact } from '@/types'

export function ContactsPage() {
  const { user } = useAuthStore()
  const { contacts, companies, loading, fetchContacts, fetchCompanies, addContact, deleteContact } = useDataStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newContact, setNewContact] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    job_title: '',
    organization_id: '',
    status: 'lead' as const,
    lead_source: '',
    notes: '',
  })

  useEffect(() => {
    fetchContacts()
    fetchCompanies()
  }, [fetchContacts, fetchCompanies])

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.first_name.toLowerCase().includes(search.toLowerCase()) ||
      contact.last_name.toLowerCase().includes(search.toLowerCase()) ||
      contact.email?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault()
    await addContact({
      ...newContact,
      owner_id: user!.id,
    })
    setShowAddModal(false)
    setNewContact({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      job_title: '',
      organization_id: '',
      status: 'lead',
      lead_source: '',
      notes: '',
    })
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      await deleteContact(id)
    }
  }

  const statusOptions = [
    { value: 'all', label: 'All statuses' },
    { value: 'lead', label: 'Lead' },
    { value: 'prospect', label: 'Prospect' },
    { value: 'customer', label: 'Customer' },
    { value: 'inactive', label: 'Inactive' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600">{filteredContacts.length} contacts</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48"
          />
        </div>
      </Card>

      {/* Contacts list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-gray-200 rounded" />
                  <div className="h-3 w-32 bg-gray-200 rounded" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : filteredContacts.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts yet</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first contact.</p>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredContacts.map((contact) => (
            <Card key={contact.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-medium text-primary-700">
                      {contact.first_name?.charAt(0)}{contact.last_name?.charAt(0)}
                    </span>
                  </div>
                    <div>
                    <div className="flex items-center gap-3 mb-1">
                      <Link to={`/contacts/${contact.id}`} className="hover:underline">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {contact.first_name} {contact.last_name}
                        </h3>
                      </Link>
                      <Badge
                        variant={
                          contact.status === 'customer' ? 'success' :
                          contact.status === 'lead' ? 'info' :
                          contact.status === 'prospect' ? 'warning' : 'default'
                        }
                      >
                        {contact.status}
                      </Badge>
                    </div>
                    {contact.job_title && (
                      <p className="text-gray-600 mb-2">{contact.job_title}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      {contact.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {contact.email}
                        </span>
                      )}
                      {contact.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {contact.phone}
                        </span>
                      )}
                      {contact.company && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {contact.company.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/contacts/${contact.id}`}>
                    <Button variant="outline" size="sm">View</Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(contact.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Contact Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Contact"
      >
        <form onSubmit={handleAddContact} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={newContact.first_name}
              onChange={(e) => setNewContact({ ...newContact, first_name: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              value={newContact.last_name}
              onChange={(e) => setNewContact({ ...newContact, last_name: e.target.value })}
              required
            />
          </div>
          <Input
            label="Email"
            type="email"
            value={newContact.email}
            onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
          />
          <Input
            label="Phone"
            value={newContact.phone}
            onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
          />
          <Input
            label="Job Title"
            value={newContact.job_title}
            onChange={(e) => setNewContact({ ...newContact, job_title: e.target.value })}
          />
          <Select
            label="Company"
            options={[
              { value: '', label: 'No company' },
              ...companies.map((c) => ({ value: c.id, label: c.name })),
            ]}
            value={newContact.organization_id}
            onChange={(e) => setNewContact({ ...newContact, organization_id: e.target.value })}
          />
          <Select
            label="Status"
            options={[
              { value: 'lead', label: 'Lead' },
              { value: 'prospect', label: 'Prospect' },
              { value: 'customer', label: 'Customer' },
              { value: 'inactive', label: 'Inactive' },
            ]}
            value={newContact.status}
            onChange={(e) => setNewContact({ ...newContact, status: e.target.value as any })}
          />
          <Input
            label="Lead Source"
            value={newContact.lead_source}
            onChange={(e) => setNewContact({ ...newContact, lead_source: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Contact</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
