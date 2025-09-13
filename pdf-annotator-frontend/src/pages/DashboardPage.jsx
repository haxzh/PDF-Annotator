import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import PdfList from '../components/PdfList';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [pdfs, setPdfs] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        const res = await api.get('/pdf');
        setPdfs(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/auth');
        }
        console.error('Error fetching PDFs:', err);
      }
    };
    fetchPdfs();
  }, [navigate]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('pdfFile', file);
    try {
      await api.post('/pdf/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('File uploaded successfully!');
      // Refresh the PDF list
      const res = await api.get('/pdf');
      setPdfs(res.data);
      setFile(null);
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('File upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-bold mb-4">Upload a new PDF</h2>
        <form onSubmit={handleFileUpload}>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="mb-4"
          />
          <button
            type="submit"
            disabled={!file || uploading}
            className={`w-full bg-green-500 text-white py-2 rounded-md ${
              !file || uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'
            }`}
          >
            {uploading ? 'Uploading...' : 'Upload PDF'}
          </button>
        </form>
      </div>
      <PdfList pdfs={pdfs} setPdfs={setPdfs} />
    </div>
  );
};

export default DashboardPage;