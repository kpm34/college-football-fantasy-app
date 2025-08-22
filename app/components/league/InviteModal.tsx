'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Mail, Check, Link } from 'lucide-react';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  leagueId: string;
  leagueName: string;
}

export function InviteModal({ isOpen, onClose, leagueId, leagueName }: InviteModalProps) {
  const [inviteLinks, setInviteLinks] = useState<{
    direct: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchInviteLinks();
    }
  }, [isOpen, leagueId]);

  const fetchInviteLinks = async () => {
    try {
      const response = await fetch(`/api/leagues/invite?leagueId=${leagueId}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setInviteLinks(data.links);
      }
    } catch (error) {
      console.error('Failed to fetch invite links:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, linkType: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLink(linkType);
      setTimeout(() => setCopiedLink(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const sendEmailInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingEmail(true);
    setEmailSent(false);

    try {
      const response = await fetch('/api/leagues/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leagueId,
          email,
          sendEmail: true
        }),
      });

      if (response.ok) {
        setEmailSent(true);
        setEmail('');
        setTimeout(() => setEmailSent(false), 3000);
      }
    } catch (error) {
      console.error('Failed to send invite:', error);
    } finally {
      setSendingEmail(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#F5F0E6] rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#5E2B8A]">
            Invite Players to {leagueName}
          </h2>
          <button
            onClick={onClose}
            className="text-[#5E2B8A] hover:text-[#E73C7E] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5E2B8A]"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Direct Link */}
            {inviteLinks?.direct && (
              <div>
                <h3 className="text-lg font-semibold text-[#5E2B8A] mb-2">
                  Direct Invite Link
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inviteLinks.direct}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white rounded-lg text-sm text-gray-600"
                  />
                  <button
                    onClick={() => copyToClipboard(inviteLinks.direct, 'direct')}
                    className="flex items-center gap-2 px-3 py-2 bg-[#5E2B8A] text-white rounded-lg hover:bg-[#8A5EAA] transition-colors"
                  >
                    {copiedLink === 'direct' ? <Check size={16} /> : <Link size={16} />}
                    Copy Link
                  </button>
                </div>
              </div>
            )}

            {/* Email Invite */}
            <div>
              <h3 className="text-lg font-semibold text-[#5E2B8A] mb-2">
                Send Email Invite
              </h3>
              <form onSubmit={sendEmailInvite} className="flex items-center gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  required
                  className="flex-1 px-3 py-2 bg-white rounded-lg border border-[#5E2B8A]/20 focus:border-[#5E2B8A] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={sendingEmail || !email}
                  className="flex items-center gap-2 px-4 py-2 bg-[#E73C7E] text-white rounded-lg hover:bg-[#FF0080] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingEmail ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : emailSent ? (
                    <Check size={16} />
                  ) : (
                    <Mail size={16} />
                  )}
                  {emailSent ? 'Sent!' : 'Send'}
                </button>
              </form>
              {emailSent && (
                <p className="text-sm text-green-600 mt-2">
                  Invite sent successfully!
                </p>
              )}
            </div>

            {/* Instructions */}
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-semibold">How to invite players:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Send the direct link via text or social media</li>
                <li>Email invites directly from here</li>
              </ul>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
