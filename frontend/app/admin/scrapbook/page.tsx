'use client';

import React, { useState, useEffect } from 'react';

interface Invitation {
  id: number;
  slug: string;
  title: string;
  event_date: string;
  type: string;
  entryCount: number;
  isExpired: boolean;
}

export default function ScrapbookAdminPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/invitations/list');
      const data = await response.json();
      
      if (data.success) {
        setInvitations(data.data);
      } else {
        setError('Failed to load invitations');
      }
    } catch (err) {
      setError('Error loading invitations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async (slug: string) => {
    try {
      setGenerating(slug);
      setError(null);

      const response = await fetch('/api/scrapbook/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invitationSlug: slug }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate PDF');
      }

      // If HTML is returned, open in new window for printing
      if (data.html) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(data.html);
          printWindow.document.close();
          // Auto-trigger print dialog after a short delay
          setTimeout(() => {
            printWindow.print();
          }, 500);
        }
      } else {
        // If PDF blob is returned, download it
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `scrapbook-${slug}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate PDF');
      console.error(err);
    } finally {
      setGenerating(null);
    }
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
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8 border-b border-gray-200">
            <h1 className="text-3xl font-serif italic text-gray-900">Scrapbook Management</h1>
            <p className="mt-2 text-sm text-gray-600">
              Generate PDF scrapbooks for your events. Select an invitation below to create a beautiful PDF compilation.
            </p>
          </div>

          {error && (
            <div className="mx-6 mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {loading ? (
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
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invitations.map((invitation) => (
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
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => generatePDF(invitation.slug)}
                            disabled={generating === invitation.slug || invitation.entryCount === 0}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#1a1a1a] hover:bg-[#C5A059] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C5A059] disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {generating === invitation.slug ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating...
                              </>
                            ) : (
                              <>
                                <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Generate PDF
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-2">How to use:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Select an invitation with scrapbook entries</li>
                <li>Click "Generate PDF" to create the scrapbook</li>
                <li>A new window will open with the PDF - use your browser's print dialog to save as PDF</li>
                <li>Share the PDF with guests who provided their phone numbers</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

