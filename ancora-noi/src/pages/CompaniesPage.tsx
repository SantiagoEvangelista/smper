import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Globe, MapPin, Users, Mail, Phone } from 'lucide-react'
import { useDataStore } from '@/store/dataStore'
import { useAuthStore } from '@/store/authStore'
import { Card, Badge, Button, Input, Modal, Select, Textarea } from '@/components/ui'

export function CompaniesPage() {
  const { user } = useAuthStore()
  const { contacts, companies, loading, fetchContacts, fetchCompanies, addCompany, deleteCompany } = useDataStore()
  const [search, setSearch] = useState('')
  const [industryFilter, setIndustryFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newCompany, setNewCompany] = useState({
    name: '',
    industry: '',
    size: '',
    website: '',
    phone: '',
    address: '',
    notes: '',
  })

  useEffect(() => {
    fetchContacts()
    fetchCompanies()
  }, [fetchContacts, fetchCompanies])

  const getCompanyContactCount = (companyId: string) => {
    return contacts.filter((c) => c.organization_id === companyId).length
  }

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch = company.name.toLowerCase().includes(search.toLowerCase())
    const matchesIndustry = industryFilter === 'all' || company.industry === industryFilter
    return matchesSearch && matchesIndustry
  })

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    await addCompany({
      ...newCompany,
      owner_id: user!.id,
    })
    setShowAddModal(false)
    setNewCompany({
      name: '',
      industry: '',
      size: '',
      website: '',
      phone: '',
      address: '',
      notes: '',
    })
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this company?')) {
      await deleteCompany(id)
    }
  }

  const industries = [...new Set(companies.map((c) => c.industry).filter(Boolean))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-600">{filteredCompanies.length} companies</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Company
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <Select
            options={[
              { value: 'all', label: 'All industries' },
              ...industries.map((i) => ({ value: i || '', label: i })),
            ]}
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="w-full sm:w-48"
          />
        </div>
      </Card>

      {/* Companies grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-6 w-48 bg-gray-200 rounded mb-4" />
              <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </Card>
          ))}
        </div>
      ) : filteredCompanies.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No companies yet</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first company.</p>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Company
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map((company) => (
            <Card key={company.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary-700">
                    {company.name.charAt(0)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/companies/${company.id}`}>
                    <Button variant="outline" size="sm">View</Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(company.id)}>
                    Delete
                  </Button>
                </div>
              </div>
              <Link to={`/companies/${company.id}`} className="hover:underline">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{company.name}</h3>
              </Link>
              <div className="space-y-2 text-sm text-gray-500">
                {company.industry && (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary-500" />
                    {company.industry}
                  </span>
                )}
                {company.size && (
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {company.size}
                  </span>
                )}
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary-600">
                    <Globe className="w-4 h-4" />
                    {company.website}
                  </a>
                )}
                {company.phone && (
                  <span className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {company.phone}
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {getCompanyContactCount(company.id)} contacts
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Company Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Company"
      >
        <form onSubmit={handleAddCompany} className="space-y-4">
          <Input
            label="Company Name"
            value={newCompany.name}
            onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
            required
          />
          <Input
            label="Industry"
            value={newCompany.industry}
            onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })}
          />
          <Select
            label="Size"
            options={[
              { value: '', label: 'Select size' },
              { value: '1-10', label: '1-10 employees' },
              { value: '11-50', label: '11-50 employees' },
              { value: '51-200', label: '51-200 employees' },
              { value: '201-500', label: '201-500 employees' },
              { value: '500+', label: '500+ employees' },
            ]}
            value={newCompany.size}
            onChange={(e) => setNewCompany({ ...newCompany, size: e.target.value })}
          />
          <Input
            label="Website"
            type="url"
            value={newCompany.website}
            onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
          />
          <Input
            label="Phone"
            value={newCompany.phone}
            onChange={(e) => setNewCompany({ ...newCompany, phone: e.target.value })}
          />
          <Input
            label="Address"
            value={newCompany.address}
            onChange={(e) => setNewCompany({ ...newCompany, address: e.target.value })}
          />
          <Textarea
            label="Notes"
            value={newCompany.notes}
            onChange={(e) => setNewCompany({ ...newCompany, notes: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Company</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
