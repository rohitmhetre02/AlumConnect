import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useApiList from "../hooks/useApiList";
import { api } from "../utils/api";
import getStatusBadgeClass from "../utils/status";

const formatCurrency = (amount) => {
  if (!Number.isFinite(amount)) return "$0";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date) => {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const deriveStatus = (campaign) => {
  if (!campaign) return "Active";
  const { goalAmount, raisedAmount, deadline } = campaign;

  if (goalAmount && raisedAmount >= goalAmount) return "Completed";

  if (deadline) {
    const due = new Date(deadline);
    if (due < new Date()) {
      return raisedAmount >= goalAmount * 0.5 ? "Completed" : "Closed";
    }
  }

  return "Active";
};

const truncateToTwoWords = (title) => {
  if (!title) return "";
  const words = title.trim().split(/\s+/);
  return words.length > 2 ? `${words.slice(0, 2).join(" ")}...` : title;
};

const CampaignsManagement = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState("");
  const [actionsDropdown, setActionsDropdown] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data: campaigns = [], isLoading, error } = useApiList("/campaigns");

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const total = campaigns.length;
    const active = campaigns.filter(c => deriveStatus(c) === 'Active').length;
    const completed = campaigns.filter(c => deriveStatus(c) === 'Completed').length;
    const scheduled = campaigns.filter(c => deriveStatus(c) === 'Scheduled').length;
    const totalParticipants = campaigns.reduce((sum, c) => sum + (c.contributionCount || 0), 0);

    return { total, active, completed, scheduled, totalParticipants };
  }, [campaigns]);

  // Handle row click to open campaign details
  const handleRowClick = (campaignId) => {
    navigate(`/admin/campaigns/${campaignId}`);
  };

  // Handle actions dropdown
  const handleActionsClick = (e, campaignId) => {
    e.stopPropagation();
    setActionsDropdown(actionsDropdown === campaignId ? null : campaignId);
  };

  // Handle edit campaign
  const handleEdit = (campaignId) => {
    navigate(`/admin/campaigns/${campaignId}/edit`);
    setActionsDropdown(null);
  };

  // Handle pause campaign
  const handlePause = (campaignId) => {
    alert("Pause functionality coming soon!");
    setActionsDropdown(null);
  };

  // Handle resume campaign
  const handleResume = (campaignId) => {
    alert("Resume functionality coming soon!");
    setActionsDropdown(null);
  };

  // Handle delete campaign
  const handleDelete = (campaignId) => {
    if (window.confirm("Delete this campaign?")) {
      api.delete(`/campaigns/${campaignId}`)
        .then(() => {
          window.location.reload();
        })
        .catch(() => {
          alert("Delete failed");
        });
    }
    setActionsDropdown(null);
  };

  // Handle export data
  const handleExport = () => {
    alert("Export functionality coming soon!");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActionsDropdown(null);
    };
    
    if (actionsDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [actionsDropdown]);

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        campaign.title?.toLowerCase().includes(searchLower) ||
        campaign.createdByName?.toLowerCase().includes(searchLower) ||
        campaign.department?.toLowerCase().includes(searchLower) ||
        campaign.id?.toLowerCase().includes(searchLower);

      const matchesStatus = statusFilter === "all" || deriveStatus(campaign) === statusFilter;
      const matchesDepartment = departmentFilter === "all" || campaign.department === departmentFilter;
      const matchesType = typeFilter === "all" || campaign.campaignType === typeFilter;

      return matchesSearch && matchesStatus && matchesDepartment && matchesType;
    });
  }, [campaigns, searchTerm, statusFilter, departmentFilter, typeFilter]);

  // Pagination
  const paginatedCampaigns = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredCampaigns.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredCampaigns, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredCampaigns.length / rowsPerPage);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mb-6"></div>
          <div className="grid grid-cols-5 gap-4 mb-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaigns Management</h1>
          <p className="text-gray-600 mt-1">Manage and monitor all campaigns.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/admin/campaigns/create")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Campaign
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Export Campaign Data
          </button>
        </div>
      </div>

      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Campaigns</p>
              <p className="text-2xl font-bold text-green-600">{summaryStats.active}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed Campaigns</p>
              <p className="text-2xl font-bold text-gray-600">{summaryStats.completed}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Scheduled Campaigns</p>
              <p className="text-2xl font-bold text-blue-600">{summaryStats.scheduled}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Participants</p>
              <p className="text-2xl font-bold text-purple-600">{summaryStats.totalParticipants}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search Bar */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by Campaign Name, Organizer, or Type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Departments</option>
            <option value="Computer Engineering">Computer Engineering</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electronics & Telecommunication">Electronics & Telecommunication</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Civil Engineering">Civil Engineering</option>
          </select>

          {/* Campaign Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="fundraising">Fundraising</option>
            <option value="awareness">Awareness</option>
            <option value="workshop">Workshop</option>
            <option value="competition">Competition</option>
          </select>

          {/* Date Range */}
          <input
            type="date"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Campaign Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organizer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donors</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedCampaigns.map((campaign, index) => {
                const status = deriveStatus(campaign);
                const statusColors = {
                  'Active': 'bg-green-100 text-green-800',
                  'Completed': 'bg-gray-100 text-gray-800',
                  'Scheduled': 'bg-blue-100 text-blue-800',
                  'Cancelled': 'bg-red-100 text-red-800'
                };

                // Format organizer with name and role
                const organizerInfo = campaign.createdByName && campaign.createdByRole 
                  ? `${campaign.createdByName} (${campaign.createdByRole})`
                  : campaign.createdByName || '—';

                return (
                  <tr 
                    key={campaign.id} 
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleRowClick(campaign.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        title={campaign.title}
                      >
                        {truncateToTwoWords(campaign.title)}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{organizerInfo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{campaign.campaignType || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(campaign.startDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(campaign.endDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/campaigns/${campaign.id}/donors`);
                        }}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-sm"
                      >
                        View Donors
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="relative">
                        <button
                          onClick={(e) => handleActionsClick(e, campaign.id)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                        >
                          Actions
                        </button>
                        
                        {actionsDropdown === campaign.id && (
                          <div className="absolute right-0 z-10 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                            <button
                              onClick={() => handleEdit(campaign.id)}
                              className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-50 text-gray-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handlePause(campaign.id)}
                              className="block w-full text-left px-4 py-2 text-sm hover:bg-yellow-50 text-gray-700"
                            >
                              Pause Campaign
                            </button>
                            <button
                              onClick={() => handleResume(campaign.id)}
                              className="block w-full text-left px-4 py-2 text-sm hover:bg-green-50 text-gray-700"
                            >
                              Resume Campaign
                            </button>
                            <button
                              onClick={() => handleDelete(campaign.id)}
                              className="block w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600"
                            >
                              Delete Campaign
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {paginatedCampaigns.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No campaigns found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="bg-white rounded-lg shadow p-4 mt-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm mt-4">{error}</div>
      )}
    </div>
  );
};

export default CampaignsManagement;