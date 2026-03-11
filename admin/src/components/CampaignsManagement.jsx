import { useMemo, useState } from "react";
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
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: campaigns = [], isLoading, error } = useApiList("/campaigns");

  const handleEdit = (id) => {
    navigate(`/admin/campaigns/${id}/edit`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this campaign?")) {
      try {
        await api.delete(`/campaigns/${id}`);
        window.location.reload();
      } catch {
        alert("Delete failed");
      }
    }
  };

  const normalizedCampaigns = useMemo(() => {
    return campaigns.map((c) => {
      const goal = Number(c.goalAmount ?? 0);
      const raised = Number(c.raisedAmount ?? 0);

      return {
        id: c.id || c._id,
        title: c.title || "Untitled Campaign",
        description: c.description || "",
        goal,
        raised,
        deadline: c.deadline,
        status: deriveStatus({
          goalAmount: goal,
          raisedAmount: raised,
          deadline: c.deadline,
        }),
        donors: c.contributionCount ?? 0,
        postedBy: c.createdByName || "—",
      };
    });
  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {
    const query = searchTerm.toLowerCase();

    return normalizedCampaigns.filter((c) => {
      const matchSearch =
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query);

      const matchStatus =
        filterStatus === "all" || c.status === filterStatus;

      return matchSearch && matchStatus;
    });
  }, [normalizedCampaigns, searchTerm, filterStatus]);

  return (
    <div className="px-6 py-6 space-y-6 bg-slate-50 min-h-screen">

      {/* Header */}

      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Campaigns Management
        </h1>
        <p className="text-sm text-slate-500">
          Manage fundraising campaigns
        </p>
      </div>

      {/* Filters */}

      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center gap-3">

        {/* Search */}

        <div className="relative flex-1 max-w-sm">

          <input
            type="text"
            placeholder="Search campaign..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 pl-9 text-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
          />

          <svg
            className="absolute left-3 top-2.5 w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>

        </div>

        {/* Status Filter */}

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-xs bg-white"
        >
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="Closed">Closed</option>
        </select>

        {/* Create Button */}

        <button
          onClick={() => navigate("/admin/campaigns/create")}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
        >
          + Create Campaign
        </button>

      </div>

      {/* Campaign Grid */}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        {isLoading && (
          <div className="col-span-full text-center py-12 text-slate-400">
            Loading campaigns...
          </div>
        )}

        {!isLoading && filteredCampaigns.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-400">
            No campaigns found
          </div>
        )}

        {filteredCampaigns.map((campaign) => {

          const progress =
            campaign.goal > 0
              ? (campaign.raised / campaign.goal) * 100
              : 0;

          return (

            <div
              key={campaign.id}
              onClick={() => navigate(`/admin/campaigns/${campaign.id}`)}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition cursor-pointer"
            >

              {/* Title */}

              <div className="flex justify-between items-start mb-3">

                <h3
                  className="text-lg font-semibold text-slate-900 max-w-[180px]"
                  title={campaign.title}
                >
                  {truncateToTwoWords(campaign.title)}
                </h3>

                <span
                  className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(
                    campaign.status
                  )}`}
                >
                  {campaign.status}
                </span>

              </div>

              {/* Description */}

              <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                {campaign.description}
              </p>

              {/* Goal + Raised */}

              <div className="space-y-2 text-sm">

                <div className="flex justify-between">
                  <span className="text-slate-500">Goal</span>
                  <span className="font-semibold">
                    {formatCurrency(campaign.goal)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Raised</span>
                  <span className="text-emerald-600 font-semibold">
                    {formatCurrency(campaign.raised)}
                  </span>
                </div>

              </div>

              {/* Progress */}

              <div className="mt-3">

                <div className="w-full bg-slate-200 rounded-full h-2">

                  <div
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />

                </div>

                <div className="text-xs text-slate-500 mt-1">
                  {progress.toFixed(1)}% funded
                </div>

              </div>

              {/* Footer */}

              <div className="flex justify-between items-center mt-4 text-xs text-slate-500">

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/admin/campaigns/${campaign.id}/donors`);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-100"
                >
                  Donors ({campaign.donors})
                </button>

                <span>Deadline: {formatDate(campaign.deadline)}</span>

              </div>

              {/* Actions */}

              <div className="flex justify-end mt-4">

                <div className="relative group">

                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200"
                  >
                    Actions
                  </button>

                  <div className="absolute right-0 z-10 mt-1 w-32 bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(campaign.id);
                      }}
                      className="block w-full text-left px-3 py-2 text-xs hover:bg-blue-50"
                    >
                      Edit
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(campaign.id);
                      }}
                      className="block w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </div>

            </div>

          );

        })}

      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

    </div>
  );
};

export default CampaignsManagement;