'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ScrapbookTemplate } from '../../components/ScrapbookTemplate';
import { generateScrapbook } from '../../lib/scrapbook-service';
import { generateScrapbookPDF, generateScrapbookPDFBlob } from '../../lib/pdf-generator';

interface Invitation {
  id: number;
  slug: string;
  title: string;
  event_date: string;
  type: string;
  entryCount: number;
  isExpired: boolean;
  scrapbookPdfUrl?: string | null;
}

interface OrganizedData {
  invitation: any;
  categorized_entries: any;
  highlights: any;
  pagination: {
    entriesPerPage: number;
    totalPages: number;
  };
}

export default function ScrapbookPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [scrapbook, setScrapbook] = useState<OrganizedData | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generatingSlug, setGeneratingSlug] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);

  const previewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoadingList(true);
      const response = await fetch('/api/invitations/list');
      const data = await response.json();

      if (data.success) {
        setInvitations(data.data);
        // Update selected invitation if it exists
        if (selectedInvitation) {
          const updated = data.data.find((inv: Invitation) => inv.id === selectedInvitation.id);
          if (updated) {
            setSelectedInvitation(updated);
          }
        }
      } else {
        setError('Failed to load invitations');
      }
    } catch (err) {
      setError('Error loading invitations');
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  const handleGenerate = async (invitation: Invitation) => {
    try {
      setGenerateError(null);
      setGeneratingSlug(invitation.slug);
      setSelectedSlug(invitation.slug);
      setSelectedInvitation(invitation);
      const data = await generateScrapbook(invitation.slug);
      setScrapbook(data);
      
      // Refresh invitations to get updated PDF URL
      await fetchInvitations();
    } catch (err: any) {
      console.error(err);
      setGenerateError(err?.message || 'Failed to generate scrapbook');
      setScrapbook(null);
    } finally {
      setGeneratingSlug(null);
    }
  };

  const handleDownload = async () => {
    if (!previewRef.current) return;
    try {
      setDownloading(true);
      await generateScrapbookPDF(previewRef.current, 'scrapbook.pdf');
    } catch (err) {
      console.error('PDF generation failed:', err);
      setGenerateError('PDF generation failed');
    } finally {
      setDownloading(false);
    }
  };

  const handleGenerateAndSave = async () => {
    if (!previewRef.current || !selectedInvitation) return;
    try {
      setSaving(true);
      setGenerateError(null);
      
      // Generate PDF blob
      const pdfBlob = await generateScrapbookPDFBlob(previewRef.current);
      
      // Upload to Cloudinary via API
      const formData = new FormData();
      formData.append('pdf', pdfBlob, `${selectedInvitation.slug}-scrapbook.pdf`);
      formData.append('invitationSlug', selectedInvitation.slug);
      
      const response = await fetch('/api/scrapbook/generate-pdf', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save PDF');
      }
      
      const result = await response.json();
      
      // Refresh invitations to get updated PDF URL
      await fetchInvitations();
      
      // Update selected invitation with new PDF URL
      const updatedInvitation = invitations.find(inv => inv.id === selectedInvitation.id);
      if (updatedInvitation) {
        setSelectedInvitation(updatedInvitation);
      }
      
      // Show success message
      setGenerateError(null);
    } catch (err: any) {
      console.error('PDF save failed:', err);
      setGenerateError(err?.message || 'Failed to save PDF to Cloudinary');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadCached = (pdfUrl: string) => {
    // Open PDF in new tab for download
    window.open(pdfUrl, '_blank');
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8 border-b border-gray-200">
            <h1 className="text-3xl font-serif italic text-gray-900">Scrapbook Generator</h1>
            <p className="mt-2 text-sm text-gray-600">
              Generate, preview, and download elegant scrapbooks for each invitation. Processing and
              organization happen in the frontend using the new `/api/scrapbook/generate` route.
            </p>
          </div>

          {error && (
            <div className="mx-6 mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {loadingList ? (
            <div className="px-6 py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-4 text-gray-600">Loading invitations...</p>
            </div>
          ) : invitations.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-600">No invitations found. Create invitations in Strapi first.</p>
            </div>
          ) : (
            <div className="px-6 py-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Entries
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3" />
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invitations.map((invitation) => {
                      const isSelected = selectedSlug === invitation.slug;
                      const isLoading = generatingSlug === invitation.slug;
                      return (
                        <tr key={invitation.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{invitation.title}</div>
                            <div className="text-sm text-gray-500">/{invitation.slug}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(invitation.event_date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {invitation.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {invitation.entryCount} {invitation.entryCount === 1 ? 'entry' : 'entries'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {invitation.isExpired ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Event Passed
                              </span>
                            ) : (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Upcoming
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => handleGenerate(invitation)}
                              disabled={isLoading}
                              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-60"
                            >
                              {isLoading ? 'Generating...' : isSelected ? 'Regenerate' : 'Generate'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {generateError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {generateError}
          </div>
        )}

        {scrapbook && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-serif text-gray-900">Scrapbook Preview</h2>
                <p className="text-sm text-gray-600">Review the generated scrapbook before downloading.</p>
              </div>
              <div className="flex gap-3">
                {selectedInvitation?.scrapbookPdfUrl && (
                  <button
                    onClick={() => handleDownloadCached(selectedInvitation.scrapbookPdfUrl!)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Download Latest PDF
                  </button>
                )}
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-60"
                >
                  {downloading ? 'Preparing PDF...' : 'Download PDF'}
                </button>
                <button
                  onClick={handleGenerateAndSave}
                  disabled={saving || downloading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? 'Saving to Cloudinary...' : 'Generate & Save PDF'}
                </button>
              </div>
            </div>

            <div ref={previewRef} className="space-y-8">
              <ScrapbookTemplate
                invitation={scrapbook.invitation}
                categorizedEntries={scrapbook.categorized_entries}
                highlights={scrapbook.highlights}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

