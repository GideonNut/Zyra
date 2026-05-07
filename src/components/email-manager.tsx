"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mail, Send, Save } from "lucide-react";

interface EmailManagerProps {
  contacts: Array<{
    id: string;
    email: string;
    phone: string;
    createdAt: string;
    status: string;
  }>;
  onContactsLoaded?: () => void;
}

export function EmailManager({ contacts }: EmailManagerProps) {
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [templates, setTemplates] = useState<Array<{ name: string; subject: string; body: string }>>([]);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [sendStatus, setSendStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const toggleContact = (contactId: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const selectAll = () => {
    if (selectedContacts.size === contacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(contacts.map(c => c.id)));
    }
  };

  async function handleSendEmail() {
    if (!emailSubject.trim() || !emailBody.trim() || selectedContacts.size === 0) {
      setSendStatus({ type: "error", message: "Please fill in subject, body, and select at least one contact" });
      return;
    }

    setIsSending(true);
    setSendStatus(null);

    try {
      const response = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientIds: Array.from(selectedContacts),
          subject: emailSubject,
          body: emailBody,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSendStatus({ type: "success", message: `Email sent to ${data.sentCount} contact(s)` });
        setEmailSubject("");
        setEmailBody("");
        setSelectedContacts(new Set());
      } else {
        setSendStatus({ type: "error", message: data.error || "Failed to send email" });
      }
    } catch (error) {
      setSendStatus({ type: "error", message: "Failed to send email" });
    } finally {
      setIsSending(false);
    }
  }

  function saveTemplate() {
    if (!templateName.trim() || !emailSubject.trim() || !emailBody.trim()) {
      setSendStatus({ type: "error", message: "Please fill in template name, subject, and body" });
      return;
    }

    const newTemplate = { name: templateName, subject: emailSubject, body: emailBody };
    setTemplates([...templates, newTemplate]);
    localStorage.setItem("emailTemplates", JSON.stringify([...templates, newTemplate]));
    setSendStatus({ type: "success", message: "Template saved successfully" });
    setTemplateName("");
  }

  function loadTemplate(template: { name: string; subject: string; body: string }) {
    setEmailSubject(template.subject);
    setEmailBody(template.body);
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Email Composition */}
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Compose Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Subject</label>
                <Input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Email subject"
                  disabled={isSending}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Email Body</label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Email content (supports basic HTML)"
                  disabled={isSending}
                  className="w-full min-h-64 px-3 py-2 rounded-lg border border-border/50 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
              </div>

              {sendStatus && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    sendStatus.type === "success"
                      ? "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200"
                      : "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200"
                  }`}
                >
                  {sendStatus.message}
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleSendEmail} disabled={isSending} className="flex-1">
                  {isSending ? <Spinner className="h-4 w-4 mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                  Send Email
                </Button>
                <Button variant="outline" onClick={() => setShowTemplateDialog(!showTemplateDialog)}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Template
                </Button>
              </div>

              {showTemplateDialog && (
                <div className="border-t pt-4 space-y-2">
                  <Input
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Template name"
                  />
                  <Button onClick={saveTemplate} size="sm" variant="outline" className="w-full">
                    Save as Template
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Templates */}
          {templates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Saved Templates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {templates.map((template, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => loadTemplate(template)}
                  >
                    {template.name}
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Contact Selection */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>Recipients ({selectedContacts.size})</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectAll}
                  className="text-xs"
                >
                  {selectedContacts.size === contacts.length ? "Deselect All" : "Select All"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 border border-border/50 rounded-lg p-4">
                <div className="space-y-2">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={contact.id}
                        checked={selectedContacts.has(contact.id)}
                        onCheckedChange={() => toggleContact(contact.id)}
                      />
                      <label
                        htmlFor={contact.id}
                        className="text-sm cursor-pointer flex-1 min-w-0"
                      >
                        <div className="truncate">{contact.email}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {contact.phone}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
