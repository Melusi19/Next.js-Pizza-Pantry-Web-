'use client'

import { useState, useMemo } from 'react'
import { QuantityAudit } from '@/types/inventory'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Filter, X, ArrowUpDown, Calendar, Package } from 'lucide-react'

interface AuditLogListProps {
  initialLogs: QuantityAudit[]
}

interface AuditLogWithItem extends QuantityAudit {
  item?: {
    name: string
    category: string
  }
}

export function AuditLogList({ initialLogs }: AuditLogListProps) {
  const [logs] = useState<AuditLogWithItem[]>(initialLogs)
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Search filter
      const matchesSearch = search === '' || 
        log.item?.name.toLowerCase().includes(search.toLowerCase()) ||
        log.reason?.toLowerCase().includes(search.toLowerCase())

      // Date filter
      const logDate = new Date(log.createdAt)
      const now = new Date()
      const matchesDate = dateFilter === 'all' || 
        (dateFilter === 'today' && logDate.toDateString() === now.toDateString()) ||
        (dateFilter === 'week' && (now.getTime() - logDate.getTime()) < 7 * 24 * 60 * 60 * 1000) ||
        (dateFilter === 'month' && logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear())

      // Type filter
      const matchesType = typeFilter === 'all' ||
        (typeFilter === 'add' && log.change > 0) ||
        (typeFilter === 'remove' && log.change < 0)

      return matchesSearch && matchesDate && matchesType
    })
  }, [logs, search, dateFilter, typeFilter])

  const clearFilters = () => {
    setSearch('')
    setDateFilter('all')
    setTypeFilter('all')
  }

  const hasActiveFilters = search !== '' || dateFilter !== 'all' || typeFilter !== 'all'

  const getChangeType = (change: number) => {
    return change > 0 ? 'add' : 'remove'
  }

  const getChangeColor = (change: number) => {
    return change > 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
  }

  const getChangeIcon = (change: number) => {
    return change > 0 ? '↗' : '↘'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d ago`
    }
  }

  const getStats = () => {
    const totalAdditions = logs.filter(log => log.change > 0).reduce((sum, log) => sum + log.change, 0)
    const totalRemovals = logs.filter(log => log.change < 0).reduce((sum, log) => sum + Math.abs(log.change), 0)
    const totalTransactions = logs.length

    return { totalAdditions, totalRemovals, totalTransactions }
  }

  const stats = getStats()

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Added</p>
              <p className="text-2xl font-bold text-green-600">+{stats.totalAdditions}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-lg">↗</span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Used</p>
              <p className="text-2xl font-bold text-red-600">-{stats.totalRemovals}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-lg">↘</span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalTransactions}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <ArrowUpDown className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by item name or reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
            
            {hasActiveFilters && (
              <Button
                variant="secondary"
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {showFilters && (
          <Card className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-900">Filter Audit Logs</h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowFilters(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Time Period
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="input"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Past Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Package className="w-4 h-4 inline mr-2" />
                  Transaction Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="input"
                >
                  <option value="all">All Transactions</option>
                  <option value="add">Stock Added</option>
                  <option value="remove">Stock Used</option>
                </select>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Audit Log List */}
      <div className="space-y-4">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <Card key={log._id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getChangeColor(log.change)}`}>
                      <span className="font-semibold">{getChangeIcon(log.change)}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {log.item?.name || 'Unknown Item'}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {log.item?.category || 'Uncategorized'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Change:</span>
                      <p className={`font-semibold ${log.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {log.change > 0 ? '+' : ''}{log.change}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Quantity:</span>
                      <p className="font-medium">
                        {log.previousQuantity} → {log.newQuantity}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Time:</span>
                      <p className="font-medium" title={formatDate(log.createdAt.toString())}>
                        {formatRelativeTime(log.createdAt.toString())}
                      </p>
                    </div>
                  </div>

                  {log.reason && (
                    <div className="mt-2">
                      <span className="text-sm text-gray-600">Reason: </span>
                      <span className="text-sm text-gray-900">{log.reason}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No audit logs found
            </h3>
            <p className="text-gray-500 mb-4">
              {logs.length === 0 
                ? "Audit logs will appear here when you make changes to your inventory."
                : "Try adjusting your search or filter criteria."
              }
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Summary */}
      {filteredLogs.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Showing {filteredLogs.length} of {logs.length} transactions
          {hasActiveFilters && ' (filtered)'}
        </div>
      )}
    </div>
  )
}
