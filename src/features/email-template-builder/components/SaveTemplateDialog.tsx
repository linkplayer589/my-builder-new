// src/components/SaveTemplateDialog.tsx
import React, { useState } from 'react';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
// import { Button } from './ui/button';
// import { Input } from './ui/input';
// import { Textarea } from './ui/textarea';
// import { InputLabel } from './ui/InputLabel';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { payloadApi } from '../lib/payload-api';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Input,
  MenuItem,
  Select,
  TextareaAutosize,
  InputLabel,
} from '@mui/material';

interface SaveTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateData: any;
  onSaveSuccess?: (template: any) => void;
}

export function SaveTemplateDialog({ open, onOpenChange, templateData, onSaveSuccess }: SaveTemplateDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('custom');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Template name is required');
      return;
    }

    setLoading(true);
    try {
      payloadApi
        .getTemplates()
        .then((templates) => {
          console.log('Templates:', templates);
        })
        .catch((error) => {
          console.error('Connection failed:', error);
        });
      const savedTemplate = await payloadApi.createTemplate({
        name: name.trim(),
        description: description.trim() || undefined,
        content: templateData,
        category: category,
        isActive: true,
      });

      // Reset form
      setName('');
      setDescription('');
      setCategory('custom');

      onOpenChange(false);
      onSaveSuccess?.(savedTemplate);
      alert('Template saved successfully to Payload CMS!');
    } catch (error) {
      console.error('Failed to save template:', error);
      alert('Failed to save template. Please check if Payload CMS is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => onOpenChange(false)}>
      <DialogContent>
        <DialogTitle>Save to Payload CMS</DialogTitle>

        <div className="space-y-4">
          <div>
            <InputLabel htmlFor="name">Template Name *</InputLabel>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter template name" />
          </div>

          <div>
            <InputLabel htmlFor="description">Description</InputLabel>
            <TextareaAutosize
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter template description"
            />
          </div>

          <div>
            <InputLabel htmlFor="category">Category</InputLabel>
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              <MenuItem value="welcome">Welcome</MenuItem>
              <MenuItem value="notification">Notification</MenuItem>
              <MenuItem value="marketing">Marketing</MenuItem>
              <MenuItem value="transactional">Transactional</MenuItem>
              <MenuItem value="custom">Custom</MenuItem>
            </Select>
          </div>
        </div>

        <Button onClick={() => onOpenChange(false)} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={loading || !name.trim()}>
          {loading ? 'Saving to Payload...' : 'Save Template'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
