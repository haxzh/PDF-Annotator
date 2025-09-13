import React from 'react';
import api from '../api/api';
import { Link } from 'react-router-dom';

const PdfList = ({ pdfs, setPdfs }) => {
  const handleDelete = async (uuid) => {
    try {
      await api.delete(`/pdf/${uuid}`);
      setPdfs(pdfs.filter(pdf => pdf.uuid !== uuid));
    } catch (err) {
      console.error('Error deleting PDF:', err);
      alert('Failed to delete PDF.');
    }
  };

  const handleRename = async (uuid, currentFilename) => {
    const newFilename = prompt("Enter new filename:", currentFilename);
    if (newFilename && newFilename.trim() !== '') {
      try {
        await api.put(`/pdf/rename/${uuid}`, { newFilename: newFilename.trim() });
        setPdfs(pdfs.map(pdf => pdf.uuid === uuid ? { ...pdf, filename: newFilename.trim() } : pdf));
      } catch (err) {
        console.error('Error renaming PDF:', err);
        alert('Failed to rename PDF.');
      }
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">My Library</h2>
      <ul className="space-y-4">
        {pdfs.length > 0 ? (
          pdfs.map((pdf) => (
            <li key={pdf.uuid} className="bg-gray-100 p-4 rounded-lg shadow-sm flex justify-between items-center">
              <Link to={`/annotate/${pdf.uuid}`} className="text-blue-600 hover:underline flex-grow">
                {pdf.filename}
              </Link>
              <div className="space-x-2 ml-4">
                <button
                  onClick={() => handleRename(pdf.uuid, pdf.filename)}
                  className="bg-yellow-500 text-white py-1 px-3 rounded text-sm hover:bg-yellow-600"
                >
                  Rename
                </button>
                <button
                  onClick={() => handleDelete(pdf.uuid)}
                  className="bg-red-500 text-white py-1 px-3 rounded text-sm hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))
        ) : (
          <p className="text-gray-500">You haven't uploaded any PDFs yet.</p>
        )}
      </ul>
    </div>
  );
};

export default PdfList;