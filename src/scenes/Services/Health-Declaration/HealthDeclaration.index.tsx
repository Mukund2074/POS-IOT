import POSButton from '@/components/POS/Common/POSButton';
import { Box, Stack, Typography, CircularProgress, IconButton } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from 'i18next';
import { useHealthDeclarationTemplates } from '@/hooks/api/healthDeclaration';
import { GetApiHealthDeclarationTemplates200DataItemsItem } from '@/shared/api/models';
// @ts-ignore
import CustomDeleteModal from '@/components/deleteAlertModal';
import { api } from '@/utils/Api/POS';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import EditIcon from '@/assets/editProduct.svg';
import DeleteIcon from '@/assets/Delete.svg';
import POSHeading from '@/components/POS/Common/POSHeading';


export default function HealthDeclarationIndex() {
  const navigate = useNavigate();
  const { data, isLoading } = useHealthDeclarationTemplates();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const templates = data?.data?.items || [];

  const handleDeleteClick = (template: GetApiHealthDeclarationTemplates200DataItemsItem) => {
    setShowDeleteModal(true);
    setDeletingId(template.id);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingId(null);
  };

  const handleConfirmDelete = async () => {
    if (deletingId) {
      try {
        setIsDeleting(true);
        const response = await api.deleteApiHealthDeclarationTemplateId(deletingId);
        if (response?.statusCode === 200) {
          toast.success(t('Services.TemplateDeletedSuccessfully'));
          queryClient.invalidateQueries({ queryKey: ['health-declaration-templates'] });
        } else {
          toast.error(t('Services.TemplateDeletedFailed'));
        }
        handleCloseDeleteModal();
      } catch (error) {
        toast.error(t('Services.TemplateDeletedFailed'));
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Stack p={{ xs: 2, md: 4 }}>
      <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}>
        <POSButton
          variant="save"
          onClick={() => {
            navigate('/services/health-declaration-template/create');
          }}
          title={`+ ${t('Services.AddHealthDeclarationTemplate')}`}
        />
      </Stack>

      <Box
        sx={{
          display: 'flex',
          bgcolor: '#FFFFFF',
          borderRadius: '25px',
          flexDirection: 'column',
          width: '100%',
          padding: { xs: 2, md: 5 },
          mt: 2,
        }}
      >
        <POSHeading text={t('Services.HealthDeclarationTemplate')} />

        {isLoading ? (
          <Stack sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 12,
            height: '100%',
            width: '100%',
            borderRadius: '12px',
            border: '1px solid #E0E0E0',
            mt: 4
          }}>
            <CircularProgress color='inherit' />
          </Stack>
        ) : templates.length === 0 ? (
          <Stack sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 12,
            height: '100%',
            width: '100%',
            borderRadius: '12px',
            border: '1px solid #E0E0E0',
            mt: 4
          }}>
            <POSHeading text={t('Services.NoTemplatesFound')} fontSize={16} />
          </Stack>
        ) : (
          <Stack spacing={1} mt={2}>
            {templates.map((template) => (
              <Stack
                key={template.id}
                direction="row"
                alignItems="center"
                sx={{
                  px: 2,
                  py: 0.5,
                  borderRadius: '12px',
                  border: '1px solid #E0E0E0',
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    flex: 1,
                    fontWeight: 500,
                    color: '#333',
                  }}
                >
                  {template.name}
                </Typography>

                <Stack direction="row" alignItems="center" spacing={2} sx={{ ml: 'auto' }}>
                  <IconButton
                    disableFocusRipple
                    disableRipple
                    disableTouchRipple
                    onClick={() => navigate(`/services/health-declaration-template/${template.id}`)}>
                    <img
                      src={EditIcon}
                      alt="Edit"
                      style={{
                        cursor: 'pointer',
                        width: 20,
                        height: 20,
                      }}
                    />
                  </IconButton>
                  <IconButton
                    disableFocusRipple
                    disableRipple
                    disableTouchRipple
                    onClick={() => handleDeleteClick(template)}>
                    <img
                      src={DeleteIcon}
                      alt="Delete"
                      style={{
                        cursor: 'pointer',
                        width: 20,
                        height: 20,
                      }}
                    />
                  </IconButton>
                </Stack>
              </Stack>
            ))}
          </Stack>
        )}
      </Box>

      {showDeleteModal && deletingId && (
        <CustomDeleteModal
          open={showDeleteModal}
          handleClose={handleCloseDeleteModal}
          description={
            t('Services.TemplateDeletedDescription', { name: templates.find((template) => template.id === deletingId)?.name })
          }
          onClickDismiss={handleCloseDeleteModal}
          onClickConfirm={handleConfirmDelete}
          loading={isDeleting}
          confirmTitle={isDeleting ?
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
              <CircularProgress size={16} sx={{ color: '#fff' }} />
              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                {t("POS.Processing")}
              </Typography>
            </Stack> : t('Common.Confirm')}
        />
      )}
    </Stack>
  );
}
