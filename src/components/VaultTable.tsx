import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Plus,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldQuestion,
  Vault,
  ExternalLink,
  Copy,
} from "lucide-react";
import AddCredentialModal from "./AddCredentialModal";
import {
  getCredentials,
  createCredential,
  updateCredential,
  deleteCredential,
  revealPassword,
  scanBreaches,
} from "@/lib/api";
import {
  Credential,
  getMockCredentials,
  addMockCredential,
  updateMockCredential,
  deleteMockCredential,
  mockScanBreaches,
} from "@/lib/mockData";

interface VaultTableProps {
  onBreachCountChange?: (count: number) => void;
}

const VaultTable = ({ onBreachCountChange }: VaultTableProps) => {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<number, string>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const { toast } = useToast();

  const fetchCredentials = useCallback(async () => {
    try {
      const res = await getCredentials();
      setCredentials(res.data);
      setIsDemo(false);
    } catch {
      // Fallback to mock data
      setCredentials(getMockCredentials());
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCredentials();
    const handleFocus = () => fetchCredentials();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchCredentials]);

  useEffect(() => {
    const compromisedCount = credentials.filter(
      (c) => c.breach_status === "compromised"
    ).length;
    onBreachCountChange?.(compromisedCount);
  }, [credentials, onBreachCountChange]);

  const handleReveal = async (id: number) => {
    if (revealedPasswords[id]) {
      setRevealedPasswords((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      return;
    }

    try {
      if (isDemo) {
        setRevealedPasswords((prev) => ({ ...prev, [id]: "DemoP@ssw0rd!" }));
      } else {
        const res = await revealPassword(id);
        setRevealedPasswords((prev) => ({ ...prev, [id]: res.data.password }));
      }
      // Auto-hide after 10 seconds
      setTimeout(() => {
        setRevealedPasswords((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }, 10000);
    } catch {
      toast({ title: "Failed to reveal password", variant: "destructive" });
    }
  };

  const handleCopyPassword = async (id: number) => {
    const pwd = revealedPasswords[id];
    if (!pwd) {
      toast({ title: "Reveal the password first", variant: "destructive" });
      return;
    }
    try {
      await navigator.clipboard.writeText(pwd);
      toast({ title: "Password copied to clipboard" });
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const handleScan = async () => {
    setScanning(true);
    try {
      if (isDemo) {
        const updated = mockScanBreaches();
        setCredentials(updated);
        toast({ title: "Breach scan complete (demo)" });
      } else {
        await scanBreaches();
        await fetchCredentials();
        toast({ title: "Breach scan complete" });
      }
    } catch {
      toast({ title: "Scan failed", variant: "destructive" });
    } finally {
      setScanning(false);
    }
  };

  const handleSubmit = async (data: {
    id?: number;
    site_name: string;
    site_url: string;
    username: string;
    password: string;
  }) => {
    try {
      if (data.id) {
        if (isDemo) {
          updateMockCredential(data.id, data);
        } else {
          await updateCredential(data.id, data);
        }
        toast({ title: "Credential updated" });
      } else {
        if (isDemo) {
          addMockCredential(data);
        } else {
          await createCredential(data);
        }
        toast({ title: "Credential saved to vault" });
      }
      await fetchCredentials();
      setEditingCredential(null);
    } catch {
      toast({ title: "Failed to save credential", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (isDemo) {
        deleteMockCredential(deleteTarget);
      } else {
        await deleteCredential(deleteTarget);
      }
      toast({ title: "Credential deleted" });
      await fetchCredentials();
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    } finally {
      setDeleteTarget(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "safe":
        return (
          <Badge className="bg-success/20 text-success border-success/30 gap-1">
            <Shield className="w-3 h-3" /> Safe
          </Badge>
        );
      case "compromised":
        return (
          <Badge variant="destructive" className="gap-1 animate-pulse">
            <ShieldAlert className="w-3 h-3" /> Breached
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <ShieldQuestion className="w-3 h-3" /> Unknown
          </Badge>
        );
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-5xl">
      {/* Header */}
      <div className="text-center mb-8 slide-up">
        <div className="flex justify-center mb-4">
          <Vault className="w-12 h-12 text-primary animate-float" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-glow mb-4">Credential Vault</h1>
        <div className="bg-card border border-terminal-border rounded-lg p-6 mb-6 terminal-glow">
          <h2 className="text-lg font-semibold text-accent mb-3">
            Your Encrypted Digital Armory
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Every credential is encrypted with AES-256-GCM before it touches the database. 
            Only your master password can unlock them. The breach monitor scans your email 
            addresses against known data leaks every 6 hours — so you know the moment your 
            defenses are compromised.
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Button
          onClick={() => {
            setEditingCredential(null);
            setModalOpen(true);
          }}
          className="terminal-glow transition-all duration-300 hover:scale-105 flex-1 sm:flex-none"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Credential
        </Button>
        <Button
          onClick={handleScan}
          variant="outline"
          disabled={scanning}
          className="terminal-glow transition-all duration-300 hover:scale-105 flex-1 sm:flex-none"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${scanning ? "animate-spin" : ""}`} />
          {scanning ? "Scanning..." : "Scan for Breaches"}
        </Button>
        {isDemo && (
          <Badge variant="outline" className="self-center text-warning border-warning/30">
            Demo Mode
          </Badge>
        )}
      </div>

      {/* Credentials Table / Cards */}
      {loading ? (
        <Card className="terminal-glow">
          <CardContent className="p-8 text-center">
            <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading vault...</p>
          </CardContent>
        </Card>
      ) : credentials.length === 0 ? (
        <Card className="terminal-glow game-notification">
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Vault is Empty</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Add your first credential to start securing your digital life.
            </p>
            <Button
              onClick={() => {
                setEditingCredential(null);
                setModalOpen(true);
              }}
              className="terminal-glow"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add First Credential
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <Card className="terminal-glow hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="border-terminal-border">
                  <TableHead>Site</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {credentials.map((cred) => (
                  <TableRow key={cred.id} className="border-terminal-border">
                    <TableCell>
                      <div>
                        <div className="font-medium">{cred.site_name}</div>
                        {cred.site_url && (
                          <a
                            href={cred.site_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-accent hover:underline flex items-center gap-1"
                          >
                            {cred.site_url} <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{cred.username}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {revealedPasswords[cred.id] || "••••••••••"}
                    </TableCell>
                    <TableCell>{getStatusBadge(cred.breach_status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleReveal(cred.id)}
                          title={revealedPasswords[cred.id] ? "Hide" : "Reveal"}
                        >
                          {revealedPasswords[cred.id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        {revealedPasswords[cred.id] && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopyPassword(cred.id)}
                            title="Copy password"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingCredential({
                              id: cred.id,
                              site_name: cred.site_name,
                              site_url: cred.site_url,
                              username: cred.username,
                              password: revealedPasswords[cred.id] || "",
                            });
                            setModalOpen(true);
                          }}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(cred.id)}
                          title="Delete"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {credentials.map((cred) => (
              <Card key={cred.id} className="terminal-glow game-notification">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">{cred.site_name}</h3>
                      {cred.site_url && (
                        <a
                          href={cred.site_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-accent hover:underline flex items-center gap-1"
                        >
                          {cred.site_url} <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    {getStatusBadge(cred.breach_status)}
                  </div>
                  <div className="text-sm space-y-1 mb-3">
                    <div>
                      <span className="text-muted-foreground">User: </span>
                      <span className="font-mono">{cred.username}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Pass: </span>
                      <span className="font-mono">
                        {revealedPasswords[cred.id] || "••••••••••"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleReveal(cred.id)}>
                      {revealedPasswords[cred.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    {revealedPasswords[cred.id] && (
                      <Button variant="ghost" size="sm" onClick={() => handleCopyPassword(cred.id)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingCredential({
                          id: cred.id,
                          site_name: cred.site_name,
                          site_url: cred.site_url,
                          username: cred.username,
                          password: revealedPasswords[cred.id] || "",
                        });
                        setModalOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(cred.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      <AddCredentialModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={handleSubmit}
        editData={editingCredential}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="bg-card border-terminal-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Credential</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The credential will be permanently removed from your vault.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VaultTable;
