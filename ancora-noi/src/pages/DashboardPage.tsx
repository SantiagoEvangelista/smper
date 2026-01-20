import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, Building2, Briefcase, FolderKanban, TrendingUp, Clock } from 'lucide-react'
import { useDataStore } from '@/store/dataStore'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, Badge } from '@/components/ui'

export function DashboardPage() {
  const { user } = useAuthStore()
  const { contacts, companies, deals, projects, loading, fetchContacts, fetchCompanies, fetchDeals, fetchProjects } = useDataStore()

  useEffect(() => {
    fetchContacts()
    fetchCompanies()
    fetchDeals()
    fetchProjects()
  }, [fetchContacts, fetchCompanies, fetchDeals, fetchProjects])

  const totalPipelineValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0)
  const activeDeals = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage))
  const activeProjects = projects.filter(p => p.status === 'in_progress')

  const stats = [
    {
      name: 'Total Contacts',
      value: contacts.length,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Companies',
      value: companies.length,
      icon: Building2,
      color: 'bg-green-500',
    },
    {
      name: 'Active Deals',
      value: activeDeals.length,
      icon: Briefcase,
      color: 'bg-purple-500',
    },
    {
      name: 'Pipeline Value',
      value: formatCurrency(totalPipelineValue),
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.full_name || 'there'}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your business today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Contacts</h2>
            <Link to="/contacts" className="text-sm text-primary-600 hover:underline">
              View all
            </Link>
          </div>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg" />
              ))}
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No contacts yet</p>
              <Link to="/contacts" className="text-primary-600 text-sm hover:underline">
                Add your first contact
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {contacts.slice(0, 5).map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-700">
                        {contact.first_name?.charAt(0)}{contact.last_name?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {contact.first_name} {contact.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{contact.email}</p>
                    </div>
                  </div>
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
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Active Projects</h2>
            <Link to="/projects" className="text-sm text-primary-600 hover:underline">
              View all
            </Link>
          </div>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg" />
              ))}
            </div>
          ) : activeProjects.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FolderKanban className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No active projects</p>
              <Link to="/projects" className="text-primary-600 text-sm hover:underline">
                Create a project
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activeProjects.slice(0, 5).map((project) => (
                <div key={project.id} className="p-3 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900">{project.name}</p>
                    <Badge variant="info">{project.status.replace('_', ' ')}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDate(project.end_date)}
                    </span>
                    {project.budget && (
                      <span>{formatCurrency(project.budget)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/contacts/new">
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <span className="font-medium text-gray-900">Add Contact</span>
            </div>
          </Card>
        </Link>
        <Link to="/companies/new">
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Building2 className="w-5 h-5 text-green-600" />
              </div>
              <span className="font-medium text-gray-900">Add Company</span>
            </div>
          </Card>
        </Link>
        <Link to="/deals/new">
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Briefcase className="w-5 h-5 text-purple-600" />
              </div>
              <span className="font-medium text-gray-900">Add Deal</span>
            </div>
          </Card>
        </Link>
        <Link to="/projects/new">
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <FolderKanban className="w-5 h-5 text-orange-600" />
              </div>
              <span className="font-medium text-gray-900">New Project</span>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  )
}
