
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Plus, 
  ExternalLink, 
  Shield, 
  ShieldCheck, 
  AlertCircle,
  Copy,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { SocialAccount } from '@/entities/SocialAccount';

const platformConfig = {
  facebook: { 
    name: 'Facebook', 
    color: 'bg-blue-600', 
    icon: '📘',
    urlPattern: /^https?:\/\/(www\.)?facebook\.com\/[\w.]+\/?$/
  },
  instagram: { 
    name: 'Instagram', 
    color: 'bg-gradient-to-r from-purple-500 to-pink-500', 
    icon: '📸',
    urlPattern: /^https?:\/\/(www\.)?instagram\.com\/[\w.]+\/?$/
  },
  tiktok: { 
    name: 'TikTok', 
    color: 'bg-black', 
    icon: '🎵',
    urlPattern: /^https?:\/\/(www\.)?tiktok\.com\/@[\w.]+\/?$/
  },
  github: { 
    name: 'GitHub', 
    color: 'bg-gray-800', 
    icon: '👨‍💻',
    urlPattern: /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/?$/
  },
  linkedin: { 
    name: 'LinkedIn', 
    color: 'bg-blue-700', 
    icon: '💼',
    urlPattern: /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/
  },
  twitter: { 
    name: 'Twitter/X', 
    color: 'bg-black', 
    icon: '🐦',
    urlPattern: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[\w]+\/?$/
  },
  youtube: { 
    name: 'YouTube', 
    color: 'bg-red-600', 
    icon: '📹',
    urlPattern: /^https?:\/\/(www\.)?youtube\.com\/(c\/|channel\/|user\/|@)[\w-]+\/?$/
  },
  discord: { 
    name: 'Discord', 
    color: 'bg-indigo-600', 
    icon: '🎮',
    urlPattern: /^[\w.#]+#\d{4}$/
  }
};

function AddSocialAccountDialog({ user, onClose, onAdded }) {
  const [platform, setPlatform] = useState('');
  const [profileUrl, setProfileUrl] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');

  const extractUsernameFromUrl = (url, platformKey) => {
    const config = platformConfig[platformKey];
    if (!config?.urlPattern) return '';

    try {
      if (platformKey === 'discord') {
        return url; // Discord uses username#1234 format
      }
      
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      
      switch (platformKey) {
        case 'github':
        case 'facebook':
        case 'linkedin':
          return path.split('/').filter(Boolean)[0] || '';
        case 'instagram':
          return path.replace('/','').replace('@','');
        case 'tiktok':
          return path.replace('/@','');
        case 'twitter':
          return path.replace('/','').replace('@','');
        case 'youtube':
          return path.split('/').pop() || '';
        default:
          return '';
      }
    } catch {
      return '';
    }
  };

  const handleUrlChange = (url) => {
    setProfileUrl(url);
    setError('');
    
    if (platform && url) {
      const config = platformConfig[platform];
      if (config?.urlPattern && !config.urlPattern.test(url)) {
        setError(`Invalid ${config.name} URL format`);
      } else {
        const extractedUsername = extractUsernameFromUrl(url, platform);
        if (extractedUsername) {
          setUsername(extractedUsername);
        }
      }
    }
  };

  const generateVerificationToken = () => {
    return 'hv_' + Math.random().toString(36).substring(2, 15);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!platform || !profileUrl || !username) return;
    
    setIsAdding(true);
    try {
      const verificationToken = generateVerificationToken();
      
      await SocialAccount.create({
        user_id: user.id,
        platform,
        username,
        display_name: displayName || username,
        profile_url: profileUrl,
        verification_token: verificationToken,
        verification_status: 'pending',
        verification_method: platform === 'discord' ? 'manual' : 'bio_token'
      });
      
      onAdded();
      onClose();
    } catch (error) {
      console.error('Error adding social account:', error);
      setError('Failed to add social account');
    }
    setIsAdding(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-[rgb(var(--grey-1))] border-[rgb(var(--grey-2))] text-white">
        <DialogHeader>
          <DialogTitle>Add Social Account</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-purple-200">Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="mt-2 bg-[rgb(var(--dark-base))] border-[rgb(var(--grey-2))] text-white">
                <SelectValue placeholder="Choose platform" />
              </SelectTrigger>
              <SelectContent className="bg-[rgb(var(--dark-base))] border-[rgb(var(--grey-2))] text-white">
                {Object.entries(platformConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <span className="mr-2">{config.icon}</span>
                    {config.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-purple-200">
              {platform === 'discord' ? 'Discord Username#1234' : 'Profile URL'}
            </Label>
            <Input
              value={profileUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder={
                platform === 'discord' 
                  ? 'YourUsername#1234' 
                  : platformConfig[platform]?.name 
                    ? `Your ${platformConfig[platform].name} profile URL`
                    : 'https://...'
              }
              className="mt-2 bg-[rgb(var(--dark-base))] border-[rgb(var(--grey-2))] text-white"
            />
            {error && (
              <p className="text-red-400 text-sm mt-1">{error}</p>
            )}
          </div>

          {username && (
            <div>
              <Label className="text-purple-200">Username (extracted)</Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-2 bg-[rgb(var(--dark-base))] border-[rgb(var(--grey-2))] text-white"
              />
            </div>
          )}

          <div>
            <Label className="text-purple-200">Display Name (optional)</Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How should this appear on your profile?"
              className="mt-2 bg-[rgb(var(--dark-base))] border-[rgb(var(--grey-2))] text-white"
            />
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            disabled={isAdding || !platform || !profileUrl || !username || !!error}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isAdding ? 'Adding...' : 'Add Account'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function VerificationInstructions({ account, onClose, onRefresh }) {
  const config = platformConfig[account.platform];
  const [isCopying, setIsCopying] = useState(false);

  const copyToken = async () => {
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(account.verification_token);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
    setTimeout(() => setIsCopying(false), 1000);
  };

  const getInstructionText = () => {
    switch (account.platform) {
      case 'discord':
        return 'Send this token to our verification bot or include it in your Discord status.';
      case 'github':
        return 'Add this token to your GitHub bio or create a gist with this token.';
      default:
        return `Add this token to your ${config.name} bio temporarily, then click "Check Verification".`;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-[rgb(var(--grey-1))] border-[rgb(var(--grey-2))] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">{config.icon}</span>
            Verify {config.name} Account
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-purple-200/80 text-sm">
            {getInstructionText()}
          </p>

          <div className="bg-[rgb(var(--dark-base))] p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <code className="text-purple-300 font-mono text-sm">
                {account.verification_token}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={copyToken}
                className="ml-2"
              >
                {isCopying ? '✓' : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
            <p className="text-amber-300 text-xs">
              ⚠️ Only add the token temporarily. Remove it after verification is complete.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
          <Button
            onClick={onRefresh}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Check Verification
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function SocialAccountManager({ user, onAccountsChange }) {
  const [accounts, setAccounts] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAccounts = useCallback(async () => {
    try {
      const userAccounts = await SocialAccount.filter({ user_id: user.id }, '-created_date');
      setAccounts(userAccounts);
    } catch (error) {
      console.error('Error loading social accounts:', error);
      setAccounts([]);
    }
    setIsLoading(false);
  }, [user.id]); // user.id is stable or changes when user object changes, thus safe for useCallback dependency

  useEffect(() => {
    if (user?.id) {
      loadAccounts();
    }
  }, [user?.id, loadAccounts]); // Added loadAccounts as a dependency

  const handleAccountAdded = () => {
    loadAccounts();
    if (onAccountsChange) onAccountsChange();
  };

  const handleDeleteAccount = async (accountId) => {
    if (!confirm('Are you sure you want to remove this social account?')) return;
    
    try {
      await SocialAccount.delete(accountId);
      loadAccounts();
      if (onAccountsChange) onAccountsChange();
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const handleCheckVerification = async (account) => {
    try {
      // In a real implementation, this would call an API to check the verification
      // For now, we'll simulate verification success
      await SocialAccount.update(account.id, {
        verification_status: 'verified'
      });
      
      loadAccounts();
      setShowVerifyDialog(null);
    } catch (error) {
      console.error('Error checking verification:', error);
    }
  };

  const getStatusBadge = (account) => {
    const config = platformConfig[account.platform];
    
    switch (account.verification_status) {
      case 'verified':
        return <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
          <ShieldCheck className="w-3 h-3 mr-1" />
          Verified
        </Badge>;
      case 'pending':
        return <Badge className="bg-amber-600/20 text-amber-300 border-amber-500/30">
          <AlertCircle className="w-3 h-3 mr-1" />
          Pending
        </Badge>;
      case 'failed':
        return <Badge className="bg-red-600/20 text-red-300 border-red-500/30">
          Failed
        </Badge>;
      default:
        return <Badge className="bg-gray-600/20 text-gray-300">
          <Shield className="w-3 h-3 mr-1" />
          Unverified
        </Badge>;
    }
  };

  if (isLoading) {
    return <div className="text-center p-8 text-purple-300">Loading social accounts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Connected Accounts</h3>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Account
        </Button>
      </div>

      {accounts.length === 0 ? (
        <Card className="bg-[rgb(var(--grey-2))] border-[rgb(var(--grey-3))]/20">
          <CardContent className="text-center py-12">
            <div className="text-4xl mb-4">🔗</div>
            <h3 className="text-lg font-semibold text-white mb-2">No Connected Accounts</h3>
            <p className="text-purple-300/70 mb-6">
              Link your social media accounts to build trust and showcase your online presence.
            </p>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Connect Your First Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {accounts.map((account) => {
            const config = platformConfig[account.platform];
            return (
              <Card key={account.id} className="bg-[rgb(var(--grey-2))] border-[rgb(var(--grey-3))]/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${config.color} flex items-center justify-center text-white font-semibold`}>
                        {config.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-white">
                            {account.display_name || account.username}
                          </h4>
                          {getStatusBadge(account)}
                        </div>
                        <p className="text-sm text-purple-300/70">
                          @{account.username} on {config.name}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(account.profile_url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      
                      {account.verification_status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => setShowVerifyDialog(account)}
                          className="bg-amber-600 hover:bg-amber-700"
                        >
                          Verify
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteAccount(account.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-600/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialogs */}
      {showAddDialog && (
        <AddSocialAccountDialog
          user={user}
          onClose={() => setShowAddDialog(false)}
          onAdded={handleAccountAdded}
        />
      )}

      {showVerifyDialog && (
        <VerificationInstructions
          account={showVerifyDialog}
          onClose={() => setShowVerifyDialog(null)}
          onRefresh={() => handleCheckVerification(showVerifyDialog)}
        />
      )}
    </div>
  );
}
