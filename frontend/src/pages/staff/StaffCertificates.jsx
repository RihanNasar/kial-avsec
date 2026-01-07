import { useState, useEffect } from 'react';
import { staffAPI } from '../../services/api';
import CertificatesPage from '../../components/CertificatesPage';

const StaffCertificates = () => {
  return (
    <CertificatesPage
      title="My Certificates"
      description="Manage your training and clearance certificates"
      fetchCertificates={staffAPI.getCertificates}
      createCertificate={staffAPI.createCertificate}
      updateCertificate={staffAPI.updateCertificate}
      deleteCertificate={staffAPI.deleteCertificate}
      showStaffColumn={false}
    />
  );
};

export default StaffCertificates;
