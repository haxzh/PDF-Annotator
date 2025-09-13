import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PdfViewer from '../components/PdfViewer';

const AnnotatorPage = () => {
  const { pdfUuid } = useParams();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4">
      <button
        onClick={() => navigate('/dashboard')}
        className="bg-gray-500 text-white py-2 px-4 rounded-md mb-4 hover:bg-gray-600"
      >
        &larr; Back to Dashboard
      </button>
      <h1 className="text-3xl font-bold mb-6">Annotate PDF</h1>
      {pdfUuid ? (
        <PdfViewer pdfUuid={pdfUuid} />
      ) : (
        <p>Please select a PDF to annotate from your dashboard.</p>
      )}
    </div>
  );
};

export default AnnotatorPage;