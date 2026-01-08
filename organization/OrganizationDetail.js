import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getOrganization } from '../../services/organizationService';
import './OrganizationDetail.css';

const OrganizationDetail = () => {
  const [organization, setOrganization] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { orgId } = useParams();

  useEffect(() => {
    loadOrganization();
  }, [orgId]);

  const loadOrganization = async () => {
    try {
      setIsLoading(true);
      const data = await getOrganization(orgId);
      setOrganization(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load organization');
      console.error('Load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="org-detail-loading">Loading organization details...</div>;
  }

  if (error) {
    return (
      <div className="org-detail-error">
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => navigate('/organizations')}>
          Back to Organizations
        </button>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="org-detail-error">
        <p>Organization not found</p>
        <button className="btn btn-primary" onClick={() => navigate('/organizations')}>
          Back to Organizations
        </button>
      </div>
    );
  }

  return (
    <div className="org-detail-container">
      <div className="org-detail-header">
        <h2>{organization.name}</h2>
        <div className="org-detail-actions">
          <button 
            className="btn btn-warning"
            onClick={() => navigate(`/organizations/edit/${orgId}`)}
          >
            Edit
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/organizations')}
          >
            Back
          </button>
        </div>
      </div>

      <div className="org-detail-card">
        <div className="org-detail-grid">
          <div className="org-detail-item">
            <label>Status</label>
            <span className={`org-status ${organization.active ? 'active' : 'inactive'}`}>
              {organization.active ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="org-detail-item">
            <label>Email</label>
            <a href={`mailto:${organization.email}`}>{organization.email}</a>
          </div>

          <div className="org-detail-item">
            <label>Phone</label>
            <a href={`tel:${organization.phone}`}>{organization.phone}</a>
          </div>

          <div className="org-detail-item">
            <label>Address</label>
            <p>{organization.address}</p>
          </div>

          {organization.city && (
            <div className="org-detail-item">
              <label>City</label>
              <p>{organization.city}</p>
            </div>
          )}

          {organization.state && (
            <div className="org-detail-item">
              <label>State</label>
              <p>{organization.state}</p>
            </div>
          )}

          {organization.zip && (
            <div className="org-detail-item">
              <label>Zip Code</label>
              <p>{organization.zip}</p>
            </div>
          )}

          {organization.id && (
            <div className="org-detail-item">
              <label>Organization ID</label>
              <p>{organization.id}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizationDetail;
