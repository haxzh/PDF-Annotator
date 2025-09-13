import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import api from '../api/api';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PdfViewer = ({ pdfUuid }) => {
  const [numPages, setNumPages] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [highlights, setHighlights] = useState([]);
  const [selectedText, setSelectedText] = useState({ text: '', rects: [], pageNumber: null });

  useEffect(() => {
    const fetchPdfAndHighlights = async () => {
      try {
        const [pdfRes, highlightRes] = await Promise.all([
          api.get(`/pdf/${pdfUuid}`, { responseType: 'blob' }),
          api.get(`/highlights/${pdfUuid}`),
        ]);
        setPdfUrl(URL.createObjectURL(pdfRes.data));
        setHighlights(highlightRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    if (pdfUuid) {
      fetchPdfAndHighlights();
    }
  }, [pdfUuid]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleTextSelect = () => {
    const selection = window.getSelection();
    if (selection.toString().trim() === '') {
      setSelectedText({ text: '', rects: [], pageNumber: null });
      return;
    }
    const pageNumber = parseInt(selection.anchorNode.parentNode.parentNode.getAttribute('data-page-number'));
    const range = selection.getRangeAt(0);
    const rects = Array.from(range.getClientRects()).map(rect => ({
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    }));
    setSelectedText({
      text: selection.toString(),
      rects,
      pageNumber,
    });
  };

  const handleHighlight = async () => {
    if (!selectedText.text) return;
    try {
      const res = await api.post('/highlights', {
        pdfUuid,
        pageNumber: selectedText.pageNumber,
        text: selectedText.text,
        position: selectedText.rects,
      });
      setHighlights([...highlights, res.data]);
      setSelectedText({ text: '', rects: [], pageNumber: null });
      window.getSelection().removeAllRanges();
    } catch (err) {
      console.error('Error saving highlight:', err);
    }
  };

  return (
    <div className="relative">
      {selectedText.text && (
        <button
          onClick={handleHighlight}
          className="absolute z-50 bg-yellow-400 text-gray-800 p-2 rounded-md shadow-lg"
          style={{ top: selectedText.rects[0].top, left: selectedText.rects[0].left }}
        >
          Highlight
        </button>
      )}
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        className="border border-gray-300 rounded-md shadow-md overflow-hidden"
      >
        {Array.from(new Array(numPages), (el, index) => (
          <div key={`page-${index + 1}`} className="relative">
            <Page
              pageNumber={index + 1}
              onMouseDown={handleTextSelect}
            />
            {highlights.filter(h => h.pageNumber === index + 1).map((highlight) => (
              <div
                key={highlight._id}
                style={{
                  position: 'absolute',
                  backgroundColor: 'rgba(255, 255, 0, 0.5)',
                  pointerEvents: 'none',
                  ...highlight.position[0], // Simplified for now, can be improved to handle multi-line highlights
                }}
              />
            ))}
          </div>
        ))}
      </Document>
    </div>
  );
};

export default PdfViewer;