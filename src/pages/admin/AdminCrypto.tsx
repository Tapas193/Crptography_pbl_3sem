import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Key, Lock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  generateSecureCouponCode, 
  verifyTransactionHash,
  decryptCouponCode,
  importKey
} from '@/lib/crypto';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface AuditLog {
  id: string;
  action: string;
  user_id: string | null;
  created_at: string;
  risk_level: string | null;
  details: any;
  ip_address: unknown;
}

interface Transaction {
  id: string;
  user_id: string;
  points_amount: number;
  transaction_type: string;
  nonce: string;
  transaction_hash: string | null;
  created_at: string;
  status: string;
}

export default function AdminCrypto() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [verifyUserId, setVerifyUserId] = useState('');
  const [verifyAmount, setVerifyAmount] = useState('');
  const [verifyNonce, setVerifyNonce] = useState('');
  const [verifyTimestamp, setVerifyTimestamp] = useState('');
  const [verifyHash, setVerifyHash] = useState('');
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);
  const [encryptedData, setEncryptedData] = useState('');
  const [encryptionIv, setEncryptionIv] = useState('');
  const [encryptionKey, setEncryptionKey] = useState('');
  const [decryptedCode, setDecryptedCode] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchAuditLogs();
    fetchTransactions();
  }, []);

  const fetchAuditLogs = async () => {
    const { data, error } = await supabase
      .from('security_audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching audit logs:', error);
    } else {
      setAuditLogs(data || []);
    }
  };

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching transactions:', error);
    } else {
      setTransactions(data || []);
    }
  };

  const handleGenerateSecureCoupon = () => {
    const code = generateSecureCouponCode(12);
    toast({
      title: "Secure Coupon Generated",
      description: (
        <div className="font-mono mt-2">
          <p className="font-bold text-lg">{code}</p>
          <p className="text-xs mt-2">Cryptographically secure random code</p>
        </div>
      ),
    });
  };

  const handleVerifyHash = async () => {
    try {
      const result = await verifyTransactionHash(
        verifyUserId,
        parseInt(verifyAmount),
        verifyNonce,
        parseInt(verifyTimestamp),
        verifyHash
      );
      setVerificationResult(result);
      toast({
        title: result ? "Hash Valid ✓" : "Hash Invalid ✗",
        description: result 
          ? "Transaction hash is cryptographically valid"
          : "Transaction hash verification failed - possible tampering",
        variant: result ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Verification Error",
        description: error instanceof Error ? error.message : "Failed to verify hash",
      });
    }
  };

  const handleDecryptCoupon = async () => {
    try {
      const key = await importKey(encryptionKey);
      const decrypted = await decryptCouponCode(encryptedData, encryptionIv, key);
      setDecryptedCode(decrypted);
      toast({
        title: "Decryption Successful",
        description: "Coupon code decrypted successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Decryption Failed",
        description: error instanceof Error ? error.message : "Failed to decrypt coupon",
      });
    }
  };

  const getRiskLevelColor = (level: string | null): "default" | "destructive" | "outline" | "secondary" => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Cryptographic Security</h2>
        <p className="text-muted-foreground">Manage encryption, verify transactions, and monitor security</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="verification">Hash Verification</TabsTrigger>
          <TabsTrigger value="encryption">Encryption Tools</TabsTrigger>
          <TabsTrigger value="audit">Security Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AES-256-GCM</CardTitle>
                <Lock className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Encryption</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Authenticated encryption for coupon codes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">SHA-256</CardTitle>
                <Shield className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Hashing</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Transaction integrity verification
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">256-bit</CardTitle>
                <Key className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Nonces</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Cryptographically secure random values
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Last 20 transactions with hash verification</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Nonce (Truncated)</TableHead>
                    <TableHead>Hash Status</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium">{tx.transaction_type}</TableCell>
                      <TableCell>{tx.points_amount}</TableCell>
                      <TableCell className="font-mono text-xs">{tx.nonce.substring(0, 12)}...</TableCell>
                      <TableCell>
                        {tx.transaction_hash ? (
                          <Badge variant="outline" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="secondary">No Hash</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'}>
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(tx.created_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Hash Verification</CardTitle>
              <CardDescription>
                Verify the cryptographic integrity of transaction hashes using SHA-256
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="userId">User ID</Label>
                  <Input 
                    id="userId" 
                    placeholder="UUID" 
                    value={verifyUserId}
                    onChange={(e) => setVerifyUserId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    placeholder="100"
                    value={verifyAmount}
                    onChange={(e) => setVerifyAmount(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nonce">Nonce</Label>
                <Input 
                  id="nonce" 
                  placeholder="64-character hex string"
                  value={verifyNonce}
                  onChange={(e) => setVerifyNonce(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timestamp">Timestamp</Label>
                <Input 
                  id="timestamp" 
                  placeholder="Unix timestamp (milliseconds)"
                  value={verifyTimestamp}
                  onChange={(e) => setVerifyTimestamp(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hash">Transaction Hash</Label>
                <Input 
                  id="hash" 
                  placeholder="64-character SHA-256 hash"
                  value={verifyHash}
                  onChange={(e) => setVerifyHash(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>

              <Button onClick={handleVerifyHash} className="w-full">
                <Shield className="mr-2 h-4 w-4" />
                Verify Hash
              </Button>

              {verificationResult !== null && (
                <div className={`flex items-center gap-2 p-4 rounded-lg ${
                  verificationResult ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
                }`}>
                  {verificationResult ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-semibold text-green-500">Hash Valid</p>
                        <p className="text-sm text-muted-foreground">Transaction integrity verified</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="font-semibold text-red-500">Hash Invalid</p>
                        <p className="text-sm text-muted-foreground">Possible tampering detected</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="encryption" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Secure Coupon Generation</CardTitle>
              <CardDescription>
                Generate cryptographically secure coupon codes using Web Crypto API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleGenerateSecureCoupon} className="w-full">
                <Key className="mr-2 h-4 w-4" />
                Generate Secure Coupon Code
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Coupon Decryption Tool</CardTitle>
              <CardDescription>
                Decrypt AES-256-GCM encrypted coupon codes (for testing only)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="encryptedData">Encrypted Data</Label>
                <Input 
                  id="encryptedData" 
                  placeholder="Hex-encoded encrypted data"
                  value={encryptedData}
                  onChange={(e) => setEncryptedData(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="iv">Initialization Vector (IV)</Label>
                <Input 
                  id="iv" 
                  placeholder="12-byte hex IV"
                  value={encryptionIv}
                  onChange={(e) => setEncryptionIv(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="key">Encryption Key</Label>
                <Input 
                  id="key" 
                  type="password"
                  placeholder="256-bit hex key"
                  value={encryptionKey}
                  onChange={(e) => setEncryptionKey(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>

              <Button onClick={handleDecryptCoupon} className="w-full">
                <Lock className="mr-2 h-4 w-4" />
                Decrypt Coupon
              </Button>

              {decryptedCode && (
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Decrypted Code:</p>
                  <p className="font-mono text-lg font-bold">{decryptedCode}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Audit Log</CardTitle>
              <CardDescription>
                Real-time security events and risk monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.action}</TableCell>
                      <TableCell>
                        <Badge variant={getRiskLevelColor(log.risk_level)}>
                          {log.risk_level === 'high' && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {log.risk_level || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{String(log.ip_address || 'N/A')}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.user_id ? log.user_id.substring(0, 8) + '...' : 'System'}
                      </TableCell>
                      <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
