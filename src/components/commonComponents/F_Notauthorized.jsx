import { Box, Container, Typography } from '@mui/material'

const Notauthorized = () => {
  return (
    <Container maxWidth="sm">
    <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        height="90vh"
        textAlign="center"
    >
        <Typography
            variant="h5" 
            color="text.secondary" 
            fontWeight={500}
        >
            Access Denied
        </Typography>
        <Typography variant="body1" color="text.disabled" mt={1}>
            You do not have permission to view this page.
        </Typography>
    </Box>
</Container>
  )
}

export default Notauthorized