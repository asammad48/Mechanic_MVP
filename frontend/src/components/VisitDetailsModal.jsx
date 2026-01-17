import React from 'react';
import { Modal, Box, Typography, IconButton, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VisitDetailsPanel from './VisitDetailsPanel';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', md: 800 },
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 0,
  borderRadius: 2,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column'
};

const VisitDetailsModal = ({ open, handleClose, visitId, onUpdate }) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="visit-details-modal"
    >
      <Box sx={style}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <Typography variant="h6" component="h2">
            Visit Details
          </Typography>
          <IconButton onClick={handleClose} size="small" sx={{ color: 'inherit' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ p: 3, overflowY: 'auto' }}>
          <VisitDetailsPanel visitId={visitId} onUpdate={onUpdate} />
        </Box>
      </Box>
    </Modal>
  );
};

export default VisitDetailsModal;
