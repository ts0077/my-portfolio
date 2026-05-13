'use client'

import { useState } from 'react'

interface RoleEntry {
  id: number
  role: string
  time: string
  price: string
}

interface MintProject {
  id: number
  projectName: string
  chain: string
  supply: string
  xLink: string
  mintLink: string
  fireCount: number
  roles: RoleEntry[]
  extraNotes: string
}

export default function MintInfo() {
  const [projects, setProjects] = useState<MintProject[]>([])
  const [formData, setFormData] = useState({
    projectName: '',
    chain: 'ETH',
    supply: '',
    xLink: '',
    mintLink: '',
    fireCount: 3,
    extraNotes: ''
  })
  
  const [roles, setRoles] = useState<RoleEntry[]>([])
  const [roleForm, setRoleForm] = useState({
    role: 'GTD',
    time: '',
    price: ''
  })
  
  const [finalOutput, setFinalOutput] = useState('')
  const [showFinalEditor, setShowFinalEditor] = useState(false)

  const today = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'fireCount' ? parseInt(value) : value
    }))
  }

  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setRoleForm(prev => ({ ...prev, [name]: value }))
  }

  const addRole = () => {
    if (!roleForm.role || !roleForm.time || !roleForm.price) {
      alert('Please fill in role, time and price')
      return
    }
    
    const newRole: RoleEntry = {
      id: Date.now(),
      role: roleForm.role,
      time: roleForm.time,
      price: roleForm.price.toUpperCase() === 'FREE' ? 'FREE' : roleForm.price
    }
    
    setRoles(prev => [...prev, newRole])
    setRoleForm({ role: 'GTD', time: '', price: '' })
  }

  const removeRole = (id: number) => {
    setRoles(prev => prev.filter(r => r.id !== id))
  }

  const handleAdd = () => {
    if (!formData.projectName || !formData.chain || !formData.supply || roles.length === 0) {
      alert('Please fill in project name, chain, supply and at least one role')
      return
    }

    const newProject: MintProject = {
      id: Date.now(),
      ...formData,
      roles: [...roles],
      extraNotes: formData.extraNotes
    }

    setProjects(prev => [...prev, newProject])
    
    // Clear form
    setFormData({
      projectName: '',
      chain: 'ETH',
      supply: '',
      xLink: '',
      mintLink: '',
      fireCount: 3,
      extraNotes: ''
    })
    setRoles([])
  }

  const handleDelete = (id: number) => {
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  const formatRoleLine = (project: MintProject) => {
    return project.roles.map(r => {
      const timeStr = r.time.includes('UTC') ? r.time : r.time + ' UTC'
      const priceStr = r.price.toUpperCase() === 'FREE' 
        ? 'FREE' 
        : r.price + ' ' + project.chain
      return `${r.role} - ${timeStr} ( ${priceStr} )`
    }).join(' | ')
  }

  const generateOutput = () => {
    if (projects.length === 0) return `Today Mints       (${today})\n\nNo projects added yet.`
    
    let output = `Today Mints       (${today})\n\n`
    
    projects.forEach((project, index) => {
      const fires = ':fire: '.repeat(project.fireCount).trim()
      output += `${index + 1}: ${project.projectName.padEnd(45)} (${project.chain})   ${fires}\n\n`
      output += `Supply: ${project.supply}\n`
      output += formatRoleLine(project) 
      
      if (project.xLink) {
        output += `\nX: <${project.xLink}>`
      }
      if (project.mintLink) {
        output += `\nMint Link: <${project.mintLink}>`
      }
      if (project.extraNotes) {
        output += `\n${project.extraNotes}`
      }
      output += '\n\n'
    })
    
    return output.trim()
  }

  const copyToClipboard = () => {
    const output = finalOutput || generateOutput()
    navigator.clipboard.writeText(output)
    alert('Copied to clipboard!')
  }

  const openFinalEditor = () => {
    setFinalOutput(generateOutput())
    setShowFinalEditor(true)
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>🎯 Mint Info Generator</h1>
      
      {/* Main Form */}
      <div style={{ 
        background: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '10px', 
        marginBottom: '20px',
        border: '1px solid #ddd'
      }}>
        <h3 style={{ marginTop: 0, color: '#555' }}>Project Details</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#666' }}>
              Project Name *
            </label>
            <input
              type="text"
              name="projectName"
              value={formData.projectName}
              onChange={handleInputChange}
              placeholder="e.g. Totem"
              style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#666' }}>
              Chain *
            </label>
            <input
              type="text"
              name="chain"
              value={formData.chain}
              onChange={handleInputChange}
              placeholder="e.g. ETH"
              style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#666' }}>
              Supply *
            </label>
            <input
              type="text"
              name="supply"
              value={formData.supply}
              onChange={handleInputChange}
              placeholder="e.g. 4444"
              style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#666' }}>
              Fire Count 🔥
            </label>
            <select
              name="fireCount"
              value={formData.fireCount}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
            >
              <option value={1}>1 🔥</option>
              <option value={2}>2 🔥🔥</option>
              <option value={3}>3 🔥🔥🔥</option>
              <option value={4}>4 🔥🔥🔥🔥</option>
              <option value={5}>5 🔥🔥🔥🔥🔥</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#666' }}>
              X/Twitter Link
            </label>
            <input
              type="url"
              name="xLink"
              value={formData.xLink}
              onChange={handleInputChange}
              placeholder="https://x.com/project"
              style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#666' }}>
            Mint Link
          </label>
          <input
            type="url"
            name="mintLink"
            value={formData.mintLink}
            onChange={handleInputChange}
            placeholder="https://mint-site.com/..."
            style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#666' }}>
            Extra Notes (Optional - appears at end of project)
          </label>
          <textarea
            name="extraNotes"
            value={formData.extraNotes}
            onChange={handleInputChange}
            placeholder="Any additional info..."
            rows={2}
            style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc', resize: 'vertical' }}
          />
        </div>

        {/* Roles Section */}
        <div style={{ 
          background: 'white', 
          padding: '15px', 
          borderRadius: '8px', 
          border: '2px solid #4CAF50',
          marginBottom: '15px'
        }}>
          <h4 style={{ marginTop: 0, color: '#4CAF50' }}>➕ Add Roles (GTD, WL, Public, etc.)</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#666' }}>
                Role
              </label>
              <input
                type="text"
                name="role"
                value={roleForm.role}
                onChange={handleRoleChange}
                placeholder="GTD, WL, Public..."
                style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#666' }}>
                Time (auto +UTC)
              </label>
              <input
                type="text"
                name="time"
                value={roleForm.time}
                onChange={handleRoleChange}
                placeholder="3:15"
                style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#666' }}>
                Price (auto +chain, FREE = no chain)
              </label>
              <input
                type="text"
                name="price"
                value={roleForm.price}
                onChange={handleRoleChange}
                placeholder="0.0007 or FREE"
                style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
              />
            </div>
            
            <button
              onClick={addRole}
              style={{
                background: '#4CAF50',
                color: 'white',
                padding: '8px 20px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                height: 'fit-content'
              }}
            >
              Add Role
            </button>
          </div>

          {/* Added Roles List */}
          {roles.length > 0 && (
            <div style={{ marginTop: '15px' }}>
              <strong>Added Roles:</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px' }}>
                {roles.map(role => (
                  <div 
                    key={role.id}
                    style={{
                      background: '#e8f5e9',
                      padding: '5px 12px',
                      borderRadius: '15px',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>{role.role} - {role.time} UTC ( {role.price.toUpperCase() === 'FREE' ? 'FREE' : role.price + ' ' + formData.chain} )</span>
                    <button
                      onClick={() => removeRole(role.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#f44336',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        padding: '0',
                        lineHeight: 1
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <button
          onClick={handleAdd}
          disabled={roles.length === 0}
          style={{
            background: roles.length === 0 ? '#ccc' : '#2196F3',
            color: 'white',
            padding: '12px 30px',
            border: 'none',
            borderRadius: '5px',
            cursor: roles.length === 0 ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            width: '100%'
          }}
        >
          💾 Save Project & Clear Form
        </button>
      </div>

      {/* Projects List */}
      {projects.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#555' }}>📋 Saved Projects ({projects.length})</h3>
          {projects.map((project, index) => (
            <div 
              key={project.id}
              style={{
                background: 'white',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '10px',
                border: '1px solid #e0e0e0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}
            >
              <div style={{ flex: 1 }}>
                <strong>{index + 1}. {project.projectName}</strong> ({project.chain}) {'🔥'.repeat(project.fireCount)}
                <br />
                <small style={{ color: '#666' }}>
                  Supply: {project.supply} | Roles: {project.roles.length}
                </small>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
                  {formatRoleLine(project)}
                </div>
              </div>
              <button
                onClick={() => handleDelete(project.id)}
                style={{
                  background: '#ff4444',
                  color: 'white',
                  border: 'none',
                  padding: '5px 15px',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Output Section */}
      {projects.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ color: '#555', margin: 0 }}>📝 Final Output</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={openFinalEditor}
                style={{
                  background: '#FF9800',
                  color: 'white',
                  padding: '8px 20px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                ✏️ Edit Output
              </button>
              <button
                onClick={copyToClipboard}
                style={{
                  background: '#2196F3',
                  color: 'white',
                  padding: '8px 20px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                📋 Copy
              </button>
            </div>
          </div>
          
          {showFinalEditor ? (
            <div>
              <textarea
                value={finalOutput}
                onChange={(e) => setFinalOutput(e.target.value)}
                rows={15}
                style={{
                  width: '100%',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '2px solid #FF9800',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  resize: 'vertical'
                }}
              />
              <button
                onClick={() => setShowFinalEditor(false)}
                style={{
                  marginTop: '10px',
                  background: '#4CAF50',
                  color: 'white',
                  padding: '8px 20px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                ✅ Done Editing
              </button>
            </div>
          ) : (
            <pre
              style={{
                background: '#1e1e1e',
                color: '#d4d4d4',
                padding: '20px',
                borderRadius: '8px',
                overflow: 'auto',
                fontFamily: 'monospace',
                fontSize: '14px',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word'
              }}
            >
              {generateOutput()}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}