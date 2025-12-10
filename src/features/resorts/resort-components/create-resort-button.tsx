import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import useRowExpansionAndMobile from '@/hooks/use-row-expansion';
import { type ResortConfig } from '@/types/constants';
import { CreateResortDialog } from './create-resort-modal';
import { createResortHandler } from '../resort-actions/resort-server-actions/create-resort/handler';

const CreateResortButton: React.FC = () => {
  const { isMobile } = useRowExpansionAndMobile();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

const handleCreateResort = async (
    id: number,
    name: string,
    config: ResortConfig,
    stripeSecretKey?: string,
    stripeWebhookSecret?: string
) => {
    const req = {
        id,
        name,
        config: JSON.stringify(config),
        stripeSecretKey: stripeSecretKey || undefined,
        stripeWebhookSecret: stripeWebhookSecret || undefined
    };

    try {
        await createResortHandler(req);
        toast.success('Resort created successfully!');
        handleCloseModal();
    } catch (error) {
        console.log('Failed to create resort:', error);
        toast.error('Unable to create resort. Please try again.');
    }
};
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpenModal}
        className={`${isMobile ? 'mb-3 w-full' : 'mt-1'}`}
      >
        <Plus className="size-4" aria-hidden="true" />
        Add a Resort
      </Button>
      <CreateResortDialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onCreate={handleCreateResort}
      />
    </>
  );
};

export default CreateResortButton;
