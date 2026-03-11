import { useState } from 'react'
import { useMentorResources } from '../../../hooks/useMentorResources'

const MentorshipResources = () => {
  const { resources, loading, error, createResource, updateResource, deleteResource } = useMentorResources()
  const [isCreating, setIsCreating] = useState(false)
  const [editingResource, setEditingResource] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'document',
    url: '',
    status: 'active'
  })

  const resourceStatusOptions = [
    { value: 'active', label: 'Visible to mentees' },
    { value: 'inactive', label: 'Hidden' }
  ]

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'document',
      url: '',
      status: 'active'
    })
    setIsCreating(false)
    setEditingResource(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingResource) {
        await updateResource(editingResource._id, formData)
      } else {
        await createResource(formData)
      }
      resetForm()
    } catch (error) {
      console.error('Failed to save resource:', error)
    }
  }

  const handleEdit = (resource) => {
    setEditingResource(resource)
    setFormData({
      title: resource.title,
      description: resource.description,
      type: resource.type,
      url: resource.url,
      status: resource.status
    })
  }

  const handleDelete = async (resourceId) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await deleteResource(resourceId)
      } catch (error) {
        console.error('Failed to delete resource:', error)
      }
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Resources & Materials</h2>
          <p className="text-sm text-slate-500">Upload decks, handbooks, or helpful links for your mentees.</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Resource
        </button>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingResource) && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-slate-900 mb-4">
            {editingResource ? 'Edit Resource' : 'Add New Resource'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Give your resource a clear title"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Give mentees context on what this resource covers."
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="document">Document</option>
                  <option value="video">Video</option>
                  <option value="link">Link</option>
                  <option value="template">Template</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">URL</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/resource"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {resourceStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingResource ? 'Update Resource' : 'Add Resource'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Resources List */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-500">Loading resources...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error.message || 'Failed to load resources'}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {resources.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-slate-400">
                <svg className="h-12 w-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg font-medium">No resources uploaded yet</p>
                <p className="text-sm mt-1">Share templates, guides, or recordings to support your mentees</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {resources.map((resource) => (
                <div key={resource._id} className="bg-white border border-slate-200 rounded-lg p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-medium text-slate-900">{resource.title}</h3>
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          resource.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {resource.status === 'active' ? 'Visible to mentees' : 'Hidden'}
                        </span>
                      </div>
                      <p className="text-slate-600 mb-3">{resource.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="text-slate-500">
                          Type: <span className="font-medium text-slate-700 capitalize">{resource.type}</span>
                        </span>
                        {resource.url && (
                          <span className="text-slate-500">
                            URL:{' '}
                            <a 
                              href={resource.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {resource.url}
                            </a>
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(resource)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(resource._id)}
                        className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default MentorshipResources
